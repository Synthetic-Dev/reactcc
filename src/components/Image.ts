import * as BLBFOR from "@ccts/blbfor";
import { Vector2 } from "@ccts/vectors";
import DrawableElement, {
	Props as DrawableElementProps,
} from "../lib/element/Element";
import ElementBase from "../lib/element/ElementBase";
import { bbfPalette, ImageFormat, Node } from "../types";

export const IMAGE_FORMATS = {
	bimg: true,
	bbf: true,
	// "cimg2": true,
	// "nft":true,
};

interface Props<C = Node> extends DrawableElementProps<C> {
	src: string;
	format?: ImageFormat;
	allowPalette?: boolean;
	frame?: number;
	// animate?: boolean;

	afterLastFrame?: () => void;
}

export default class Image extends DrawableElement {
	static override props?: Props;

	public src: string;
	public format: ImageFormat;
	public allowPalette: boolean;
	private blitLines: [string, string, string][];
	private palette: bbfPalette;
	private frame: number;
	private handle?;

	constructor(parent?: ElementBase) {
		super(parent);
	}

	override __defaultProps<C = Node>(): Props<C> {
		return Object.assign(super.__defaultProps<C>(), {
			src: "",
			allowPalette: false,
			frame: 1,
		});
	}

	override __updateProps(props: Props): void {
		super.__updateProps(props);

		this.src = props.src;
		this.allowPalette = props.allowPalette;
		this.frame = props.frame;
		const fileFormat = props.src.split(".").pop().toLowerCase();
		if (props.format) this.format = props.format;
		else {
			if (!IMAGE_FORMATS[fileFormat])
				throw `No image format was provided to element and a valid format could not be found for file ${this.src}`;
			this.format = fileFormat as ImageFormat;
		}

		this.blitLines = [];
		switch (this.format) {
			case "bbf":
				const image = this.handle ?? BLBFOR.open(this.src, "r");
				this.handle = image;
				const meta = image.meta;
				if (meta["palette"]) {
					this.palette = meta["palette"][1] as bbfPalette;
				}
				this.size = new Vector2(image.width, image.height);
				const frame = math.min(image.layers, math.max(1, this.frame));
				if (this.frame > frame && props.afterLastFrame) {
					props.afterLastFrame();
				}
				for (let y = 0; y < image.height; y++) {
					this.blitLines.push(image.lines[frame][y]);
				}
				break;
		}
	}

	override beforeDraw(window: Window): void {
		super.beforeDraw(window);

		if (this.allowPalette && this.palette) {
			for (const color of Object.keys(this.palette)) {
				window.setPaletteColor(
					math.pow(2, tonumber(color)),
					this.palette[color]
				);
			}
		}
	}

	override draw(window: Window): void {
		for (let y = 0; y < this.blitLines.length; y++) {
			window.setCursorPos(
				math.ceil(this.absolutePosition.x),
				math.ceil(this.absolutePosition.y + y)
			);
			const line = this.blitLines[y];
			if (line[0] && line[1] && line[2]) {
				window.blit(line[0], line[1], line[2]);
			}
		}
	}
}
