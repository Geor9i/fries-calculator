import DependencyHub from "../dependencyResolvers/dependencyHub.js";
import { patterns, selfClosingTags, validHTMLElements } from "./constants/constants.js";

export default class SML {

    static dependencies = ['ObjectUtil'];

    constructor() {
        this.root = null;
        this.selfClosingTags = selfClosingTags;
        this.regex = patterns;
        this.validHTMLElements = validHTMLElements;
        this.components = null;
    }
    setRoot(rootElement) {
        if (rootElement instanceof HTMLElement) {
            this.root = rootElement;
        }
    }

    m(stringsArr, ...values) {
        const placeHolders = [];
        let linkedString = ``;
        stringsArr.forEach((str, i) => {
            linkedString += str;
            const value = values[i];
            if (value && typeof value === 'string') {
                linkedString += value;
            } else if (value) {
                placeHolders.push({index: linkedString.length, value})
            }
        })
        const detectElement = (currentString => {
            const detectedElements = [];
            

            const matches = currentString.matchAll(this.regex.element);
            for (const match of matches) {
                const attributes = {};
                let tagProps = {};
                let children = [];
                const string = match[0];
                const tagName = match.groups.tagName || match.groups.tagname;
                const isComponent = !this.validHTMLElements.includes(tagName);
                let selfClosingTag, tag;
                if (isComponent) {
                    selfClosingTag = string.match(this.regex.selfClosingTag)
                    tag = selfClosingTag ? selfClosingTag : string.match(this.regex.openingTag);
                    tagProps = {
                        selfClosing: !!selfClosingTag,
                        isComponent: true
                    }
                } else {
                    selfClosingTag = this.selfClosingTags.includes(tagName);
                    tag = selfClosingTag ? string.match(this.regex.selfClosingTag) : string.match(this.regex.openingTag);
                }
                const attributeMatch = tag[0].matchAll(this.regex.attribute);
                for(const entry of attributeMatch){
                    const { attribute, value } = entry.groups;
                    attributes[attribute] = value ? value : true;
                }
                let stripedElementString = string.replace(this.regex[selfClosingTag ? 'selfClosingTag' : 'openingTag'], '');
                if (!selfClosingTag) {
                    const closingTags = stripedElementString.match(this.regex.closingTag);
                    stripedElementString = stripedElementString.replace(closingTags[closingTags.length -1], '');
                }
                if (stripedElementString.match(this.regex.element) !== null) {
                    children.push(stripedElementString.replace(this.regex.element, ''));
                    children.push(...detectElement(stripedElementString));
                } else {
                    children = [stripedElementString];
                }
                children = children.filter(el => {
                    if (typeof el === 'string' && el.match(/^\s*$/)) {
                        return false
                    }
                    return true
                })
                detectedElements.push({tagName, attributes, children, tagProps});
            }
            return detectedElements;
        })
        let detectedElements = detectElement(linkedString);
        return detectedElements;
    }

    display(elementParent, ...smlElements) {
        const fragment = document.createDocumentFragment();
        smlElements.forEach(smlElement => {
            if (typeof smlElement === 'string') {
                const textNode = document.createTextNode(smlElement);
                elementParent.appendChild(textNode);
                return;
            }
            const { tagName, attributes, children, tagProps } = smlElement;
            if(tagProps.isComponent) {
                let componentFragment = document.createDocumentFragment();
                const component = this.components.find(entry => entry.name === tagName);
                if (component) {
                    const instance = new component.component();
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