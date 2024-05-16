import { sml } from "./sml.js";
import { smlDom } from "./smlDom.js";
import ObjectUtil from "./utils/objectUtil.js";
import WatcherArray from "./utils/watcherArray.js";

export default class SMLComponent {
  constructor() {
    this.state = {};
    this.smlDom = smlDom;
    this.sml = sml;
    this.objectUtil = new ObjectUtil();
    Object.defineProperty(this, 'renderMethod', { enumerable:  false, value: this.render });
    this.render = () => this.tree = this.renderMethod();
    Object.defineProperty(this, 'changes', {
      enumerable:false,
      value: new WatcherArray()
    })
    this.isProcessing = false;
    this.changes.on('push', this._pushChanges.bind(this));
    this.onInit();
  }

  _pushChanges() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    setTimeout(() => {
      this.onChanges()
      this.isProcessing = false;
    }, 0)
  }


  render() {
    throw new Error("Render method must be defined!");
  }

  onInit() {}

  afterViewInit() {}

  onDestroy() {}

  onChanges() {
    console.log(this.changes, this);
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
    return this.sml.stringToTree({ htmlString, placeHolders, parentComponent: this });
  }

  setRoot(rootElement) {
    if (rootElement instanceof HTMLElement) {
      this.root = rootElement;
    }
  }

  entry(rootElement) {
    this.setRoot(rootElement);
    this.render();
    console.log(this.tree);
    this.smlDom.buildDom(this.root, this.tree);
    this.afterViewInit();
  }

  loadComponents(...components) {
    this.sml.components = components.map((component) => ({
      name: component.name,
      component,
    }));
  }
}
