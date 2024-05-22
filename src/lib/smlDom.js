import { objectUtil } from "./utils/objectUtil.js";
import {
  selfClosingTags,
} from "./constants/constants.js";

class SMLDOM {

  constructor() {
    this.selfClosingTags = selfClosingTags;
    this.components = null;
    this.objectUtil = objectUtil;
  }


  buildDom(elementParent, componentTree) {
    const mainFragment = document.createDocumentFragment();
    let nodes = [];
    const treeType = this.objectUtil.typeof(componentTree);
    const { instance } = componentTree;
    if (treeType === 'object' && instance.hasOwnProperty('tree')) {
      console.log(instance);
      nodes = instance.tree;
    } else if (treeType === 'object') {
      nodes = componentTree.children;
    } else {
      nodes = typeof componentTree === 'string' ? [componentTree] : componentTree;
    }
    nodes.forEach((smlNode) => {
      if (smlNode.type === "textNode") {
        const textNode = document.createTextNode(smlNode.text);
        smlNode.ref = textNode;
        mainFragment.appendChild(textNode);
        return;
      }
      const { children, attributes, instance } = smlNode;
      if (instance?.hasOwnProperty('tree')) { //? If Component
        let componentFragment = document.createDocumentFragment();
        this.buildDom(componentFragment, instance.tree);
        mainFragment.appendChild(componentFragment);
        return;
      }
      const tagName = smlNode.type;
      const element = document.createElement(tagName);
      smlNode.ref = element;
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