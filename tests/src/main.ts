import ReactCC from "@ccts/reactcc";
import App from "./App";
import * as events from "@ccts/events";
import program from "@ccts/program";

const monitor = peripheral.wrap("right") as MonitorPeripheral;
monitor.setTextScale(0.5);

const app = program({
	// debug: {
	// 	terminal: monitor,
	// },
	logging: {
		path: "main.log",
		overwrite: true,
	},
});

let termTree;

app.use(() => {
	ReactCC.render(termTree);
});
app.use(() => {
	ReactCC.processEvents(events, termTree);
});
app.cleanup(() => {
	ReactCC.destroy(termTree);
});

app.start(() => {
	termTree = ReactCC.build(ReactCC.createElement(App), monitor);
});
