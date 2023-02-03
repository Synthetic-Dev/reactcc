/// <reference types="@ccts/craftos-types" />
import { Vector2 } from "@ccts/vectors";
import DrawableElement, { Props as DrawableElementProps } from "../lib/element/Element";
import ElementBase from "../lib/element/ElementBase";
interface Props<C = undefined> extends DrawableElementProps<C> {
    text?: string | number;
    textColor?: Color;
}
export default class TextElement extends DrawableElement {
    static props?: Props;
    text: string;
    textColor: Color;
    textOffset: Vector2;
    constructor(parent?: ElementBase);
    __defaultProps<C = undefined>(): Props<C>;
    __updateProps(props: Props): void;
    beforeDraw(window: Window): void;
    draw(window: Window): void;
}
export {};
