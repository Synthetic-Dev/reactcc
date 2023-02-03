/// <reference types="@ccts/craftos-types" />
import { Vector2 } from "@ccts/vectors";
import DrawableBase, { Props as DrawableBaseProps } from "../lib/element/DrawableBase";
import ElementBase from "../lib/element/ElementBase";
interface Props<C = undefined> extends DrawableBaseProps<C> {
    from: Vector2;
    to: Vector2;
    color?: Color;
}
export default class Line extends DrawableBase {
    static props?: Props;
    private from;
    private to;
    private color;
    constructor(parent?: ElementBase);
    __defaultProps<C = undefined>(): Props<C>;
    __updateProps(props: Props): void;
    beforeDraw(window: Window): void;
    draw(window: Window): void;
}
export {};
