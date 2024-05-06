import SMLComponent from "../lib/smlComponent.js";

export default class Heading extends SMLComponent {

    constructor({text}) {
        super();
        this.text = text;
    }

    render() {
        return `<h1 class="red">${this.text}</h1>`;
    }
}

