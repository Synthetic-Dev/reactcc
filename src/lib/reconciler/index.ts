import {
	CONSUMER_SYMBOL,
	INTERNAL,
	INTERNAL_RECONCILER,
	PROVIDER_SYMBOL,
} from "../../symbols";
import {
	Component,
	ExoticObject,
	Provider,
	Children,
	Node,
	Consumer,
	Context,
	INTRINSIC_ELEMENTS,
	ConsumerChildNode,
	IntrinsicElementClasses,
	ElementType,
	ExoticComponent,
} from "../../types";
import ElementBase from "../element/ElementBase";
import Renderer from "../Renderer";
import Hooks from "./Hooks";
import { Fibre, Effect, EffectHookExecution } from "./types";

const propFilters = {
	isEvent: (key: string) => key.startsWith("on"),
	isProperty: (key: string) =>
		key !== "children" && !propFilters.isEvent(key),
	isNew: (prev: Fibre["props"], next: Fibre["props"]) => (key: string) =>
		prev[key] !== next[key],
	isGone: (prev: Fibre["props"], next: Fibre["props"]) => (key: string) =>
		!(key in next),
	isChanged: (prev: Fibre["props"], next: Fibre["props"]) => (key: string) =>
		propFilters.isGone(prev, next)(key) ||
		propFilters.isNew(prev, next)(key),
};

function isExoticType(type: ElementType): type is ExoticComponent {
	return !!(
		type &&
		typeof type == "object" &&
		(type as ExoticObject).$$typeof
	);
}

export default class Reconciler {
	private currentVirtualRoot: Fibre;
	private wipVirtualRoot: Fibre;
	private deletions: Fibre[];
	private deferredEffects: Fibre[];
	private nextUnitOfWork: Fibre;

	public hooks: Hooks;
	public reconciling: boolean = false;
	public committing: boolean = false;
	public shouldReconcile: boolean = false;

	constructor() {
		this.hooks = new Hooks(this);
	}

	private updateElement(
		element: ElementBase,
		prevProps: Fibre["props"],
		nextProps: Fibre["props"]
	) {
		Object.keys(prevProps)
			.filter(propFilters.isEvent)
			.filter(propFilters.isChanged(prevProps, nextProps))
			.forEach((key) => {
				const eventName = key.toLowerCase().substring(2);
				element.removeListener(eventName, prevProps[key]);
			});

		const propsChanged = Object.keys(prevProps)
			.filter(propFilters.isProperty)
			.some(propFilters.isChanged(prevProps, nextProps));

		if (propsChanged || !element.initialized) {
			let defaultProps = element.__defaultProps();
			let props = { ...nextProps };
			Object.keys(defaultProps).forEach((key) => {
				let value = defaultProps[key];
				if (props[key] == null || props[key] == undefined)
					props[key] = value;
			});

			element.__updateProps(props);
		}

		Object.keys(nextProps)
			.filter(propFilters.isEvent)
			.filter(propFilters.isNew(prevProps, nextProps))
			.forEach((key) => {
				const eventName = key.toLowerCase().substring(2);
				element.addListener(eventName, nextProps[key]);
			});
	}

	private createElement(fibre: Fibre) {
		return new (fibre.type as typeof ElementBase)();
	}

	private reconcileChildren(wipFibre: Fibre, elements: Children) {
		let index = 0;
		let oldFibre: Fibre = wipFibre.alternate && wipFibre.alternate.child;
		let prevSibling: Fibre = null;

		while (index < elements.length || oldFibre != null) {
			const element = elements[index];
			let newFibre: Fibre = null;

			const sameType =
				oldFibre && element && element.type == oldFibre.type;

			if (sameType) {
				newFibre = {
					type: oldFibre.type,
					props: element.props,
					element: oldFibre.element,
					parent: wipFibre,
					alternate: oldFibre,
					effect: Effect.UPDATE,
				};
			}
			if (element && !sameType) {
				newFibre = {
					type: element.type,
					props: element.props,
					element: null,
					parent: wipFibre,
					alternate: null,
					effect: Effect.PLACEMENT,
				};
			}
			if (oldFibre && !sameType) {
				oldFibre.effect = Effect.DELETION;
				this.deletions.push(oldFibre);
			}

			if (oldFibre) {
				oldFibre = oldFibre.sibling;
			}

			if (index == 0) {
				wipFibre.child = newFibre;
			} else if (element) {
				prevSibling.sibling = newFibre;
			}

			prevSibling = newFibre;
			index++;
		}
	}

