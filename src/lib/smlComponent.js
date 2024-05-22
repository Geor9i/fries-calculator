import BaseSmlComponent from "./baseSmlComponent.js";
export default class SMLComponent extends BaseSmlComponent {
  constructor() {
    super();
    this.onInit();
  }
  _reRender() {
    console.log(this.changes);
    console.log('tree: ', this.tree);
    console.log('tree copy: ', this.treeState);
    // this.objectUtil.compare(this.tree, this.treeState, { fullReport: true, log:true, types: true })
    // console.log(this.tree === this.treeState);
  }

  _resetChanges() {
    this.changes = [];
  }

  onInit() {}

  afterViewInit() {}

  onChanges() {
  }
 
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
