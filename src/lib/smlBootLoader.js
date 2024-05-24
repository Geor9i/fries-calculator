import { smlDom } from "./smlDom.js";

class smlBootLoader {
    constructor() {
        this.root = null;
    }
    setRoot (rootElement) {
        if (rootElement instanceof HTMLElement) {
            this.root = rootElement;
          }
    }

    loadComponents(...components) {
        this.sml.components = components.map((component) => ({
            name: component.name,
            component,
          }));
    }

    entry(rootElement, entryComponent) {
        this.setRoot(rootElement);
        const app = new entryComponent();
        app.setParent(rootElement);
        app.render();
        console.log(app.children);
        smlDom.buildDom(app.children, this.root);
    }
}

export const smlBootloader = new smlBootLoader();