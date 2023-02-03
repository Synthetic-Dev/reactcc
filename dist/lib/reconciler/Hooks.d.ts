/// <reference types="@typescript-to-lua/language-extensions" />
import { INTERNAL } from "../../symbols";
import { EffectCallback, DependencyList, Context, Dispatch, SetStateAction, Reducer, ReducerState, ReducerAction, MemoCallback } from "../../types";
import Reconciler from ".";
import { EffectHookExecution, Fibre } from "./types";
export default class Hooks {
    private reconciler;
    fibre: Fibre;
    index: number;
    constructor(reconciler: Reconciler);
    private findOldHook;
    private createStateHook;
    private createEffectHook;
    private createMemoHook;
    private createContextHook;
    useState<T = any>(initial: T, hookName?: string): LuaMultiReturn<[T, Dispatch<SetStateAction<T>>]>;
    useIncrement(initial?: number): LuaMultiReturn<[number, () => void]>;
    useReducer<R extends Reducer<any, any>, I>(reducer: R, initialValueOrArg: I | (I & ReducerState<R>), init?: (arg: I | (I & ReducerState<R>)) => ReducerState<R>): LuaMultiReturn<[ReducerState<R>, Dispatch<ReducerAction<R>>]>;
    useEffect<F extends EffectCallback>(effect: F, deps?: DependencyList): void;
    useDeferredEffect<F extends EffectCallback>(effect: F, deps?: DependencyList): void;
    useContext<C extends Context<any>, T = C[typeof INTERNAL]["defaultValue"]>(context: C): T;
    useMemo<F extends MemoCallback>(compute: F, deps?: DependencyList): ReturnType<F>;
    useCallback<F extends Function>(callback: F, deps?: DependencyList): F;
    runEffects(fibre: Fibre, execution?: EffectHookExecution): void;
    cancelEffects(fibre: Fibre, execution?: EffectHookExecution): void;
    hasDeferredEffects(fibre: Fibre): boolean;
}
