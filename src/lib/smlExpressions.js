export default class SmlExpresions {

    constructor() {
        this.patterns = {
            numbers: /\b[0-9]+\b/g,
            variables: /\b\w+\b/g,
            group: /\(|\)/g,
            booleans: /\b(true|false)\b/g,
            falsy: /\b(null|undefined)\b/g,
            declaration: /\b(let|const)\b/g,
            operators: /\(\+|\-|\*|\/|<=|<|>=|>|\|\||&&|\?\?|\?|\:|\;|===|==\)/g,
        };
    }
    
    parseTokens(stringExpression) {
        console.log(stringExpression);
        const priorities = ['boolean', 'falsy', 'numbers', 'declaration', 'variables']
        const matches = {};
        let orderedTokens = [];
        for (let pattern in this.patterns) {
            matches[pattern] = Array.from(stringExpression.matchAll(this.patterns[pattern]))
            .map(result => ({token: result[0], startIndex: result.index, endIdex: result.index + result[0].length, type: pattern}))
            orderedTokens.push(...matches[pattern])
        }
        orderedTokens = orderedTokens.sort((a, b) => a.startIndex - b.startIndex);
        let sortedTokens = [];
        let usedIndexes = [];
        let i = 0;
        while(usedIndexes.length < orderedTokens.length){
            let token = orderedTokens[i];
            usedIndexes.push(i);
            let clashed = [token];
            for (let j = i;j < orderedTokens.length;j++) {
                let currentToken = orderedTokens[j];
                if (currentToken === token || usedIndexes.includes(j)) continue;
                if (currentToken.startIndex >= token.startIndex && currentToken.endIdex <= token.endIdex) {
                    clashed.push(currentToken);
                    usedIndexes.push(j);
                }
            }
            let prioritizedToken = clashed.sort((a, b) => priorities.findIndex(pattern => pattern === a.type) - priorities.findIndex(pattern => pattern === b.type))[0];
            sortedTokens.push(prioritizedToken);
            i = orderedTokens.findIndex((_, index) => !usedIndexes.includes(index))
        }
        return sortedTokens;
    }

    evaluate(stringExpression) {
        const tokens = this.parseTokens(stringExpression);
        console.log(tokens);
    }
}