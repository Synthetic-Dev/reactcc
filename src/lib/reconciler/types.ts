import {
	Action,
	BaseProps,
	Children,
	Context,
	DependencyList,
	Destructor,
	EffectCallback,
	ElementType,
} from "../../types";
import ElementBase from "../element/ElementBase";

export enum Effect {
	PLACEMENT,
	UPDATE,
	DELETION,
	NONE,
}

export enum HookType {
	STATE,
	EFFECT,
	CONTEXT,
	MEMO,
}

export enum EffectHookExecution {
	IMMEDIATE,
	DEFER,
}

export type Hook = {
	name: string;
	type: HookType;
};

export type StateHook = Hook & {
	type: HookType.STATE;
	state: any;
	queue: Action[];
};

export type DepHook = Hook & {
	deps?: DependencyList;
};

export type EffectHook = DepHook & {
	type: HookType.EFFECT;
	execution: EffectHookExecution;
	effect?: EffectCallback;
	cancel?: Destructor | void;
};

export type MemoHook = DepHook & {
	type: HookType.MEMO;
	value: any;
};

export type ContextHook = Hook & {
	type: HookType.CONTEXT;
	context: Context;
};

export type Fibre = {
	type?: ElementType;
	element?: ElementBase;
	props: BaseProps & { children?: Children };
	parent?: Fibre;
	child?: Fibre;
	sibling?: Fibre;
	alternate?: Fibre;
	effect?: Effect;
	hooks?: Hook[];
};
