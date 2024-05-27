export default class SmlExpresions {

    constructor() {
        this.patterns = [
            {group: /\(|\)/g},
            {memberAccess: /\./g},
            {computedMemberAccess: /\[|\]/g},
            {optionalChaining: /\?\./g},
            {ternary: /\?|\:/g},
            {increment: /\+\+|\-\-/g},
            {not: /\!/g},
            {unary: /\+|\-/g},
            {of: /\bof\b/g},
            {typeof: /\btypeof\b/g},
            {delete: /\bdelete\b/g},
            {exponential: /\*\*/g},
            {multiplication: /\*|\/|%/g},
            {relational: /<=|<|>=|>|\binstanceof\b|\bin\b/g},
            {equality: /===|==|!==|!=/g},
            {numbers: /\b[0-9]+\b/g},
            {booleans: /\b(true|false)\b/g},
            {falsy: /\b(null|undefined)\b/g},
            {declaration: /\b(let|const)\b/g},
            {variables: /\b\w+\b/g},
            {colons: /\:|\;/g},
            {quotes: /\"|\'/g},
            {assignment: /\+=|-=|\*=|\/=|=/g},
            {logical: /\|\||&&|\?\?/g},
        ];
    }
    
    parseTokens(stringExpression) {
        const matches = {};
        let orderedTokens = [];
        for (let patternObj of this.patterns) {
            const name = Object.keys(patternObj)[0];
            const pattern = patternObj[name];
            matches[name] = Array.from(stringExpression.matchAll(pattern))
            .map(result => ({token: result[0], startIndex: result.index, endIndex: result.index + result[0].length, type: name}))
            orderedTokens.push(...matches[name])
        }
        orderedTokens = orderedTokens.sort((a, b) => a.startIndex - b.startIndex);
        let sortedTokens = [];
        let usedIndexes = new Set();
        let i = 0;
        while(usedIndexes.size < orderedTokens.length){
            let token = orderedTokens[i];
            usedIndexes.add(i);
            let clashed = [token];
            for (let j = i;j < orderedTokens.length;j++) {
                let currentToken = orderedTokens[j];
                if (usedIndexes.has(j)) continue;
                if (currentToken.startIndex >= token.startIndex && currentToken.endIndex <= token.endIndex) {
                    clashed.push(currentToken);
                    usedIndexes.add(j);
                }
            }
            let prioritizedToken = clashed.sort((a, b) => this.patterns.findIndex(pattern => pattern === a.type) - this.patterns.findIndex(pattern => pattern === b.type))[0];
            sortedTokens.push(prioritizedToken);
            i = orderedTokens.findIndex((_, index) => !usedIndexes.has(index))
        }
        return sortedTokens;
    }

    groupExpressions(tokens) {
        const usedIndexes = {};
        const remainingTokens = [];
        const result = [];
        let remainingTagCount = tokens.length;
        tokens = tokens.map((token, i) => ({...token, inputIndex: i}))
        // Attempt to find all tag pairs
        while (remainingTagCount > 0) {
          let tokenIndex = tokens.findIndex((_, i) => !usedIndexes[i]);
          if (tokenIndex === -1) break;
          usedIndexes[tokenIndex] = true;
        //   {token: result[0], startIndex: result.index, endIdex: result.index + result[0].length, type: pattern}
          const token = tokens[tokenIndex];
          if (token.type === "group") {
            let potentialTokenPairs = tokens.filter((tag, i) => !usedIndexes[i] && tag.type === 'group');
            let openGroupTokens = 0;
            for (const currentToken of potentialTokenPairs) {
              if (currentToken.token === ")" && openGroupTokens <= 0) {
                const group = {startIndex: token.startIndex, endIndex: currentToken.endIndex, type: 'group', inner: []};
                result.push(group)
                usedIndexes[currentToken.inputIndex] = true;
                remainingTagCount--;
                break;
              } else if (currentToken.token === ')' && openGroupTokens > 0) {
                openGroupTokens--;
              } else if (currentToken.token === "(") {
                openGroupTokens++;
              }
            }
          } else if (token.type === "operator" && token.token === '?') {
            let colon = tokens.find((tag, i) => !usedIndexes[i] && tag.type === 'colons' && tag.token === ':');
            if (!colon) {
                throw new Error(`Unrecognized token after ? at ${token.startIndex}!`);
            }
                const group = {startIndex: token.startIndex, endIndex: currentToken.endIndex, type: 'group', inner: []};
                result.push(group)
                usedIndexes[currentToken.inputIndex] = true;
                remainingTagCount--;
          } else {
            remainingTokens.push(token)
          }
          remainingTagCount--;
        }
        console.log('remainingTokens: ', remainingTokens);
        console.log(result);
        return result
    }

    evaluate(stringExpression) {
        console.log(stringExpression);
        const tokens = this.parseTokens(stringExpression);
        const groupedTokens = this.groupExpressions(tokens);
    }
}