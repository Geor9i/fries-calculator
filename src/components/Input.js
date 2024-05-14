import SMLComponent from "../lib/smlComponent.js";

export default class Input extends SMLComponent {
    constructor() {
        super()
    }

    onInit() {
        this.title = `On Init Title`;
    }

    render() {
        const p = 'This is a paragraph';
        return this.m `
        <section>
        <sml-content />
        <h1>${ this.title }</h1>
        </section>`
    }
}
