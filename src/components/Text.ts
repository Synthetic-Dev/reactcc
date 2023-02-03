import { Vector2 } from "@ccts/vectors";
import DrawableElement, {
	Props as DrawableElementProps,
} from "../lib/element/Element";
import ElementBase from "../lib/element/ElementBase";

interface Props<C = undefined> extends DrawableElementProps<C> {
	text?: string | number;
	textColor?: Color;
}

export default class Text extends DrawableElement {
	static override props?: Props;

	public text: string;
	public textColor: Color;
	public textOffset: Vector2 = Vector2.zero;

	constructor(parent?: ElementBase) {
		super(parent);
	}

	override __defaultProps<C = undefined>(): Props<C> {
		return Object.assign(super.__defaultProps<C>(), {
			text: "",
			textColor: colors.white,
		});
	}

	override __updateProps(props: Props): void {
		super.__updateProps(props);

		this.text = tostring(props.text);
		this.size = new Vector2(this.text.length, 1);
		this.textColor = props.textColor as Color;
	}

	override beforeDraw(window: Window): void {
		super.beforeDraw(window);

		window.setTextColor(this.textColor);
	}

	override draw(window: Window): void {
		const position = this.absolutePosition.add(this.textOffset);
		const shift = position.x < 1 ? -position.x + 1 : 0;
		const line = window.getLine(position.y);

		const bg = line[2].substring(
			position.x + shift - 1,
			position.x + shift + (this.text.length - shift) - 1
		);
		const length = bg.length;
		const text = this.text.substring(shift, length + shift);
		const fg = colors.toBlit(this.textColor).repeat(length);

		window.blit(
			" ".repeat(shift) + text,
			" ".repeat(shift) + fg,
			" ".repeat(shift) + bg
		);
	}
}
