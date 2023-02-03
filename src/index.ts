import Renderer from "./lib/Renderer";
import {
	ElementChildren,
	ElementInfo,
	ElementType,
	Fragment,
	Props,
	EffectCallback,
	DependencyList,
	Context,
	Provider,
	Consumer,
	Reducer,
	ReducerState,
	ExoticObject,
	Children,
	Node,
	INTRINSIC_ELEMENTS,
	MemoCallback,
} from "./types";
import Reconciler from "./lib/reconciler";
import {
	CONSUMER_SYMBOL,
	FRAGMENT_SYMBOL,
	INTERNAL,
	INTERNAL_RECONCILER,
	PROVIDER_SYMBOL,
} from "./symbols";
import * as _events from "@ccts/events";
import { Vector2 } from "@ccts/vectors";
import Hooks from "./lib/reconciler/Hooks";
import * as expect from "cc/expect";

expect;

function createExoticComponent(
	this: void,
	symbol: symbol,
	properties: Object = {}
): ExoticObject {
	return Object.assign(
		{
			$$typeof: symbol,
		},
		properties
	);
}

function sanitizeChildren(this: void, children: unknown[]): Children {
	let sanitized = [];
	children.forEach((child) => {
		if (Array.isArray(child)) {
			sanitized = sanitized.concat(child);
			return;
		}

		if (typeof child === "function") {
			sanitized.push(createElement(child));
			return;
		}

		if (typeof child === "object") {
			sanitized.push(child);
			return;
		}

		sanitized.push(createTextElement((child as string).toString()));
	});
	return sanitized;
}

function createElement<T extends ElementType>(
	type: T,
	props?: Props<T>,
	...children: ElementChildren<T>[]
): Node {
	if (typeof type === "object" && (type as ExoticObject).$$typeof) {
		switch ((type as ExoticObject).$$typeof) {
			case FRAGMENT_SYMBOL:
				return createFragment(...(children as ElementInfo[]));
			case CONSUMER_SYMBOL:
				break;
			case PROVIDER_SYMBOL:
				break;
			default:
				error(
					"Unknown Symbol or ExoticComponent passed into ReactCC.createElement",
					2
				);
		}
	}

	if (typeof type == "string") {
		type = INTRINSIC_ELEMENTS[type as string];
	}

	props ??= {};
	if (typeof props !== "object") {
		error("Props must be a table of keys and values", 2);
	}

	return {
		type: type,
		props: {
			...props,
			children: sanitizeChildren(children),
		},
	};
}

function createTextElement(text: string | number) {
	return createElement("text", {
		text: `${text}`,
	});
}

/**
 * The short form of creating a fragment using `createElement()`:
 * ```ts
 * ReactCC.createElement(ReactCC.Fragment, null, ...children)
 * ```
 */
function createFragment(...children: Children): Node {
	return [...sanitizeChildren(children)];
}

function createContext<T = any>(defaultValue?: T): Context<T> {
	let context: Context = {
		Provider: null,
		Consumer: null,
		displayName: null,

		[INTERNAL]: {
			valueStack: [defaultValue],
			defaultValue: defaultValue,
			globalName: null,
		},
	};

	context.Provider = createExoticComponent(PROVIDER_SYMBOL, {
		[INTERNAL]: {
			context,
		},
	}) as Provider<T>;

	context.Consumer = createExoticComponent(CONSUMER_SYMBOL, {
		[INTERNAL]: {
			context,
			getValue: () => {
				return context[INTERNAL].valueStack[0];
			},
		},
	}) as Consumer<T>;

	return context as Context;
}

type Tree = {
	[INTERNAL]: {
		renderer: Renderer;
		reconciler: Reconciler;
		monitorSide: string;
	};
};

function build(
	this: void,
	element: Node,
	screen: ITerminal,
	monitorSide: string = null
): Tree {
	const renderer = new Renderer(screen);
	const reconciler = new Reconciler();
	reconciler.reconcile(element, renderer);

	return {
		[INTERNAL]: {
			renderer,
			reconciler,
			monitorSide,
		},
	};
}

function destroy(this: void, ...trees: Tree[]) {
	for (const tree of trees) {
		const renderer = tree[INTERNAL].renderer;
		renderer.clear();
	}
}

function render(this: void, ...trees: Tree[]) {
	const treesRerendered = [];
	for (const tree of trees) {
		const renderer = tree[INTERNAL].renderer;
		const reconciler = tree[INTERNAL].reconciler;

		reconciler.update();
		const drawn = renderer.draw();
		treesRerendered.push(drawn);
	}
	return treesRerendered;
}

function update(this: void, tree: Tree, element: Node) {
	const renderer = tree[INTERNAL].renderer;
	const reconciler = tree[INTERNAL].reconciler;
	reconciler.reconcile(element, renderer);
}

interface InternalEvent {
	name: string;
	flags: {
		[flag: string]: true | undefined;
	};
	rawFlags: string[];
}

function createInternalEvent(
	this: void,
	name: string,
	flags: string[] = []
): InternalEvent {
	const flagMap = {};
	flags.forEach((flag) => {
		flagMap[flag] = true;
	});
	return {
		name,
		flags: flagMap,
		rawFlags: flags,
	};
}

