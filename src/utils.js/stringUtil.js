import DependencyHub from "../dependencyResolvers/dependencyHub.js";

export default class StringUtil {
  // static dependencies = ['EventUtil'];

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

  trimValue(string, trimValues = []) {
    trimValues.forEach((entry) => {
      const { value, start, end, remainAmount } = entry;
      let remain = remainAmount ? remainAmount : 0;
      if (start !== false && string.startsWith(value)) {
        const pattern = new RegExp(`^${value}+`);
        string = string.replace(pattern, value.repeat(remain));
      }
      if (end !== false && string.endsWith(value)) {
        const pattern = new RegExp(`${value}+$`);
        string = string.replace(pattern, value.repeat(remain));
      }
    });
    return string;
  }

  patternSplice(string, patterns = []) {
    patterns.forEach((entry) => {
      const { pattern, replace } = entry;
      const replacevalue = replace ? replace : '';
      string = string.replace(pattern, replacevalue);
    });
    return string;
  }

  sanitizeInput(form) {
    const formObj = this.eventUtil.inputObject(form);
    Object.keys(formObj).forEach((key) => {
      const inputField = formObj[key];
      let filteredString = this.stringUtil.filterString(inputField.value, [
        { symbol: "\\d", matchLimit: this.numberLimit },
        { symbol: "\\," },
        { symbol: "\\.", matchLimit: 1 },
      ]);
      filteredString = this.stringUtil.patternSplice(filteredString, [
        { pattern: /\,{2,}/, replace: "," },
      ]);
      inputField.value = this.stringUtil.trimValue(filteredString, [
        { value: "0", end: false, remainAmount: 1 },
      ]);
    });
  }
}

DependencyHub.add(StringUtil);