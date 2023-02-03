import { Node, PropsWithChildren } from "../../types";
import ElementBase from "./ElementBase";

export interface Props<C = Node> extends PropsWithChildren<C> {
	zIndex?: number;
	visible?: boolean;
}

export default class DrawableBase extends ElementBase {
	static override props?: Props;

	public zIndex: number = 0;
	public visible: boolean = true;
	public isDirty: boolean = false;
	public events: boolean = false;

	constructor(parent?: ElementBase) {
		super(parent);
	}

	override __defaultProps<C = Node>(): Props<C> {
		return Object.assign(super.__defaultProps(), {
			zIndex: 0,
			visible: true,
		});
	}

	override __updateProps(props: Props) {
		super.__updateProps(props);

		this.zIndex = props.zIndex as number;
		this.visible = props.visible as boolean;
		this.makeDirty(true);
	}

	makeDirty(emit: boolean = false) {
		this.isDirty = true;
		if (emit) this.emit("dirty");
	}

	clean() {
		this.isDirty = false;
	}

	beforeDraw(window: Window): void {}

	draw(window: Window): void {}

	afterDrawn(window: Window): void {}
}
