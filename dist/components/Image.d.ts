/// <reference types="@ccts/craftos-types" />
import DrawableElement, { Props as DrawableElementProps } from "../lib/element/Element";
import ElementBase from "../lib/element/ElementBase";
import { ImageFormat, Node } from "../types";
export declare const IMAGE_FORMATS: {
    bimg: boolean;
    bbf: boolean;
};
interface Props<C = Node> extends DrawableElementProps<C> {
    src: string;
    format?: ImageFormat;
    allowPalette?: boolean;
    frame?: number;
    afterLastFrame?: () => void;
}
export default class Image extends DrawableElement {
    static props?: Props;
    src: string;
    format: ImageFormat;
    allowPalette: boolean;
    private blitLines;
    private palette;
    private frame;
    private handle?;
    constructor(parent?: ElementBase);
    __defaultProps<C = Node>(): Props<C>;
    __updateProps(props: Props): void;
    beforeDraw(window: Window): void;
    draw(window: Window): void;
}
export {};
