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
        const tagPairs = [];
        // Attempt to find all tag pairs
       while(unpairedTags.length) {
            let openTag = unpairedTags.shift();
            const { name, type } = openTag;
            if (type === 'open') {
                let sameTags = unpairedTags.filter(tag => tag.name === name && (tag.type === 'close' || tag.type === 'open'));
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
    }
}

