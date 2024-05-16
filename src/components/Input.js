import SMLComponent from "../lib/smlComponent.js";
import { SmlElement } from "../lib/smlElement.js";

export default class Input extends SMLComponent {
    constructor() {
        super()
    }

    onInit() {
        this.title = `On Init Title`;
    }

    afterViewInit() {
        const section = this.tree[0];
        section.attributes = {...section.attribute, class: 'red'}
    }

    render() {
        return this.m `
        <section>
        <sml-content />
        <h1>${ this.title }</h1>
        </section>`
    }
}
