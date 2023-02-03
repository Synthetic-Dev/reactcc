/// <reference types="@ccts/craftos-types" />
import { MouseEvent } from "@ccts/events";
import { Node } from "../../types";
import Drawable, { Props as DrawableProps } from "./Drawable";
import ElementBase from "./ElementBase";
export interface Props<C = Node> extends DrawableProps<C> {
    bgColor?: Color;
    onClick?: (event: MouseEvent) => void;
    onClickEnd?: (event: MouseEvent) => void;
    onLeftClick?: (event: MouseEvent) => void;
    onRightClick?: (event: MouseEvent) => void;
    onMiddleClick?: (event: MouseEvent) => void;
    onScroll?: (event: MouseEvent) => void;
    onDrag?: (event: MouseEvent) => void;
    onMonitorTouch?: (event: MouseEvent) => void;
}
export default class DrawableElement extends Drawable {
    static props?: Props;
    bgColor: Color;
    constructor(parent?: ElementBase);
    __defaultProps<C = Node>(): Props<C>;
    __updateProps(props: Props): void;
    beforeDraw(window: Window): void;
}
