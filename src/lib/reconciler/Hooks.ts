import { INTERNAL } from "../../symbols";
import {
	EffectCallback,
	DependencyList,
	Context,
	Dispatch,
	SetStateAction,
	Action,
	Reducer,
	ReducerState,
	ReducerAction,
	Destructor,
	MemoCallback,
} from "../../types";
import Reconciler from ".";
import {
	StateHook,
	EffectHook,
	ContextHook,
	Effect,
	EffectHookExecution,
	HookType,
	Fibre,
	Hook,
	MemoHook,
} from "./types";

const haveDepsChanged = (prevDeps: DependencyList, nextDeps: DependencyList) =>
	!prevDeps ||
	!nextDeps ||
	prevDeps.length !== nextDeps.length ||
	prevDeps.some((dep, index) => dep !== nextDeps[index]);

export default class Hooks {
	public fibre: Fibre;
	public index: number;

	constructor(private reconciler: Reconciler) {}

	private findOldHook(name: string, type: HookType): Hook {
		const fibre = this.fibre;
		const hookIndex = this.index;

		const oldHook =
			fibre.alternate &&
			fibre.alternate.hooks &&
			fibre.alternate.hooks[hookIndex];

		if (oldHook && (oldHook.name != name || oldHook.type != type)) {
			error(
				`Hook "${name}" is called conditionally. Hooks must be called in the exact same order in every component render.`,
				4
			);
		}

		return oldHook;
	}

	private createStateHook(name: string, initial?: any) {
		const fibre = this.fibre;
		const hookIndex = this.index;

		const oldHook = this.findOldHook(name, HookType.STATE) as StateHook;

		const hook: StateHook = {
			name,
			type: HookType.STATE,
			state: oldHook ? oldHook.state : initial,
			queue: [],
		};

		const actions = oldHook ? oldHook.queue : hook.queue;
		actions.forEach((action) => {
			hook.state = action(hook.state);
		});

		fibre.hooks[hookIndex] = hook;
		this.index++;

		return hook;
	}

	private createEffectHook(
		name: string,
		execution: EffectHookExecution,
		effect: EffectCallback,
		deps: DependencyList
	) {
		const fibre = this.fibre;
		const hookIndex = this.index;

		const oldHook = this.findOldHook(name, HookType.EFFECT) as EffectHook;

		const depsChanged = haveDepsChanged(
			oldHook ? oldHook.deps : undefined,
			deps
		);

		const hook: EffectHook = {
			name,
			type: HookType.EFFECT,
			execution: execution,
			effect: depsChanged ? effect : null,
			cancel: depsChanged && oldHook && oldHook.cancel,
			deps,
		};

		fibre.hooks[hookIndex] = hook;
		this.index++;

		return hook;
	}

	private createMemoHook(
		name: string,
		compute: MemoCallback,
		deps: DependencyList
	) {
		const fibre = this.fibre;
		const hookIndex = this.index;

		const oldHook = this.findOldHook(name, HookType.MEMO) as MemoHook;

		const depsChanged = haveDepsChanged(
			oldHook ? oldHook.deps : undefined,
			deps
		);

		let value = oldHook ? oldHook.value : undefined;
		if (value == undefined || depsChanged) {
			value = compute();
		}

		const hook: MemoHook = {
			name,
			type: HookType.MEMO,
			value: value,
			deps,
		};

		fibre.hooks[hookIndex] = hook;
		this.index++;

		return hook;
	}

	private createContextHook(name: string, context: Context) {
		const fibre = this.fibre;
		const hookIndex = this.index;

		const oldHook = this.findOldHook(name, HookType.CONTEXT) as ContextHook;

		if (oldHook && oldHook.context != context) {
			error(
				`Hook "${name}" is called with a conditional context. Context hooks must be called with the same context each render.`,
				3
			);
		}

		const hook: ContextHook = {
			name,
			type: HookType.CONTEXT,
			context: oldHook ? oldHook.context : context,
		};

		fibre.hooks[hookIndex] = hook;
		this.index++;

		return hook;
	}

