/// <reference types="@ccts/craftos-types" />
import { Region2 } from "@ccts/regions";
import { Vector2 } from "@ccts/vectors";
import { Node } from "../../types";
import DrawableBase, { Props as DrawableBaseProps } from "./DrawableBase";
import ElementBase from "./ElementBase";
export interface Props<C = Node> extends DrawableBaseProps<C> {
    position?: Vector2;
    size?: Vector2;
}
export default class Drawable extends DrawableBase {
    static props?: Props;
    private relativePosition;
    region: Region2;
    events: true;
    constructor(parent?: ElementBase);
    private get parentPosition();
    get position(): Vector2;
    get absolutePosition(): Vector2;
    get center(): Vector2;
    get absoluteCenter(): Vector2;
    get size(): Vector2;
    set position(position: Vector2);
    set size(size: Vector2);
    __defaultProps<C = Node>(): Props<C>;
    __updateProps(props: Props): void;
    beforeDraw(window: Window): void;
}
