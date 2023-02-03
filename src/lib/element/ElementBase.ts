import { BaseProps } from "../../types";
import EventEmitter from "../events/EventEmitter";

export default class ElementBase extends EventEmitter {
	private static nextId: number = 0;
	static props?: BaseProps;

	public parent?: ElementBase;
	public children: ElementBase[] = [];
	public id: number;
	private _initialized: boolean = false;
	private _destroyed: boolean = false;

	constructor(parent?: ElementBase) {
		super();

		this.id = ElementBase.nextId++;
		if (parent) parent.add(this);
	}

	get destroyed() {
		return this._destroyed;
	}

	public add(element: ElementBase) {
		if (element.parent == this && this.children.includes(element)) return;
		if (element.parent) {
			element.parent.remove(element);
		}
		this.children.push(element);
		element.parent = this;

		this.emit("childAdded", element);
	}

	public remove(element: ElementBase) {
		if (!element) return;

		this.children = this.children.filter((child) => {
			if (child === element) {
				child.destroy();
				this.emit("childRemoved", child);
				return false;
			}
			return true;
		});
	}

	public removeAllChildren() {
		this.children.forEach((child) => {
			this.remove(child);
		});
	}

	public destroy() {
		this.parent = undefined;
		this.removeAllListeners();
		this._destroyed = true;
		this.removeAllChildren();
	}

	get initialized() {
		return this._initialized;
	}

	__defaultProps(): BaseProps {
		return {};
	}

	__updateProps(props: BaseProps) {
		this._initialized = true;
	}
}
