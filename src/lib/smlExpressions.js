export default class SmlExpresions {

    constructor() {
        this.patterns = {
            numbers: /[0-9]+/g,
            variables: /\w+/g,
            group: /\([\s\S]+?\)/g,
            booleans: /true|false/g,
            falsy: /null|undefined/g,
            operators: /\+|\-|\*|\/|<=|<|>=|>|\|\||&&|===|==/g,
        };
        this.priorities = ['boolean', 'falsy', 'numbers', 'variables']
    }

    parse(stringExpression) {
        console.log(stringExpression);
        const matches = {};
        let orderedTokens = [];
        for (let pattern in this.patterns) {
            matches[pattern] = Array.from(stringExpression.matchAll(this.patterns[pattern]))
            .map(result => ({token: result[0], index: result.index, type: pattern}))
            orderedTokens.push(...matches[pattern])
        }
        orderedTokens = orderedTokens.sort((a, b) => a.index - b.index);
        console.log(orderedTokens);
        let sortedTokens = [];
        let usedIndexes = [];
        let i = 0;
        while(usedIndexes.length < orderedTokens.length){
            let token = orderedTokens[i];
            usedIndexes.push(i);
            let clashed = [token];
            for (let j = i;j < orderedTokens.length;j++) {
                let currentToken = orderedTokens[j];
                if (currentToken.index === token.index && currentToken.token === token.token) {
                    clashed.push(currentToken);
                    usedIndexes.push(j);
                }
            }
            let prioritizedToken = clashed.sort((a, b) => this.priorities.findIndex(pattern => pattern === a.type) - this.priorities.findIndex(pattern => pattern === b.type))[0];
            sortedTokens.push(prioritizedToken);
            i = orderedTokens.findIndex((_, index) => !usedIndexes.includes(index))
        }
        console.log(sortedTokens);

    }
}