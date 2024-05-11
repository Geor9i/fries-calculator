import DependencyHub from "../dependencyResolvers/dependencyHub.js";
import { patterns, selfClosingTags, validHTMLElements } from "./constants/constants.js";
import HTMLInterpreters from "./utils/HTMLInterpreters.js";

export default class SML {

    static dependencies = ['ObjectUtil'];

    constructor() {
        this.root = null;
        this.selfClosingTags = selfClosingTags;
        this.validHTMLElements = validHTMLElements;
        this.regex = patterns;
        this.components = null;
        this.htmlUtil = new HTMLInterpreters();
    }
    setRoot(rootElement) {
        if (rootElement instanceof HTMLElement) {
            this.root = rootElement;
        }
    }

    m(stringsArr, ...values) {
        const placeHolders = [];
        let linkedString = ``;
        // Recombine html string parts
        stringsArr.forEach((str, i) => {
            linkedString += str;
            const value = values[i];
            if (value && typeof value === 'string') {
                linkedString += value;
            } else if (value) {
                placeHolders.push({index: linkedString.length, value})
            }
        })
        // if the string contains no html return the text 
        if (!this.regex.element.test(linkedString) && linkedString.length && !/^\s+$/g.test(linkedString)) {
            return [linkedString];
        }

        const tagTree = (currentString => {
            const availableTags = this.htmlUtil.findTags(currentString);
            const tagPairs = this.htmlUtil.pairTags(availableTags, currentString);
            console.log(tagPairs);
            let tagTree = this.htmlUtil.buildTree(tagPairs, currentString);
            tagTree = this.htmlUtil.extractTagTreeSurroundText(tagTree, currentString)
            return tagTree
        })
        let detectedElements = tagTree(linkedString);
        return detectedElements;
    }

    display(elementParent, ...smlElements) {
        const fragment = document.createDocumentFragment();
        smlElements.forEach(smlElement => {
            if (typeof smlElement === 'string') {
                const textNode = document.createTextNode(smlElement);
                fragment.appendChild(textNode);
                return;
            }
            const tagName = smlElement.open.name;
            const { children, attributes, isComponent } = smlElement;
            if(isComponent) {
                let componentFragment = document.createDocumentFragment();
                const component = this.components.find(entry => entry.name === tagName);
                if (component) {
                    const instance = new component.component(attributes);
                    const domMap = this.m`${instance.render()}`;
                    this.display(componentFragment, ...domMap)
                    fragment.appendChild(componentFragment);
                }
                return
            }
            const element = document.createElement(tagName);
            for (let attribute in attributes) {
                element.setAttribute(attribute, attributes[attribute])
            }
            if (!this.selfClosingTags.includes(tagName) && children.length) {
                  this.display(element, ...children);
            }
            fragment.appendChild(element);
        })
        elementParent.appendChild(fragment);
    }

    entry(appComnponent) {
        const app = new appComnponent();
        const domMap = this.m `${app.render()}`;
        this.display(this.root, ...domMap);
    }

    loadComponents(...components) {
        this.components = components.map(component => ({name: component.name, component}))
    }



}

DependencyHub.add(SML);