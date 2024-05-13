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
        const four = 4;
        const red = 'red'
        let variable = 'class';

        return this.m `
        <section>
        <h1>${ this.title }</h1>
        <p>${ p }</p>
        <input ${variable}=${red} >

        
        </section>`
    }
}
