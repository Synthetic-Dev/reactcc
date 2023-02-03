/// <reference types="@ccts/craftos-types" />
import { Node, PropsWithChildren } from "../../types";
import ElementBase from "./ElementBase";
export interface Props<C = Node> extends PropsWithChildren<C> {
    zIndex?: number;
    visible?: boolean;
}
export default class DrawableBase extends ElementBase {
    static props?: Props;
    zIndex: number;
    visible: boolean;
    isDirty: boolean;
    events: boolean;
    constructor(parent?: ElementBase);
    __defaultProps<C = Node>(): Props<C>;
    __updateProps(props: Props): void;
    makeDirty(emit?: boolean): void;
    clean(): void;
    beforeDraw(window: Window): void;
    draw(window: Window): void;
    afterDrawn(window: Window): void;
}
