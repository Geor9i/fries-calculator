import BaseSmlComponent from "./baseSmlComponent.js";
export default class SMLComponent extends BaseSmlComponent {
  constructor() {
    super();
    this.onInit();
  }
  onInit() {}

  afterViewInit() {}

  m(stringsArr, ...values) {
    const placeHolders = [];
    let htmlString = ``;
    // Recombine html string parts
    stringsArr.forEach((str, i) => {
      htmlString += str;
      const value = values[i];
      if (value && typeof value === "string") {
        htmlString += value;
      } else if (value) {
        placeHolders.push({ index: htmlString.length, value });
      }
    });
    return this.sml.stringToTree({ htmlString, placeHolders, parentComponent: this });
  }


 
}
