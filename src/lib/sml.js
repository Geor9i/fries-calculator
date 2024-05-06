import DependencyHub from "../dependencyResolvers/dependencyHub.js";
import { patterns, selfClosingTags, validHTMLElements } from "./constants/constants.js";

export default class SML {

    static dependencies = ['ObjectUtil'];

    constructor() {
        this.root = null;
        this.selfClosingTags = selfClosingTags;
        this.regex = patterns;
        this.validHTMLElements = validHTMLElements
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
            for (let match of matches) {
                const string = match[0];
                const tagName = match.groups.tagName || match.groups.tagname;
                const selfClosingTag = this.selfClosingTags.includes(tagName);
                const tag = selfClosingTag ? string.match(this.regex.selfClosingTag) : string.match(this.regex.openingTag);
                let attributes = {};
                let attributeMatch = tag[0].matchAll(this.regex.attribute);
                for(let entry of attributeMatch){
                    const { attribute, value } = entry.groups;
                    attributes[attribute] = value ? value : true;
                }
                let stripedElementString = string.replace(this.regex[selfClosingTag ? 'selfClosingTag' : 'openingTag'], '');
                if (!selfClosingTag) {
                    let closingTags = stripedElementString.match(this.regex.closingTag);
                    stripedElementString = stripedElementString.replace(closingTags[closingTags.length -1], '');
                }
                let children = [];
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
                detectedElements.push({tagName, attributes, children});
            }
            return detectedElements;
        })
        let detectedElements = detectElement(linkedString);
        console.log(detectedElements);
        this.render(this.root, ...detectedElements)
    }

    render(elementParent, ...smlElements) {
        const fragment = document.createDocumentFragment();
        smlElements.forEach(smlElement => {
            if (typeof smlElement === 'string') {
                const textNode = document.createTextNode(smlElement);
                elementParent.appendChild(textNode);
                return;
            }
            const { tagName, attributes, children } = smlElement;
            if(!this.validHTMLElements.includes(tagName)) {
                throw new Error(`${tagName} is not a valid HTML ELement`);
            }
            const element = document.createElement(tagName);
            for (let attribute in attributes) {
                element.setAttribute(attribute, attributes[attribute])
            }
            if (!this.selfClosingTags.includes(tagName) && children.length) {
                  this.render(element, ...children);
            }
            fragment.appendChild(element);
        })
        elementParent.appendChild(fragment);
    }
}

DependencyHub.add(SML);