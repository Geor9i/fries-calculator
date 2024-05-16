import SMLComponent from "../lib/smlComponent.js";

export default class Input extends SMLComponent {
    constructor() {
        super()
    }

    onInit() {
        this.title = `On Init Title`;
    }

    afterViewInit() {
        const section = this.tree[0];
        console.log(section);
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
