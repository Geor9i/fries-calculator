import { sml } from "./sml.js";

export default class SMLComponent {
  constructor() {
    this.state = {};
    this.sml = sml;
    this.onInit();
  }

  render() {
    throw new Error("Render method must be defined!");
  }

  onInit() {
  }

  onDestroy() {
  }

  onUpdate() {
  }

  useState(initialValue) {
    const key = `${new Date().getTime()}`;
    this.state[key] = initialValue;

    const setState = (newValue) => {
      this.state[key] = newValue;
      this.render();
    };
    return [initialValue, setState];
  }

  m(stringsArr, ...values) {
    const placeHolders = [];
    let htmlString = ``;
    // Recombine html string parts
    stringsArr.forEach((str, i) => {
      htmlString += str;
      const value = values[i];
      if (value && typeof value === "string") {
        htmlString += value;
      } else if (value) {
        placeHolders.push({ index: htmlString.length, value });
      }
    });
    return { htmlString, placeHolders };
  }

  setRoot(rootElement) {
    if (rootElement instanceof HTMLElement) {
      this.root = rootElement;
    }
  }

  entry(rootElement) {
    this.setRoot(rootElement);
    const  { htmlString, placeHolders } = this.render();
    const tree = this.sml.smlTree({ htmlString, placeHolders });
    this.appTree = { isComponent: true, tree, string: htmlString };
    console.log(this.appTree);
    this.sml.buildDom(this.root, this.appTree);
  }

  loadComponents(...components) {
    this.sml.components = components.map((component) => ({
      name: component.name,
      component,
    }));
  }
}
