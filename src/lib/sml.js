import ObjectUtil from "../utils/objectUtil.js";
import {
  patterns,
  selfClosingTags,
} from "./constants/constants.js";
import HTMLInterpreters from "./utils/HTMLInterpreters.js";

class SML {

  constructor() {
    this.selfClosingTags = selfClosingTags;
    this.regex = patterns;
    this.components = null;
    this.getComponents = this._getComponents.bind(this);
    this.htmlUtil = new HTMLInterpreters(this.getComponents);
    this.objectUtil = new ObjectUtil();
  }
  smlTree({htmlString, placeHolders}) { 
    return this.htmlUtil.stringToTree({htmlString, placeHolders});
  }

  buildDom(elementParent, componentTree) {
    const mainFragment = document.createDocumentFragment();
    let nodes = [];
    const treeType = this.objectUtil.typeof(componentTree);
    const { tree, isComponent } = componentTree;
    if (treeType === 'object' && isComponent) {
      nodes = [...tree];
    } else if(treeType === 'object'){
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
      const { children, attributes, isComponent, tree, instance } = smlNode;
      if (isComponent) {
        let componentFragment = document.createDocumentFragment();
          instance.children = children;
          instance.attributes = attributes;
          this.buildDom(componentFragment, tree);
          mainFragment.appendChild(componentFragment);
        return ;
      }
      const tagName = smlNode.open.name;
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

  _getComponents() {
    return this.components;
  }
  
}

export const sml = new SML();