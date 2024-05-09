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

        if (!this.regex.element.test(linkedString) && linkedString.length && !/^\s+$/g.test(linkedString)) {
            return [linkedString];
        }

        const tagTree = (currentString => {
            const tagTree = [];
            const availableTags = [];
            const tagTypes = {
                open: this.regex.openingTag,
                selfClose: this.regex.selfClosingTag,
                close: this.regex.closingTag,
            }
            console.log(currentString);
            const tagCollection = currentString.matchAll(this.regex.tag);
            for(let tagMatch of tagCollection) {
                const name = tagMatch.groups.tagName;
                let type = Object.keys(tagTypes).find(expr => tagTypes[expr].test(tagMatch[0]));
                const startIndex = tagMatch.index;
                const endIndex = startIndex + tagMatch[0].length;
                availableTags.push({name, type, startIndex: startIndex ,endIndex: endIndex});
            }
            const tagPairs = [];
           while(availableTags.length) {
                let openTag = availableTags.shift();
                const { name, type } = openTag;
                if (type === 'open') {
                    let sameTags = availableTags.filter(tag => tag.name === name && (tag.type === 'close' || tag.type === 'open'));
                    let opentags = 0;
                    for (let tag of sameTags) {
                        if (tag.type === 'close' && opentags <= 0) {
                            tagPairs.push({open: openTag, close: tag});
                            break;
                        } else if (tag.type === 'close' && opentags > 0) {
                            opentags--;
                        } else if (tag.type === 'open'){
                            opentags++
                        }
                    }
                } else if (type === 'selfClose') {
                    tagPairs.push({open: openTag, close: openTag})
                }
            }
            tagPairs.map((pair, i) => {
                    pair.string = currentString.slice(pair.open.startIndex, pair.close.endIndex);
                    pair.id = i;
                    return pair
            });

            const sortTag = (a, b) => {
                if (a.open.startIndex >= b.open.startIndex && a.close.endIndex <= b.close.endIndex) {
                    return 1
                } else {
                    return -1
                }
            }

            const sortedTagPairs = tagPairs.sort(sortTag);
            const usedIndexes = {};
            let buildTree = (parent) => {
                const tagTree = [];
                if (!parent) {
                    parent = sortedTagPairs.find(pair => !usedIndexes[pair.id]);
                    if (!parent) return tagTree;
                    usedIndexes[parent.id] = true;
                }
                const parentTagName = parent.open.name;
                const isComponent = !this.validHTMLElements.includes(parentTagName);
                const attributes = {};
                const children = [];
                const attributeMatch = parent.string.slice(0, parent.open.endIndex - parent.open.startIndex).matchAll(this.regex.attribute);
                for(const entry of attributeMatch){
                    const { attribute, value } = entry.groups;
                    attributes[attribute] = value ? value : true;
                }
                let textContentString = currentString.slice(parent.open.endIndex, parent.close.startIndex)
                textContentString = textContentString.replace(this.regex.element, '');
                if (textContentString.length && !textContentString.match(/^\s+$/g)) {
                    children.push(textContentString);
                }
                
                tagTree.push({...parent,  attributes, children, isComponent});
                if (parent.open.type === 'selfClose') {
                    return tagTree;
                }
                let directChildren = sortedTagPairs.filter(pair => !usedIndexes[pair.id] && pair.open.startIndex >= parent.open.startIndex && pair.close.endIndex <= parent.close.endIndex).sort(sortTag);
                if (!directChildren.length) {
                    return tagTree;
                }
                while(Object.keys(usedIndexes).length < sortedTagPairs.length) {
                    let child = directChildren.find(pair => !usedIndexes[pair.id]);
                    usedIndexes[child.id] = true
                    if (!child) return tagTree;
                    child = buildTree(child);
                    tagTree[tagTree.length - 1].children.push(...child);
                }
                return tagTree;
            }
            while(Object.keys(usedIndexes).length < sortedTagPairs.length) {
                tagTree.unshift(...buildTree());
            }
            let surroundText = [];
            let prevTagEndIndex = 0;
            tagTree.forEach((parentTag, i) => {
                let text = currentString.slice(prevTagEndIndex, parentTag.open.startIndex);
                prevTagEndIndex = parentTag.close.endIndex
                if (text.length && !/^\s+$/g.test(text)) {
                    surroundText.push({text, treeIndex: i})
                }
                if (i === tagTree.length - 1) {
                let postText = currentString.slice(parentTag.close.endIndex);
                if (postText.length && !/^\s+$/g.test(postText)) {
                    surroundText.push({text: postText, treeIndex: tagTree.length})
                }
                }
            })
            let counter = 0;
            surroundText.forEach(entry => {
                tagTree.splice(entry.treeIndex + counter, 0, entry.text);
                counter++;
            })
            console.log(tagTree);
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