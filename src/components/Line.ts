import { Vector2 } from "@ccts/vectors";
import DrawableBase, {
	Props as DrawableBaseProps,
} from "../lib/element/DrawableBase";
import ElementBase from "../lib/element/ElementBase";

interface Props<C = undefined> extends DrawableBaseProps<C> {
	from: Vector2;
	to: Vector2;
	color?: Color;
}

export default class Line extends DrawableBase {
	static override props?: Props;

	private from: Vector2;
	private to: Vector2;
	private color: Color;

	constructor(parent?: ElementBase) {
		super(parent);
	}

	override __defaultProps<C = undefined>(): Props<C> {
		return Object.assign(super.__defaultProps<C>(), {
			from: Vector2.one,
			to: Vector2.one,
			color: colors.white,
		});
	}

	override __updateProps(props: Props): void {
		super.__updateProps(props);

		this.from = props.from as Vector2;
		this.to = props.to as Vector2;
		this.color = props.color as Color;
	}

	override beforeDraw(window: Window): void {
		window.setBackgroundColor(this.color);
	}

	override draw(window: Window): void {
		paintutils.drawLine(
			this.from.x,
			this.from.y,
			this.to.x,
			this.to.y,
			this.color
		);
	}
}
