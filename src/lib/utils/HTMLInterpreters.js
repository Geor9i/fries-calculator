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

    pairTags(unpairedTags) {
        const allTags = unpairedTags.map((tag, i) => ({...tag, id: i}));
        let tagPairs = [];
        const usedIndexes = {};
        // Attempt to find all tag pairs
       while(allTags.length !== usedIndexes.length) {
            let currentTag = allTags.find((tag) => !usedIndexes[tag.id]);
            if (!currentTag) return tagPairs;
            usedIndexes[currentTag.id] = true;
            const { name, type } = currentTag;
            if (type === 'open') {
                let potentialTagPairs = allTags.filter((tag) => !usedIndexes[tag.id] && tag.name === name && (tag.type === 'close' || tag.type === 'open'));
                let opentags = 0;
                for (let tag of potentialTagPairs) {
                    if (tag.type === 'close' && opentags <= 0) {
                        tagPairs.push({open: currentTag, close: tag});
                        usedIndexes[tag.id] = true;
                        break;
                    } else if (tag.type === 'close' && opentags > 0) {
                        opentags--;
                    } else if (tag.type === 'open'){
                        opentags++
                    }
                }
            } else if (type === 'selfClose') {
                tagPairs.push({open: currentTag, close: currentTag})
            }
        }
        tagPairs = tagPairs.map((pair, i) => {
                pair.string = currentString.slice(pair.open.startIndex, pair.close.endIndex);
                pair.id = i;
                return pair
        });

        return tagPairs.sort(this.sortTagPair);
    }

    sortTagPair(a, b) {
        if (a.open.startIndex >= b.open.startIndex && a.close.endIndex <= b.close.endIndex) {
            return 1
        } else {
            return -1
        }
    }
}

