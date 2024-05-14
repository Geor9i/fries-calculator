import ObjectUtil from "./utils/objectUtil.js";
import {
  selfClosingTags,
} from "./constants/constants.js";

class SMLDOM {

  constructor() {
    this.selfClosingTags = selfClosingTags;
    this.components = null;
    this.objectUtil = new ObjectUtil();
    this.test()
  }


  test() {
    console.log(this.objectUtil.typeof(42)); // "number"
    console.log(this.objectUtil.typeof('hello')); // "string"
    console.log(this.objectUtil.typeof(true)); // "boolean"
    console.log(this.objectUtil.typeof(null)); // "null"
    console.log(this.objectUtil.typeof(undefined)); // "undefined"
    console.log(this.objectUtil.typeof({})); // "object"
    console.log(this.objectUtil.typeof([])); // "array"
    console.log(this.objectUtil.typeof(new Date())); // "date"
    console.log(this.objectUtil.typeof(/regex/)); // "regexp"
    console.log(this.objectUtil.typeof(new Map())); // "map"
    console.log(this.objectUtil.typeof(new Set())); // "set"
    console.log(this.objectUtil.typeof(new WeakMap())); // "weakmap"
    console.log(this.objectUtil.typeof(new WeakSet())); // "weakset"
    console.log(this.objectUtil.typeof(new Error())); // "error"
    console.log(this.objectUtil.typeof(function() {})); // "function"
  }


  buildDom(elementParent, componentTree) {
    const mainFragment = document.createDocumentFragment();
    let nodes = [];
    const treeType = this.objectUtil.typeof(componentTree);
    const { isComponent, instance } = componentTree;
    if (treeType === 'object' && isComponent) {
      console.log(instance);
      nodes = [...instance.tree];
    } else if (treeType === 'object') {
      nodes = componentTree.children;
    } else {
      nodes = typeof componentTree === 'string' ? [componentTree] : [...componentTree];
    }
    nodes.forEach((smlNode) => {
      if (typeof smlNode === "string") {
        const textNode = document.createTextNode(smlNode);
        mainFragment.appendChild(textNode);
        return;
      }
      const { children, attributes, isComponent, instance } = smlNode;
      if (isComponent) {
        let componentFragment = document.createDocumentFragment();
        instance.children = children;
        instance.attributes = attributes;
        this.buildDom(componentFragment, instance.tree);
        mainFragment.appendChild(componentFragment);
        return;
      }
      const tagName = smlNode.type;
      const element = document.createElement(tagName);
      for (let attribute in attributes) {
        if (attributes[attribute] === true) {
          element.setAttribute(attribute, '');
        } else {
          element.setAttribute(attribute, attributes[attribute]);
        }
      }
      if (!this.selfClosingTags.includes(tagName) && children.length) {
        this.buildDom(element, children);
      }
      mainFragment.appendChild(element);
    });
    elementParent.appendChild(mainFragment);
  }

}

export const smlDom = new SMLDOM();