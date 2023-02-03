import { Vector2 } from "@ccts/vectors";
import DrawableElement from "../lib/element/Element";
import ElementBase from "../lib/element/ElementBase";

export default class Frame extends DrawableElement {
	constructor(parent?: ElementBase) {
		super(parent);
	}

	override draw(window: Window): void {
		let startCorner = this.absolutePosition;
		let endCorner = this.absolutePosition.add(this.size).sub(Vector2.one);

		paintutils.drawFilledBox(
			startCorner.x,
			startCorner.y,
			endCorner.x,
			endCorner.y,
			this.bgColor
		);
	}
}
