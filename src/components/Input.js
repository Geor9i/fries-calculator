import SMLComponent from "../lib/smlComponent.js";

export default class Input extends SMLComponent {
    constructor() {
        super()
    }

    render() {
        const title = 'This is a title';
        const p = 'This is a paragraph';
        const four = 4;

        return this.m `
        <section>
        <h1>${ title }</h1>
        <p>${ p }</p>
        <div class="${four}"></div>
        </section>`
    }
}
