import SMLComponent from "../lib/smlComponent.js";

export default class Test extends SMLComponent {
    constructor() {
        super()
    }

    render() {
        return this.m`<h1>This is a test component!</h1>`;
    }
}
