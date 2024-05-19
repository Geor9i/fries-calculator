import SMLComponent from "../lib/smlComponent.js";
import { SmlElement } from "../lib/smlElement.js";

export default class Input extends SMLComponent {
    constructor() {
        super()
    }

    onInit() {
        this.title = `On Init Title`;
    }

    onChanges() {
        this.changes.forEach(change => {
            const { newState, oldState } = change;
            console.log({newState, oldState});
        })
        // console.log(this.changes);
    }

    afterViewInit() {
        const section = this.tree[0];
        // section.attributes = {color: 'red'}
        // section.attributes = {color: 'green'}
        // console.log(section);

        // for (let i = 0;i < 10;i++) {
        //     section.setAttribute('textContent', `${i}`)
        // }

    }

    render() {
        return this.m `
        <section>
        <sml-content />
        <h1>${ this.title }</h1>
        </section>`
    }
}
