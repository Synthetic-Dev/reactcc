import Frame from "./components/Frame";
import Image, { IMAGE_FORMATS } from "./components/Image";
import Line from "./components/Line";
import Text from "./components/Text";
import ElementBase from "./lib/element/ElementBase";
import { INTERNAL } from "./symbols";

export enum TextAlignment {
	LEFT,
	CENTER,
	RIGHT,
}

export type ImageFormat = keyof typeof IMAGE_FORMATS;

export type bbfPalette = {
	[color: string]: number;
};

export type bimgPalette = {
	[color: Color]: [number] | [number, number, number];
};

export interface bimgFormat {
	version?: string;
	animation?: boolean;
	secondsPerFrame?: number;
	width?: number;
	height?: number;
	palette?: bimgPalette;
	title?: string;
	description?: string;
	author?: string;
	creator?: string;
	date?: string;
	[frame: number]: {
		duration?: number;
		palette?: bimgPalette;
		[line: number]: [string, string, string];
	};
}

export interface BaseProps {}

export interface PropsWithChildren<C = Node> extends BaseProps {
	children?: C;
}

export type Children = ElementInfo[];
export interface ElementInfo {
	type: ElementType;
	props: BaseProps & { children?: Children };
}
export type Node = ElementInfo | Children;

export interface ExoticObject {
	readonly $$typeof: symbol;
	[attribute: string | symbol]: any;
}

export interface ExoticComponent<P = {}> extends ExoticObject {
	props?: P;
	(props: P): ElementInfo;
}

export type Fragment = ExoticComponent<PropsWithChildren>;

interface ProviderProps<T> extends PropsWithChildren {
	value: T;
}

export type ConsumerChildNode<T> = (this: void, value: T) => Node;

interface ConsumerProps<T> extends PropsWithChildren<ConsumerChildNode<T>> {}

export interface Provider<T> extends ExoticComponent<ProviderProps<T>> {
	[INTERNAL]: {
		context: Context<T>;
	};
}
export interface Consumer<T> extends ExoticComponent<ConsumerProps<T>> {
	[INTERNAL]: {
		context: Context<T>;
		getValue: () => T;
	};
}

export interface Context<T = any> {
	Provider: Provider<T>;
	Consumer: Consumer<T>;
	displayName: string;
	[INTERNAL]: {
		valueStack: T[];
		defaultValue: T;
		globalName: string;
	};
}

export type Component = (props?: any) => ElementInfo;
export type ElementType =
	| typeof ElementBase
	| Component
	| Function
	| ExoticComponent
	| keyof JSX.IntrinsicElements;

export type Props<T extends ElementType> =
	| (T extends typeof ElementBase
			? T["props"]
			: T extends Component
			? Parameters<T>[0]
			: T extends keyof JSX.IntrinsicElements
			? JSX.IntrinsicElements[T]
			: T extends ExoticComponent
			? T["props"]
			: null)
	| {};

export type ElementChildren<T extends ElementType> =
	Props<T> extends PropsWithChildren<infer C> ? C : never;

export type Action = (...args: any[]) => any;
export type SetStateAction<S = any> = S | ((prevState: S) => S);
export type ReducerState<R extends Reducer<any, any>> = R extends Reducer<
	infer S,
	any
>
	? S
	: never;
export type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<
	any,
	infer A
>
	? A
	: never;
export type Reducer<S, A> = (prevState: S, action: A) => S;
export type Dispatch<A> = (value: A) => void;

export type Destructor = () => void;
export type EffectCallback = () => void | Destructor;
export type MemoCallback = () => any;
export type DependencyList = ReadonlyArray<unknown>;

export const INTRINSIC_ELEMENTS = {
	line: Line,
	frame: Frame,
	text: Text,
	image: Image,
};

export type IntrinsicElementClasses =
	typeof INTRINSIC_ELEMENTS[keyof typeof INTRINSIC_ELEMENTS];

declare global {
	namespace JSX {
		interface Element extends ElementInfo {}

		interface ElementAttributesProperty {
			props: {};
		}
		interface ElementChildrenAttribute {
			children: {};
		}

		interface IntrinsicAttributes extends BaseProps {}

		interface IntrinsicElements {
			/**
			 * ⚠ **This element does not respect relative positions** - This means it does not inherit the position of its parent
			 */
			line: Props<typeof Line>;
			frame: Props<typeof Frame>;
			text: Props<typeof Text>;
			image: Props<typeof Image>;
		}
	}
}
