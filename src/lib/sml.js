import {
  patterns,
  selfClosingTags,
} from "./constants/constants.js";
import HTMLInterpreters from "./utils/HTMLInterpreters.js";

class SML {
  static dependencies = ["ObjectUtil"];

  constructor() {
    this.selfClosingTags = selfClosingTags;
    this.regex = patterns;
    this.components = null;
    this.htmlUtil = new HTMLInterpreters();
  }
  setRoot(rootElement) {
    if (rootElement instanceof HTMLElement) {
      this.root = rootElement;
    }
  }

  smlTree({htmlString, placeHolders}) { 
    // if the string contains no html return the text
    if (
      !this.regex.element.test(htmlString) &&
      htmlString.length &&
      !/^\s+$/g.test(htmlString)
    ) {
      return [htmlString];
    }

    const availableTags = this.htmlUtil.findTags(htmlString);
    const tagPairs = this.htmlUtil.pairTags(availableTags, htmlString);
    let tagTree = this.htmlUtil.buildTree(tagPairs, htmlString, placeHolders);
    tagTree = this.htmlUtil.insertTagTreeSurroundText(tagTree, htmlString);
    console.log(tagTree);
    return tagTree;
  }

  display(elementParent, ...smlElements) {
    const fragment = document.createDocumentFragment();
    smlElements.forEach((smlElement) => {
      if (typeof smlElement === "string") {
        const textNode = document.createTextNode(smlElement);
        fragment.appendChild(textNode);
        return;
      }
      const tagName = smlElement.open.name;
      const { children, attributes, isComponent } = smlElement;
      if (isComponent) {
        let componentFragment = document.createDocumentFragment();
        const component = this.components.find(
          (entry) => entry.name === tagName
        );
        if (component) {
          const instance = new component.component(attributes);
          instance.children = children;
          instance.attributes = attributes;
          const domMap = this.smlTree(instance.render());
          this.display(componentFragment, ...domMap);
          fragment.appendChild(componentFragment);
        }
        return;
      }
      const element = document.createElement(tagName);
      for (let attribute in attributes) {
        if (attributes[attribute] === true) {
          element.setAttribute(attribute, '');
        } else {
          element.setAttribute(attribute, attributes[attribute]);
        }
      }
      if (!this.selfClosingTags.includes(tagName) && children.length) {
        this.display(element, ...children);
      }
      fragment.appendChild(element);
    });
    elementParent.appendChild(fragment);
  }


  
}

export const sml = new SML();