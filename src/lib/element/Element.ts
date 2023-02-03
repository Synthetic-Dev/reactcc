import { MouseEvent } from "@ccts/events";
import { Node } from "../../types";
import Drawable, { Props as DrawableProps } from "./Drawable";
import ElementBase from "./ElementBase";

export interface Props<C = Node> extends DrawableProps<C> {
	bgColor?: Color;

	onClick?: (event: MouseEvent) => void;
	onClickEnd?: (event: MouseEvent) => void;
	onLeftClick?: (event: MouseEvent) => void;
	onRightClick?: (event: MouseEvent) => void;
	onMiddleClick?: (event: MouseEvent) => void;
	onScroll?: (event: MouseEvent) => void;
	onDrag?: (event: MouseEvent) => void;
	onMonitorTouch?: (event: MouseEvent) => void;
}

export default class DrawableElement extends Drawable {
	static override props?: Props;

	public bgColor: Color;

	constructor(parent?: ElementBase) {
		super(parent);
	}

	override __defaultProps<C = Node>(): Props<C> {
		return Object.assign(super.__defaultProps<C>(), {
			bgColor: colors.black,
		});
	}

	override __updateProps(props: Props) {
		super.__updateProps(props);

		this.bgColor = props.bgColor as Color;
	}

	override beforeDraw(window: Window): void {
		super.beforeDraw(window);

		window.setBackgroundColor(this.bgColor);
	}
}
