import { PROPORTIONS_KG, PRICES } from "../constants.js";
import DependencyHub from "../dependencyResolvers/dependencyHub.js";

export default class ResultsDisplay {
  static dependencies = ["StringUtil", "EventBus", "EventUtil"];

  constructor() {
    this.prices = PRICES;
    this.proportions = PROPORTIONS_KG;
    this.subscriberId = "FriesCalculator";
    this.displayData = this._displayData.bind(this);
    this.element = document.querySelector("main .output");
    this.form = this.element.querySelector("form");
    this.init();
  }

  init() {
    this.eventBus.on("calculatorData", this.subscriberId, this.displayData);
    this.eventBus.on("resetForm", this.subscriberId, () =>
      this.eventUtil.resetForm(this.form, 0)
    );
  }

  _displayData(data) {
    const inputObject = this.eventUtil.inputObject(this.form);
    console.log(data);
    inputObject["actualUsage"].value = data.actualUsage.toFixed(2);
    inputObject["actualPrice"].value = ((inputObject["actualUsage"].value / this.proportions.box) * this.prices.friesBoxFrozen).toFixed(2)
    inputObject["theoreticalUsage"].value = data.theoreticalUsage.toFixed(2);
    inputObject["theoreticalPrice"].value = ((inputObject["theoreticalUsage"].value / this.proportions.box) * this.prices.friesBoxFrozen).toFixed(2)
    // inputObject['actualBox'].value = (data / this.proportions.box).toFixed(2);
  }
}

DependencyHub.add(ResultsDisplay);
