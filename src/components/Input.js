import SMLComponent from "../lib/smlComponent.js";

export default class Input extends SMLComponent {
    constructor() {
        super()
    }

    render() {
        console.log(this.children);
        return `<header>gag</header>`
    }
}