	private performUnitOfWork(fibre: Fibre): Fibre | null {
		if (isExoticType(fibre.type)) {
			this.updateExoticComponent(fibre);
		} else if (typeof fibre.type == "function") {
			this.updateFunctionalComponent(fibre);
		} else {
			this.updateHostComponent(fibre);
		}

		if (fibre.child) {
			return fibre.child;
		}
		let nextFibre = fibre;
		while (nextFibre) {
			if (nextFibre.sibling) {
				return nextFibre.sibling;
			}
			nextFibre = nextFibre.parent;

			// Remove a Provider's value from the context value stack
			if (
				nextFibre &&
				isExoticType(nextFibre.type) &&
				nextFibre.type.$$typeof == PROVIDER_SYMBOL
			) {
				const provider = nextFibre.type as Provider<any>;
				const context = provider[INTERNAL].context;
				context[INTERNAL].valueStack.shift();
			}
		}
		return null;
	}

	private updateHostComponent(fibre: Fibre) {
		if (!fibre.element) {
			fibre.element = this.createElement(fibre);
		}

		const children = fibre.props.children ?? [];
		this.reconcileChildren(fibre, children);
	}

	private updateExoticComponent(fibre: Fibre) {
		if (isExoticType(fibre.type))
			switch (fibre.type.$$typeof) {
				case PROVIDER_SYMBOL:
					// Add the Provider's value to the context's value stack for consumer use
					const provider = fibre.type as Provider<any>;
					const context = provider[INTERNAL].context;
					const props = fibre.props as Provider<any>["props"];
					context[INTERNAL].valueStack.unshift(props.value);
					break;
				case CONSUMER_SYMBOL:
					break;
				default:
					throw "An unknown Symbol or ExoticComponent appeared in fibre tree";
			}

		const children = fibre.props.children ?? [];
		this.reconcileChildren(fibre, children);
	}

	private updateFunctionalComponent(fibre: Fibre) {
		this.hooks.fibre = fibre;
		this.hooks.index = 0;
		fibre.hooks = [];

		const func = fibre.type as Function;
		// inject reconciler into function environment so we know which hooks to call
		const env = getfenv(func);
		env[INTERNAL_RECONCILER] = this;
		setfenv(func, env);

		// redirect `term` to the render's window so function component can use .getSize
		const renderer = this.wipVirtualRoot.element as Renderer;
		const prevWindow = term.redirect(renderer.getWindow());

		let result: Node;
		const parentType = fibre.parent ? fibre.parent.type : null;
		if (
			isExoticType(parentType) &&
			parentType.$$typeof == CONSUMER_SYMBOL
		) {
			const consumer = parentType as Consumer<any>;
			const value = consumer[INTERNAL].getValue();
			result = (func as ConsumerChildNode<any>)(value);
		} else {
			result = (func as Component)(fibre.props);
		}

		term.redirect(prevWindow);
		this.hooks.fibre = null;

		const children = Array.isArray(result) ? [...result] : [result];
		this.reconcileChildren(fibre, children);
	}

	private performWork() {
		if (this.reconciling) return;
		this.reconciling = true;

		while (this.nextUnitOfWork) {
			this.nextUnitOfWork = this.performUnitOfWork(this.nextUnitOfWork);
		}

		this.reconciling = false;
		if (!this.nextUnitOfWork && this.wipVirtualRoot) {
			this.commitRoot();
		}
	}

	private getComponentNameFromElement(element: ElementBase): string {
		if (!element) {
			return "?";
		}

		return element.constructor.name;
	}

