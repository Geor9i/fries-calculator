import { sml } from "./sml.js";
import { smlDom } from "./smlDom.js";
import ObjectUtil from "./utils/objectUtil.js";

export default class SMLComponent {
  constructor() {
    this.state = {};
    this.smlDom = smlDom;
    this.sml = sml;
    this.objectUtil = new ObjectUtil();
    this.onInit();
  }

  render() {
    throw new Error("Render method must be defined!");
  }

  onInit() {
  }

  afterViewInit() {

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
    this.tree = this.sml.stringToTree({ htmlString, placeHolders });
    const appTree = { isComponent: true, instance: this, string: htmlString };
    let result = this.objectUtil.compare(appTree, appTree, {log: true, fullReport: true, exclude: ['instance', 'validHTMLElements ', 'regex', 'selfClosingTags ']})
    console.log(result);
    this.smlDom.buildDom(this.root, appTree);
    this.afterViewInit();
  }

  loadComponents(...components) {
    this.sml.components = components.map((component) => ({
      name: component.name,
      component,
    }));
  }
}
