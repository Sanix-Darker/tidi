import habitat from "preact-habitat";

import Widget from "./component";

let _habitat = habitat(Widget);

const host = "ws://127.0.0.1:1324"
const conn = new WebSocket(`${host}/socket`);

_habitat.render({
    selector: '[data-ttspch-component]',
    defaultProps: { conn },
    clean: true
});
