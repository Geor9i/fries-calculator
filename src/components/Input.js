import SMLComponent from "../lib/smlComponent.js";

export default class Input extends SMLComponent {
    constructor() {
        super()
    }

    onInit() {
        this.title = `On Init Title`;
    }

    onChanges() {
        // this.changes.forEach(change => {
        //     const { newState, oldState } = change;
        //     console.log({newState, oldState});
        // })
    }

    afterViewInit() {
    }

    render() {
        return this.m `
        <section>
        <h1>${ this.title }</h1>
        <sml-content />
        </section>
        `
    }
}