const INTERNAL_EVENT_MAP: {
	[eventName: string]: InternalEvent;
} = {
	mouse_click: createInternalEvent("click", ["mouse", "click"]),
	mouse_up: createInternalEvent("clickend", ["mouse"]),
	mouse_scroll: createInternalEvent("scroll", ["mouse"]),
	mouse_drag: createInternalEvent("draw", ["mouse"]),
	monitor_touch: createInternalEvent("monitortouch", ["mouse", "monitor"]),
	key: createInternalEvent("keydown", ["keyboard"]),
	key_up: createInternalEvent("keyup", ["keyboard"]),
	paste: createInternalEvent("paste", ["keyboard", "paste"]),
	term_resize: createInternalEvent("resize"),
};
const MOUSE_BUTTONS = ["left", "right", "middle"];

function onEvent(
	eventName: string,
	rawEvent: _events.IEvent,
	...trees: Tree[]
) {
	if (eventName == "term_resize") {
		trees.forEach((tree) => {
			const renderer = tree[INTERNAL].renderer;

			const window = renderer.getWindow();
			const [x, y] = window.getPosition();
			const [w, h] = renderer.screen.getSize();
			window.reposition(x, y, w, h);

			renderer.makeDirty();
		});
		return;
	}

	const internalEvent = INTERNAL_EVENT_MAP[eventName];
	if (!internalEvent) return;

	if (internalEvent.flags["mouse"]) {
		const event = rawEvent as _events.MouseEvent;
		const pos = new Vector2(event.x, event.y);

		const events = [internalEvent.name];

		if (internalEvent.flags["monitor"]) {
			events.push("click");
		}
		const button = internalEvent.flags["monitor"]
			? "left"
			: internalEvent.flags["click"]
			? MOUSE_BUTTONS[event.button - 1]
			: null;
		if (button) {
			events.push(button + "click");
		}

		trees.forEach((tree) => {
			const renderer = tree[INTERNAL].renderer;
			const monitorSide = tree[INTERNAL].monitorSide;
			const isMonitor = !!monitorSide;

			if (!!internalEvent.flags["monitor"] != isMonitor) return;
			if (isMonitor && event.side != monitorSide) return;

			renderer.emitEvents(events, event, pos);
		});
	} else if (internalEvent.flags["keyboard"]) {
		const event = rawEvent as _events.KeyEvent;

		trees.forEach((tree) => {
			const renderer = tree[INTERNAL].renderer;
			// const monitorSide = tree[INTERNAL].monitorSide;
			// const isMonitor = !!monitorSide;

			renderer.emit(internalEvent.name, event);
		});
	}
}

function processEvents(this: void, events: typeof _events, ...trees: Tree[]) {
	parallel.waitForAny(
		...Object.keys(INTERNAL_EVENT_MAP).map((eventName) => {
			return () => {
				const event = events.pullEventRaw(eventName);
				onEvent(eventName, event, ...trees);
			};
		})
	);
}

const ReactCC = {
	createElement,
	createTextElement,
	createFragment,
	createContext,
	build,
	render,
	update,
	destroy,
	processEvents,
	Fragment: createExoticComponent(FRAGMENT_SYMBOL) as Fragment,
};

export default ReactCC;

function throwTopLevelHookError(this: void, hook: string) {
	error(
		`Hook ${hook}() cannot be called at the top level. Hooks must be called in a function component or a custom Hook function.`,
		3
	);
}

function getHooks(this: void, hook: string): Hooks {
	const env = getfenv(3);
	const reconciler = env[INTERNAL_RECONCILER] as Reconciler;
	if (!reconciler) {
		throwTopLevelHookError(hook);
	}

	return reconciler.hooks;
}

function useState<T = any>(this: void, initial?: T) {
	const hooks = getHooks("useState");
	return hooks.useState<T>(initial);
}

function useIncrement(this: void, initial?: number) {
	const hooks = getHooks("useIncrement");
	return hooks.useIncrement(initial);
}

function useReducer<R extends Reducer<any, any>, I>(
	this: void,
	reducer: R,
	initialValueOrArg: I | (I & ReducerState<R>),
	init?: (arg: I | (I & ReducerState<R>)) => ReducerState<R>
) {
	const hooks = getHooks("useReducer");
	return hooks.useReducer<R, I>(reducer, initialValueOrArg, init);
}

function useEffect(this: void, effect: EffectCallback, deps?: DependencyList) {
	const hooks = getHooks("useEffect");
	hooks.useEffect(effect, deps);
}

function useDeferredEffect(
	this: void,
	effect: EffectCallback,
	deps?: DependencyList
) {
	const hooks = getHooks("useDeferredEffect");
	hooks.useDeferredEffect(effect, deps);
}

function useMemo<F extends MemoCallback>(
	this: void,
	compute: F,
	deps?: DependencyList
) {
	const hooks = getHooks("useMemo");
	return hooks.useMemo(compute, deps);
}

function useCallback<F extends Function>(
	this: void,
	callback: F,
	deps?: DependencyList
) {
	const hooks = getHooks("useCallback");
	return hooks.useCallback(callback, deps);
}

function useContext<C extends Context<any>>(this: void, context: C) {
	const hooks = getHooks("useContext");
	return hooks.useContext<C>(context);
}

export {
	useState,
	useIncrement,
	useReducer,
	useEffect,
	useDeferredEffect,
	useContext,
	useMemo,
	useCallback,
};
