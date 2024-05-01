export default class Util {
  constructor() {}


  /**
   *
   * @param {String} string The string to be filtered
   * @param {String} regexSymbols[].symbol - The regex symbol.
   * @param {Number} regexSymbols[].matches - The match limit for the regex symbol. If not provided or 0, matches any quantity.
   * @param {Boolean} regexSymbols[].remove Keep or Reject matches
   * @returns filtered value
   */
  filterString(string, regexSymbols = []) {
    if (typeof string !== "string") {
      throw new Error(`${string} is not of type String!`);
    }
    const stringSpread = string
      .split("")
      .map((char) => ({ char, matched: false }));

    for (let i = 0; i < stringSpread.length; i++) {
      let { char, matched } = stringSpread[i];
      if (matched) continue;

      for (let s = 0; s < regexSymbols.length; s++) {
        let { symbol, matchLimit, remove } = regexSymbols[s];
        let pattern = "";
        const prefix = remove ? "^" : "";
        if (matchLimit === undefined || matchLimit > 0) {
          pattern = new RegExp(`[${prefix}${symbol}]`, "g");
        } else {
          continue;
        }

        if (!matched) {
          let pass = pattern.test(char);
          if (pass) {
            stringSpread[i].matched = pass;
            if (regexSymbols?.[s]?.matchLimit) {
              regexSymbols[s].matchLimit -= 1;
            }
            break;
          }
        }
      }
    }
    return stringSpread
      .map(({ char, matched: match }) => (match ? char : ""))
      .join("");
  }
}