	public useState<T = any>(
		initial: T,
		hookName: string = "useState"
	): LuaMultiReturn<[T, Dispatch<SetStateAction<T>>]> {
		const fibre = this.fibre;
		const hook = this.createStateHook(hookName, initial);

		const setState: Dispatch<SetStateAction<T>> = (value) => {
			if (this.reconciler.reconciling) {
				error(
					"setState(...): Cannot update during an existing state transition (such as within a component's body). Components should be a pure function of props and initial state.",
					2
				);
			}
			if (fibre.effect == Effect.DELETION) {
				error(
					"setState(...): Cannot perform a state update on an unmounted component.",
					2
				);
			}

			let action: Action;
			if (typeof value != "function") {
				action = () => {
					return value as T;
				};
			} else {
				action = value as Action;
			}

			hook.queue.push(action);
			this.reconciler.shouldReconcile = true;
		};

		return $multi(hook.state as T, setState);
	}

	public useIncrement(
		initial: number = 0
	): LuaMultiReturn<[number, () => void]> {
		let [state, setState] = this.useState(initial, "useIncrement");
		return $multi(state, () => {
			setState(state + 1);
		});
	}

	public useReducer<R extends Reducer<any, any>, I>(
		reducer: R,
		initialValueOrArg: I | (I & ReducerState<R>),
		init?: (arg: I | (I & ReducerState<R>)) => ReducerState<R>
	): LuaMultiReturn<[ReducerState<R>, Dispatch<ReducerAction<R>>]> {
		if (!init) {
			init = (arg: I) => {
				return arg as ReducerState<R>;
			};
		}

		const fibre = this.fibre;
		const hook = this.createStateHook(
			"useReducer",
			init(initialValueOrArg)
		);

		const dispatch: Dispatch<ReducerAction<R>> = (value) => {
			if (this.reconciler.reconciling) {
				error(
					"dispatch(...): Cannot update during an existing state transition (such as within a component's body). Components should be a pure function of props and initial state.",
					2
				);
			}
			if (fibre.effect == Effect.DELETION) {
				error(
					"dispatch(...): Cannot perform a state update on an unmounted component.",
					2
				);
			}

			hook.queue.push((oldState: ReducerState<R>) => {
				return reducer(oldState, value);
			});
			this.reconciler.shouldReconcile = true;
		};

		return $multi(hook.state, dispatch);
	}

	public useEffect<F extends EffectCallback>(
		effect: F,
		deps?: DependencyList
	) {
		this.createEffectHook(
			"useEffect",
			EffectHookExecution.IMMEDIATE,
			effect,
			deps
		);
	}

	public useDeferredEffect<F extends EffectCallback>(
		effect: F,
		deps?: DependencyList
	) {
		this.createEffectHook(
			"useDeferredEffect",
			EffectHookExecution.DEFER,
			effect,
			deps
		);
	}

	public useContext<
		C extends Context<any>,
		T = C[typeof INTERNAL]["defaultValue"]
	>(context: C): T {
		const hook = this.createContextHook("useContext", context);
		return hook.context.Consumer[INTERNAL].getValue();
	}

	public useMemo<F extends MemoCallback>(
		compute: F,
		deps?: DependencyList
	): ReturnType<F> {
		const hook = this.createMemoHook("useMemo", compute, deps);
		return hook.value;
	}

	public useCallback<F extends Function>(
		callback: F,
		deps?: DependencyList
	): F {
		const hook = this.createMemoHook(
			"useCallback",
			() => {
				return callback;
			},
			deps
		);
		return hook.value;
	}

	public runEffects(
		fibre: Fibre,
		execution: EffectHookExecution = EffectHookExecution.IMMEDIATE
	) {
		if (!fibre.hooks) return;

		fibre.hooks
			.filter((hook) => hook.type == HookType.EFFECT)
			.filter(
				(hook: EffectHook) => hook.execution == execution && hook.effect
			)
			.forEach((effectHook: EffectHook) => {
				effectHook.cancel = effectHook.effect();
			});
	}

	public cancelEffects(
		fibre: Fibre,
		execution: EffectHookExecution = EffectHookExecution.IMMEDIATE
	) {
		let hooks =
			fibre.alternate && fibre.alternate.hooks
				? fibre.alternate.hooks
				: fibre.hooks;
		hooks ??= [];

		hooks
			.filter((hook) => hook.type == HookType.EFFECT)
			.filter(
				(hook: EffectHook) => hook.execution == execution && hook.cancel
			)
			.forEach((effectHook: EffectHook) => {
				(effectHook.cancel as Destructor)();
			});
	}

	public hasDeferredEffects(fibre: Fibre) {
		return (
			fibre.hooks &&
			fibre.hooks.some(
				(hook) =>
					hook.type == HookType.EFFECT &&
					(hook as EffectHook).execution == EffectHookExecution.DEFER
			)
		);
	}
}
