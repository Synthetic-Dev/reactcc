/// <reference types="@ccts/craftos-types" />
import { Vector2 } from "@ccts/vectors";
import Drawable from "./element/Drawable";
import DrawableBase from "./element/DrawableBase";
import DrawableElement from "./element/Element";
import * as _events from "@ccts/events";
export default class Renderer extends Drawable {
    private renderBuffer;
    private monitoring;
    private window;
    readonly screen: ITerminal;
    lastClicked: DrawableElement;
    focus: DrawableElement;
    constructor(screen: ITerminal);
    private monitor;
    private childAdded;
    private childRemoved;
    private defaults;
    private _clear;
    getElements(): DrawableBase[];
    getWindow(): Window;
    draw(): boolean;
    clear(): void;
    emitEvents(events: string[], event: _events.IEvent, position?: Vector2): void;
}
