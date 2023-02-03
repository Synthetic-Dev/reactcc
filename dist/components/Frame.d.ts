/// <reference types="@ccts/craftos-types" />
import DrawableElement from "../lib/element/Element";
import ElementBase from "../lib/element/ElementBase";
export default class Frame extends DrawableElement {
    constructor(parent?: ElementBase);
    draw(window: Window): void;
}
