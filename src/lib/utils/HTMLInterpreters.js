import { patterns, selfClosingTags, validHTMLElements } from "../constants/constants.js";

export default class HTMLInterpreters {

    constructor () {
        this.selfClosingTags = selfClosingTags;
        this.validHTMLElements = validHTMLElements;
        this.regex = patterns;
    }

    getStringTagType(tagString, tagName) {
        const tagTypes = {
            open: this.regex.openingTag,
            selfClose: this.regex.selfClosingTag,
            close: this.regex.closingTag,
        }
        let type = Object.keys(tagTypes).find(expr => tagTypes[expr].test(tagString));
        if (type === 'open' && this.selfClosingTags.includes(tagName)) {
            type = 'selfClose'
        }
        return type;
    }

    findTags(string) {
        const availableTags = [];
        // Collection of all html tag matches
        const tagCollection = string.matchAll(this.regex.tag);
        for(let tagMatch of tagCollection) {
            const name = tagMatch.groups.tagName;
            let type = this.getStringTagType(tagMatch[0], name);
            // tag start and end index from main string
            const startIndex = tagMatch.index;
            const endIndex = startIndex + tagMatch[0].length;
            availableTags.push({name, type, startIndex: startIndex, endIndex: endIndex});
        }
        return availableTags;
    }

    pairTags(unpairedTags, htmlString) {
        const allTags = unpairedTags.map((tag, i) => ({...tag, id: i}));
        let tagPairs = [];
        const usedIndexes = {};
        let remainingTagCount = allTags.length;
        // Attempt to find all tag pairs
       while(remainingTagCount > 0) {
            let currentTag = allTags.find((tag) => !usedIndexes[tag.id]);
            if (!currentTag) break;
            usedIndexes[currentTag.id] = true;
            const { name, type } = currentTag;
            if (type === 'open') {
                let potentialTagPairs = allTags.filter((tag) => !usedIndexes[tag.id] && tag.name === name && (tag.type === 'close' || tag.type === 'open'));
                let opentags = 0;
                for (let tag of potentialTagPairs) {
                    if (tag.type === 'close' && opentags <= 0) {
                        tagPairs.push({open: currentTag, close: tag});
                        usedIndexes[tag.id] = true;
                        remainingTagCount--;
                        break;
                    } else if (tag.type === 'close' && opentags > 0) {
                        opentags--;
                    } else if (tag.type === 'open'){
                        opentags++
                    }
                }
            } else if (type === 'selfClose') {
                tagPairs.push({open: currentTag, close: currentTag});
            }
            remainingTagCount--;
        }
        tagPairs = tagPairs.map((pair, i) => {
                pair.string = htmlString.slice(pair.open.startIndex, pair.close.endIndex);
                pair.id = i;
                return pair
        });

        return tagPairs.sort(this.sortTagPair);
    }

    sortTagPair(a, b) {
        if (a.open.startIndex <= b.open.startIndex && a.close.endIndex >= b.close.endIndex) {
            return -1
        } else {
            return 1
        }
    }

    buildTree(sortedTagPairs, htmlString) {
        const tagTree = [];
        const usedIndexes = {};
        let buildTree = (parent) => {
                let tagTree = [];
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
                
                if (parent.open.type === 'selfClose') {
                    tagTree.push({...parent,  attributes, children, isComponent});
                    return tagTree; 
                }
                let directChildren = sortedTagPairs.filter(pair => !usedIndexes[pair.id] && pair.open.startIndex >= parent.open.startIndex && pair.close.endIndex <= parent.close.endIndex).sort(this.sortTagPair);'        '
                let childrenCount = directChildren.length;
                let sliceStartIndex = parent.open.endIndex;
                while(childrenCount > 0) {
                    let child = directChildren.find(pair => !usedIndexes[pair.id]);
                    if (!child) break;
                    usedIndexes[child.id] = true;
                    child = buildTree(child);
                    let text = htmlString.slice(sliceStartIndex, child[0].open.startIndex);
                    sliceStartIndex = child[0].close.endIndex;
                    if (text.length && !/^\s+$/g.test(text)) {
                        children.push(text)
                    }
                    children.push(...child);
                    if (childrenCount === 1) {
                    let endText = htmlString.slice(sliceStartIndex, parent.close.startIndex);
                    if (endText.length && !/^\s+$/g.test(endText)) {
                        children.push(endText)
                    }
                    }
                    childrenCount = directChildren.filter(pair => !usedIndexes[pair.id]).length;
                }

                if (!directChildren.length) {
                    let text = htmlString.slice(parent.open.endIndex, parent.close.startIndex);
                    if (text.length && !/^\s+$/g.test(text)) {
                        children.push(text)
                    }
                }

                
                tagTree.push({...parent,  attributes, children, isComponent});
                return tagTree;
            }

            while(Object.keys(usedIndexes).length < sortedTagPairs.length) {
                tagTree.push(...buildTree());
            }
            return tagTree;

    }

    insertTagTreeSurroundText(tagTree, currentString) {
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
        return tagTree;
    }

}

