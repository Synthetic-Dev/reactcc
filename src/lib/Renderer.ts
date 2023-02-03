import { Vector2 } from "@ccts/vectors";
import Drawable from "./element/Drawable";
import DrawableBase from "./element/DrawableBase";
import DrawableElement from "./element/Element";
import Element from "./element/Element";
import ElementBase from "./element/ElementBase";
import * as _events from "@ccts/events";

type MonitorDetails = {
	addedListener: (this: void, child: Element) => void;
	removedListener: (this: void, child: Element) => void;
	dirtyListener: (this: void) => void;
};

function hasRegion(element: ElementBase): element is Drawable {
	return element instanceof Drawable;
}

export default class Renderer extends Drawable {
	private renderBuffer: DrawableBase[] = [];
	private monitoring: {
		[id: number]: MonitorDetails;
	} = [];
	private window: Window;
	readonly screen: ITerminal;

	public lastClicked: DrawableBase;
	public focus: DrawableElement;

	constructor(screen: ITerminal) {
		super();

		this.screen = screen;
		let [w, h] = screen.getSize();
		this.size = new Vector2(w, h);
		this.window = new Window(
			screen,
			this.position.x,
			this.position.y,
			this.size.x,
			this.size.y,
			true
		);

		this.monitor(this);
	}

	private monitor(element: ElementBase) {
		if (this.monitoring[element.id]) return;

		const details: MonitorDetails = {
			addedListener: (child: Element) => {
				this.childAdded(element, child);
			},
			removedListener: (child: Element) => {
				this.childRemoved(element, child);
			},
			dirtyListener: () => {
				this.makeDirty();
			},
		};

		element.on("childAdded", details.addedListener);
		element.on("childRemoved", details.removedListener);

		if (element instanceof DrawableBase) {
			element.on("dirty", details.dirtyListener);
		}

		this.monitoring[element.id] = details;
	}

	private childAdded(parent: ElementBase, child: ElementBase) {
		this.monitor(child);

		if (!(child instanceof DrawableBase)) return;

		while (parent && !(parent instanceof DrawableBase)) {
			parent = parent.parent;
		}

		let index = this.renderBuffer.indexOf(parent as DrawableBase);
		if (index < 0) {
			index = 0;
		}

		while (
			this.renderBuffer[index] &&
			this.renderBuffer[index].zIndex <= child.zIndex
		) {
			index++;
		}

		this.renderBuffer.splice(index, 0, child as DrawableBase);
		this.makeDirty();
	}

	private childRemoved(parent: ElementBase, child: ElementBase) {
		if (this.monitoring[child.id]) {
			const details = this.monitoring[child.id];
			child.off("childAdded", details.addedListener);
			child.off("childRemoved", details.removedListener);
			child.off("dirty", details.dirtyListener);

			delete this.monitoring[child.id];
		}

		if (child instanceof DrawableBase) {
			this.renderBuffer = this.renderBuffer.filter((e) => e !== child);
			this.makeDirty();
		}
	}

	private defaults() {
		term.setTextColor(colors.white);
		term.setBackgroundColor(colors.black);
		term.setCursorBlink(false);
		term.setCursorPos(1, 1);
	}

	private _clear() {
		this.defaults();
		term.clear();
	}

	getElements() {
		return this.renderBuffer;
	}

	getWindow() {
		return this.window;
	}

	draw() {
		if (!this.isDirty) return false;

		const prevWindow = term.redirect(this.window);
		this.window.setVisible(false);
		this._clear();
		for (const element of this.renderBuffer) {
			if (element.visible) {
				element.beforeDraw(this.window);
				element.draw(this.window);
				element.clean();
			}
		}
		this.clean();
		this.window.setVisible(true);
		term.redirect(prevWindow);

		return true;
	}

	clear() {
		const prevWindow = term.redirect(this.window);
		this.window.setVisible(false);
		this._clear();
		this.window.setVisible(true);
		term.redirect(prevWindow);
	}

	emitEvents(events: string[], event: _events.IEvent, position?: Vector2) {
		this.renderBuffer.forEach((element) => {
			if (!element.visible || !element.events) return;
			if (
				position &&
				(!hasRegion(element) ||
					(hasRegion(element) && !element.region.contains(position)))
			)
				return;

			events.forEach((eventName) => {
				element.emit(eventName, event);
			});

			if (events.includes("click")) {
				this.lastClicked = element;
			}
		});
	}
}
