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
	static override props?: Props;

	private relativePosition: Vector2;
	public region: Region2;
	public override events: true = true;

	constructor(parent?: ElementBase) {
		super(parent);

		this.relativePosition = Vector2.one;
		this.region = Region2.rect(Vector2.one, Vector2.one);
	}

	private get parentPosition(): Vector2 {
		return this.parent
			? (this.parent as Drawable).absolutePosition ?? Vector2.one
			: Vector2.one;
	}

	get position(): Vector2 {
		return this.relativePosition;
	}

	get absolutePosition(): Vector2 {
		return this.parentPosition.add(this.relativePosition).sub(Vector2.one);
	}

	get center(): Vector2 {
		return this.region.getCenter();
	}

	get absoluteCenter(): Vector2 {
		return this.parentPosition.add(this.center).sub(Vector2.one);
	}

	get size(): Vector2 {
		return this.region.getSize();
	}

	set position(position: Vector2) {
		this.relativePosition = position.copy();
		this.region.setPosition(this.absolutePosition);
	}

	set size(size: Vector2) {
		this.region.setSize(size);
	}

	override __defaultProps<C = Node>(): Props<C> {
		return Object.assign(super.__defaultProps<C>(), {
			position: Vector2.one,
			size: Vector2.one,
		});
	}

	override __updateProps(props: Props) {
		super.__updateProps(props);

		this.position = props.position as Vector2;
		this.size = props.size as Vector2;
	}

	override beforeDraw(window: Window): void {
		window.setCursorPos(
			math.ceil(this.absolutePosition.x),
			math.ceil(this.absolutePosition.y)
		);
	}
}
