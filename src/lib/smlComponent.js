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


    const obj = {
      name: 'mimi',
      age: 16
    }

    const obj2 = {
      name: 'mimi',
      age: 16,
      nums: [1, 2, 3, 4]
    }


    const test1 = obj;
    const test2 = obj2;
    const result = this.objectUtil.compare(test1, test2, {log:true, fullReport: true, types:true})
    console.log(result);



    this.setRoot(rootElement);
    const  { htmlString, placeHolders } = this.render();
    this.tree = this.sml.stringToTree({ htmlString, placeHolders });
    const appTree = { isComponent: true, instance: this, string: htmlString };
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
