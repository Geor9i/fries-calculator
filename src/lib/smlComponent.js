import { sml } from "./sml.js";
import { smlDom } from "./smlDom.js";
import { smlLink } from "./smlLink.js";
import ObjectUtil from "./utils/objectUtil.js";
import WatcherArray from "./utils/watcherArray.js";
import WatcherObject from "./utils/watcherObj.js";

export default class SMLComponent {
  constructor() {
    this.state = {};
    this.smlDom = smlDom;
    this.sml = sml;
    this.objectUtil = new ObjectUtil();
    this.smlLink = smlLink;
    Object.defineProperty(this, 'renderMethod', { enumerable:  false, value: this.render });
    this.render = () => this.tree = this.renderMethod();
    Object.defineProperty(this, 'changes', {
      value: [],
      writable: true,
      enumerable:false,
    })
    this._isProcessing = true;
    this.onInit();
  }

  _logChange(change) {
    this.changes.push(change);
    if (this._isProcessing) return;
    this._isProcessing = true;
    setTimeout(() => {
      this.onChanges(this.changes)
      this._isProcessing = false;
    }, 0)
  }

  _resetChanges() {
    this.changes = [];
  }


  render() {
    throw new Error("Render method must be defined!");
  }

  onInit() {}

  afterViewInit() {}

  onDestroy() {}

  onChanges() {
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
    // this._resetChanges();
    this._isProcessing = false;
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