	private getComponentNameFromFibre(fibre: Fibre): string {
		if (!fibre.type) {
			return this.getComponentNameFromElement(fibre.element);
		}

		function getContextName(context: Context) {
			return context.displayName ?? "Context";
		}

		if (isExoticType(fibre.type)) {
			let context: Context;
			switch (fibre.type.$$typeof) {
				case PROVIDER_SYMBOL:
					context = fibre.type[INTERNAL].context as Context;
					return `${getContextName(context)}.Provider`;
				case CONSUMER_SYMBOL:
					context = fibre.type[INTERNAL].context as Context;
					return `${getContextName(context)}.Consumer`;
				default:
					return "ExoticComponent";
			}
		}

		const intrinsicElementIndex = Object.values(INTRINSIC_ELEMENTS).indexOf(
			fibre.type as IntrinsicElementClasses
		);
		if (intrinsicElementIndex >= 0) {
			const key = Object.keys(INTRINSIC_ELEMENTS)[intrinsicElementIndex];
			return key;
		}

		if (typeof fibre.type == "function") {
			const parentType = fibre.parent ? fibre.parent.type : null;
			if (
				isExoticType(parentType) &&
				parentType.$$typeof == CONSUMER_SYMBOL
			) {
				return "ConsumerChildNode";
			}

			return "FuncNode";
		}

		return this.getComponentNameFromElement(fibre.element);
	}

	// private printFibreTree(fibre: Fibre, depth: number = 0) {
	// 	if (!fibre) return;

	// 	const tagName = this.getComponentNameFromFibre(fibre);

	// 	const tagDepth = depth;
	// 	const hasChild = !!fibre.child;
	// 	print(
	// 		" ".repeat(tagDepth) +
	// 			`<${tagName}>${hasChild ? "" : `</${tagName}>`}`
	// 	);

	// 	this.printFibreTree(fibre.child, tagDepth + 1);
	// 	if (hasChild) print(" ".repeat(tagDepth) + `</${tagName}>`);

	// 	this.printFibreTree(fibre.sibling, tagDepth);
	// }

	private commitRoot() {
		this.committing = true;
		this.deletions.forEach((fibre) => this.commitWork(fibre));
		this.commitWork(this.wipVirtualRoot.child);
		this.committing = false;

		this.deferredEffects.forEach((fibre) => {
			this.hooks.cancelEffects(fibre, EffectHookExecution.DEFER);
			this.hooks.runEffects(fibre, EffectHookExecution.DEFER);
		});

		this.currentVirtualRoot = this.wipVirtualRoot;
		this.wipVirtualRoot = null;

		// this.printFibreTree(this.currentVirtualRoot);
	}

	private commitWork(fibre: Fibre) {
		if (!fibre) return;

		let parentFibre = fibre.parent;
		while (!parentFibre.element) {
			parentFibre = parentFibre.parent;
		}

		const elementParent = parentFibre.element;
		const effect = fibre.effect ?? Effect.NONE;

		if (effect != Effect.NONE && this.hooks.hasDeferredEffects(fibre)) {
			this.deferredEffects.push(fibre);
		}

		switch (effect) {
			case Effect.PLACEMENT:
				if (fibre.element != null) {
					elementParent.add(fibre.element);
					this.updateElement(
						fibre.element as ElementBase,
						{},
						fibre.props
					);
				}
				this.hooks.runEffects(fibre);
				break;
			case Effect.UPDATE:
				this.hooks.cancelEffects(fibre);
				if (fibre.element != null) {
					this.updateElement(
						fibre.element as ElementBase,
						fibre.alternate.props,
						fibre.props
					);
				}
				this.hooks.runEffects(fibre);
				break;
			case Effect.DELETION:
				this.hooks.cancelEffects(fibre);
				this.commitDeletion(fibre, elementParent);
				return;
		}

		this.commitWork(fibre.child);
		this.commitWork(fibre.sibling);
	}

	private commitDeletion(fibre: Fibre, elementParent: ElementBase) {
		if (fibre.element) {
			elementParent.remove(fibre.element);
		} else {
			this.commitDeletion(fibre.child, elementParent);
		}
	}

	private beginWork(root: Fibre) {
		this.wipVirtualRoot = root;
		this.deletions = [];
		this.deferredEffects = [];
		this.nextUnitOfWork = this.wipVirtualRoot;

		this.performWork();
	}

	reconcile(element: Node, renderer: Renderer) {
		this.beginWork({
			element: renderer,
			props: {
				children: Array.isArray(element) ? [...element] : [element],
			},
			alternate: this.currentVirtualRoot,
		});
	}

	update() {
		if (!this.shouldReconcile) return;
		this.shouldReconcile = false;

		this.beginWork({
			element: this.currentVirtualRoot.element,
			props: this.currentVirtualRoot.props,
			alternate: this.currentVirtualRoot,
		});
	}
}
