import { BaseProps } from "../../types";
import EventEmitter from "../events/EventEmitter";
export default class ElementBase extends EventEmitter {
    private static nextId;
    static props?: BaseProps;
    parent?: ElementBase;
    children: ElementBase[];
    id: number;
    private _initialized;
    private _destroyed;
    constructor(parent?: ElementBase);
    get destroyed(): boolean;
    add(element: ElementBase): void;
    remove(element: ElementBase): void;
    removeAllChildren(): void;
    destroy(): void;
    get initialized(): boolean;
    __defaultProps(): BaseProps;
    __updateProps(props: BaseProps): void;
}
