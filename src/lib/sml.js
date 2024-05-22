import {
  patterns,
  selfClosingTags,
  smlTags,
  validHTMLElements,
} from "./constants/constants.js";
import { SmlElement } from "./smlElement.js";
import WatcherArray from "./utils/watcherArray.js";
 class SML {
  constructor() {
    this.selfClosingTags = selfClosingTags;
    this.validHTMLElements = validHTMLElements;
    this.smlTags = smlTags;
    this.regex = patterns;
    this.components = [];
  }

  stringToTree({ htmlString, placeHolders, ...options }) {
    //? if the string contains no html return the text
    if (!htmlString.match(this.regex.element)) {
        return /^\s+$/g.test(htmlString) ? [] : [htmlString];
    }
    const availableTags = this.findTags(htmlString);
    const tagPairs = this.pairTags(availableTags, htmlString);
    let tagTree = this.buildTree(tagPairs, htmlString, placeHolders, options);
    return tagTree;
  }

  getStringTagType(tagString, tagName) {
    const tagTypes = {
      open: this.regex.openingTag,
      selfClose: this.regex.selfClosingTag,
      close: this.regex.closingTag,
    };
    let typeObj = Object.keys(tagTypes).reduce((obj, expr) => {
      obj[expr] = tagTypes[expr].test(tagString);
      return obj;
    }, {});
    const passCount = Object.keys(typeObj).filter(
      (result) => typeObj[result]
    ).length;
    let type;
    if (passCount === 1) {
      type = Object.keys(typeObj).find((test) => typeObj[test]);
      if (type === "open" && this.selfClosingTags.includes(tagName)) {
        type = "selfClose";
      }
    } else {
      if (typeObj.open && typeObj.selfClose) {
        type = "selfClose";
      }
    }

    return type;
  }

  findTags(string) {
    const availableTags = [];
    // Collection of all html tag matches
    const tagCollection = string.matchAll(this.regex.tag);
    for (let tagMatch of tagCollection) {
      const name = tagMatch.groups.tagName;
      let type = this.getStringTagType(tagMatch[0], name);
      // tag start and end index from main string
      const startIndex = tagMatch.index;
      const endIndex = startIndex + tagMatch[0].length;
      availableTags.push({
        name,
        type,
        startIndex: startIndex,
        endIndex: endIndex,
      });
    }
    return availableTags;
  }

  pairTags(unpairedTags, htmlString) {
    const allTags = unpairedTags.map((tag, i) => ({ ...tag, id: i }));
    let tagPairs = [];
    const usedIndexes = {};
    let remainingTagCount = allTags.length;
    // Attempt to find all tag pairs
    while (remainingTagCount > 0) {
      let currentTag = allTags.find((tag) => !usedIndexes[tag.id]);
      if (!currentTag) break;
      usedIndexes[currentTag.id] = true;
      const { name, type } = currentTag;
      if (type === "open") {
        let potentialTagPairs = allTags.filter(
          (tag) =>
            !usedIndexes[tag.id] &&
            tag.name === name &&
            (tag.type === "close" || tag.type === "open")
        );
        let opentags = 0;
        for (let tag of potentialTagPairs) {
          if (tag.type === "close" && opentags <= 0) {
            tagPairs.push({ open: currentTag, close: tag });
            usedIndexes[tag.id] = true;
            remainingTagCount--;
            break;
          } else if (tag.type === "close" && opentags > 0) {
            opentags--;
          } else if (tag.type === "open") {
            opentags++;
          }
        }
      } else if (type === "selfClose") {
        tagPairs.push({ open: currentTag, close: currentTag });
      }
      remainingTagCount--;
    }
    tagPairs = tagPairs.map((pair, i) => {
      pair.string = htmlString.slice(pair.open.startIndex, pair.close.endIndex);
      pair.id = i;
      return pair;
    });
    return tagPairs.sort(this.sortTagPair);
  }

  sortTagPair(a, b) {
    if (a.open.startIndex < b.open.startIndex && a.close.endIndex > b.close.endIndex) {
      return -1;
    } else if (a.open.startIndex > b.open.startIndex && a.close.endIndex < b.close.endIndex) {
      return 1;
    } else {
      return 0
    }
  }

  buildTree(sortedTagPairs, htmlString, placeHolders, options) {
    const tagTree = new WatcherArray();
    if (options?.parentComponent) {
      const component = options.parentComponent;
      const logChange = () => {
        component._logChange({
        message: 'Direct Component Tree Children Change',
        newState: [...component.tree],
        oldState: [...component.oldTreeState]
      })
      }
      const unsubscribe = tagTree.on('change', logChange.bind(this));
      component.unsubscribeArr.push(unsubscribe);
    }
    const usedIndexes = {};
    let prevTagEndIndex = 0;
    let buildTreePartial = (parent) => {
      let tagTree = [];
      let postText = null;
      if (!parent) {
        parent = sortedTagPairs.find((pair) => !usedIndexes[pair.id]);
        if (!parent) return tagTree;
        usedIndexes[parent.id] = true;
        let preText = htmlString.slice(
          prevTagEndIndex,
          parent.open.startIndex
        );
      prevTagEndIndex = parent.close.endIndex;
      if (preText.length && !/^\s+$/g.test(preText)) {
        tagTree.push({type: 'textNode', text: preText, key: null});
      }
      if (Object.keys(usedIndexes).length === sortedTagPairs.length) {
        postText = htmlString.slice(parent.close.endIndex);
      }

      }
      const tagName = parent.open.name;
      const isSmlTag = this.smlTags.includes(tagName);
      const isComponent = !this.validHTMLElements.includes(tagName) && !isSmlTag;
      let tagNode = isComponent ? { type: tagName, children: [], attributes: {} } : new SmlElement(tagName, {}, [], options.parentComponent);
      if (!isComponent) {
        const component = options.parentComponent;
        //? Reset attribute and children old state
        const subscription = component.on('doneProcessing', () => {
          tagNode._previousAttributesState = {...tagNode.attributes};
          tagNode._previousChildrenState = [...tagNode.children];
        });
        tagNode.unsubscribeArr.push(subscription);
      }
     
      const tagProps = placeHolders.filter(
        (entry) =>
          parent.open.startIndex <= entry.index &&
          parent.close.endIndex >= entry.index
      );
      const attributeMatch = parent.string
        .slice(0, parent.open.endIndex - parent.open.startIndex)
        .matchAll(this.regex.attribute);
      // map tag attributes
      for (const entry of attributeMatch) {
        let { attribute, value } = entry.groups;
        value = value === undefined ? true : value;
        tagNode.attributes[attribute] = value;
      }

      if (parent.open.type === "open") {
        let directChildren = sortedTagPairs
          .filter(
            (pair) =>
              !usedIndexes[pair.id] &&
              pair.open.startIndex >= parent.open.startIndex &&
              pair.close.endIndex <= parent.close.endIndex
          )
          .sort(this.sortTagPair);
        let childrenCount = directChildren.length;
        let sliceStartIndex = parent.open.endIndex;
        while (childrenCount > 0) {
          let child = directChildren.find((pair) => !usedIndexes[pair.id]);
          if (!child) break;
          usedIndexes[child.id] = true;
          let childNode = buildTreePartial(child);
          let text = htmlString.slice(
            sliceStartIndex,
            child.open.startIndex
          );
          sliceStartIndex = child.close.endIndex;
          if (text.length && !/^\s+$/g.test(text)) {
            tagNode.children.push({type: 'textNode', text, key: null });
          }
          tagNode.children.push(...childNode);
          if (childrenCount === 1) {
            let endText = htmlString.slice(
              sliceStartIndex,
              parent.close.startIndex
            );
            if (endText.length && !/^\s+$/g.test(endText)) {
              tagNode.children.push({type: 'textNode', text: endText, key: null});
            }
          }
          childrenCount = directChildren.filter(
            (pair) => !usedIndexes[pair.id]
          ).length;
        }

        if (!directChildren.length) {
          let text = htmlString.slice(
            parent.open.endIndex,
            parent.close.startIndex
          );
          if (text.length && !/^\s+$/g.test(text)) {
            tagNode.children.push({type: 'textNode', text, key: null });
          }
        }
      }

      if (isComponent) {
        const storedComponent = this.components.find(
          (entry) => entry.name === tagNode.type
        );
        if (!storedComponent) {
          throw new Error(`${tagNode.type} is not a known Component!`);
        }
          const instance = new storedComponent.component();
          instance.attributes = tagNode.attributes;
          instance.children = tagNode.children;
          instance.render();
          instance._resetChanges();
          instance._isProcessing = false;
          instance.afterViewInit();
          
          tagNode = { type: tagName, instance };
      }

      if (isSmlTag && options?.parentComponent) {
          const { children } = options.parentComponent;
          if (children && tagNode.type === 'sml-content') {
            tagTree.push(...children);
          }

      } else {
        tagTree.push(tagNode);
      }

      if (postText && postText.length && !/^\s+$/g.test(postText)) {
        tagTree.push({type: 'textNode', text: postText, key: null});
      }

      return tagTree;
    };

    while (Object.keys(usedIndexes).length < sortedTagPairs.length) {
      tagTree.push(...buildTreePartial());
    }
    return tagTree;
  }

}

export const sml = new SML();
