/// <reference types="@ccts/craftos-types" />
/// <reference types="@typescript-to-lua/language-extensions" />
import Renderer from "./lib/Renderer";
import { ElementChildren, ElementType, Fragment, Props, EffectCallback, DependencyList, Context, Reducer, ReducerState, Children, Node, MemoCallback } from "./types";
import Reconciler from "./lib/reconciler";
import { INTERNAL } from "./symbols";
import * as _events from "@ccts/events";
declare function createElement<T extends ElementType>(type: T, props?: Props<T>, ...children: ElementChildren<T>[]): Node;
declare function createTextElement(text: string | number): Node;
/**
 * The short form of creating a fragment using `createElement()`:
 * ```ts
 * ReactCC.createElement(ReactCC.Fragment, null, ...children)
 * ```
 */
declare function createFragment(...children: Children): Node;
declare function createContext<T = any>(defaultValue?: T): Context<T>;
type Tree = {
    [INTERNAL]: {
        renderer: Renderer;
        reconciler: Reconciler;
        monitorSide: string;
    };
};
declare function build(this: void, element: Node, screen: ITerminal, monitorSide?: string): Tree;
declare function destroy(this: void, ...trees: Tree[]): void;
declare function render(this: void, ...trees: Tree[]): any[];
declare function update(this: void, tree: Tree, element: Node): void;
declare function processEvents(this: void, events: typeof _events, ...trees: Tree[]): void;
declare const ReactCC: {
    createElement: typeof createElement;
    createTextElement: typeof createTextElement;
    createFragment: typeof createFragment;
    createContext: typeof createContext;
    build: typeof build;
    render: typeof render;
    update: typeof update;
    destroy: typeof destroy;
    processEvents: typeof processEvents;
    Fragment: Fragment;
};
export default ReactCC;
declare function useState<T = any>(this: void, initial?: T): LuaMultiReturn<[T, import("./types").Dispatch<import("./types").SetStateAction<T>>]>;
declare function useIncrement(this: void, initial?: number): LuaMultiReturn<[number, () => void]>;
declare function useReducer<R extends Reducer<any, any>, I>(this: void, reducer: R, initialValueOrArg: I | (I & ReducerState<R>), init?: (arg: I | (I & ReducerState<R>)) => ReducerState<R>): LuaMultiReturn<[ReducerState<R>, import("./types").Dispatch<import("./types").ReducerAction<R>>]>;
declare function useEffect(this: void, effect: EffectCallback, deps?: DependencyList): void;
declare function useDeferredEffect(this: void, effect: EffectCallback, deps?: DependencyList): void;
declare function useMemo<F extends MemoCallback>(this: void, compute: F, deps?: DependencyList): ReturnType<F>;
declare function useCallback<F extends Function>(this: void, callback: F, deps?: DependencyList): F;
declare function useContext<C extends Context<any>>(this: void, context: C): C[typeof INTERNAL]["defaultValue"];
export { useState, useIncrement, useReducer, useEffect, useDeferredEffect, useContext, useMemo, useCallback, };
