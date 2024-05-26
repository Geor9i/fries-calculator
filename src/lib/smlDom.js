import {
  selfClosingTags,
} from "./constants/constants.js";

class SMLDOM {

  constructor() {
    this.selfClosingTags = selfClosingTags;
    this.components = null;
  }

  buildDom(children, parentComponent) {
    const mainFragment = document.createDocumentFragment();
    let nodes = typeof children === 'string' ? [children] : children;
    nodes.forEach((smlNode) => {
      if (smlNode.type === "textNode") {
        const textNode = document.createTextNode(smlNode.text);
        smlNode.ref = textNode;
        mainFragment.appendChild(textNode);
        return;
      }
      const { children, attributes, instance } = smlNode;
      if (instance?.hasOwnProperty('componentChildren')) { //? If Component
        let componentFragment = document.createDocumentFragment();
        this.buildDom(instance.children, componentFragment);
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
        this.buildDom(children, element);
      }
      mainFragment.appendChild(element);
    });
    parentComponent.appendChild(mainFragment);
  }

  traverseAndUpdate(component){

    const tree = component.tree;
    console.log(component);
    const directChildrenChanges = component._treeChanges

    const traverseTree = (parent) => {
      const isComponent = parent.hasOwnProperty('tree');
      if (isComponent) return;
      console.log(isComponent);
      const structureType = this.typeof(structure);
      if (structureType === 'array') {
        for (let node of structure) {
          console.log(node);

          if (node?._childrenChanges) {
            console.log(node._childrenChanges);
          }

          if(node?._attributeChanges && node._attributeChanges.size > 0) {
            const attributeChangesArr = Array.from(node._attributeChanges);
            const domElement = node.ref;
            attributeChangesArr.forEach(attribute => {
              const updatedValue = node.attributes[attribute];
              domElement.setAttribute(attribute, updatedValue)
            })
          }

          if (node?.children) {
            traverseTree(node.children, node)
          }
        }
      } else if (structureType?.children){
        traverseTree(structureType.children, parent)
      }
  }
  traverseTree(component)
}
}

export const smlDom = new SMLDOM();