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

    const complexObject = {
      stringProp: "Hello, world!",
      numberProp: 42,
      booleanProp: true,
      nullProp: null,
      undefinedProp: undefined,
      arrayProp: [1, 2, 3],
      objectProp: {
        nestedStringProp: "Nested string",
        nestedNumberProp: 123,
        nestedBooleanProp: false,
        nestedArrayProp: [4, 5, 6],
        nestedObjectProp: {
          deeplyNestedStringProp: "Deeply nested string",
          deeplyNestedNumberProp: 789,
          deeplyNestedBooleanProp: true
        }
      },
      setProp: new Set([1, 2, 3]),
      mapProp: new Map([
        ['key1', 'value1'],
        ['key2', 'value2']
      ]),
      weakSetProp: new WeakSet(),
      weakMapProp: new WeakMap(),
    };
    
    // Add some entries to the WeakSet and WeakMap
    const weakObject1 = { id: 1 };
    const weakObject2 = { id: 2 };
    complexObject.weakSetProp.add(weakObject1);
    complexObject.weakSetProp.add(weakObject2);
    complexObject.weakMapProp.set(weakObject1, "Value 1");
    complexObject.weakMapProp.set(weakObject2, "Value 2");


    const complexObject2 = {
      stringProp: "Hello, world!",
      numberProp: 42,
      booleanProp: true,
      nullProp: null,
      undefinedProp: undefined,
      arrayProp: [1, 2, 3],
      objectProp: {
        nestedStringProp: "Nested string",
        nestedNumberProp: 123,
        nestedBooleanProp: false,
        nestedArrayProp: [4, 5, 6],
        nestedObjectProp: {
          deeplyNestedStringProp: "Deeply nested string",
          deeplyNestedNumberProp: 789,
          deeplyNestedBooleanProp: true
        }
      },
      setProp: new Set([1, 2, 3]),
      mapProp: new Map([
        ['key1', 'value1'],
        ['key2', 'value2']
      ]),
      weakSetProp: new WeakSet(),
      weakMapProp: new WeakMap(),
    };
    
    // Add some entries to the WeakSet and WeakMap
    const weakObject3 = { id: 1 };
    const weakObject4 = { id: 2 };
    complexObject2.weakSetProp.add(weakObject3);
    complexObject2.weakSetProp.add(weakObject4);
    complexObject2.weakMapProp.set(weakObject3, "Value 1");
    complexObject2.weakMapProp.set(weakObject4, "Value 2");


    const test1 = complexObject;
    const test2 = complexObject2;

    // this.objectUtil.compare(undefined, null)
    const result = this.objectUtil.compare(test1, test1, {fullReport: true, log: true, types: true});
    console.log(result);
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