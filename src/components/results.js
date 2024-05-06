import UnitValues from "./unitValues.js";
import DependencyHub from "../dependencyResolvers/dependencyHub.js";

export default class ResultsDisplay {
  static dependencies = ["StringUtil", "EventBus", "EventUtil"];

  constructor() {
    this.prices = PRICES;
    this.proportions = FROZEN_INVENTORY_KG;
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
    const prices = UnitValues.getValue('PRICES');
    const frozenWeight = UnitValues.getValue('_FROZEN_INVENTORY_WEIGHT_KG');
    inputObject["actualUsage"].value = data.actualUsage.toFixed(2);
    inputObject["actualPrice"].value = ((inputObject["actualUsage"].value / frozenWeight.box) * prices.friesBoxFrozen).toFixed(2)
    inputObject["theoreticalUsage"].value = data.theoreticalUsage.toFixed(2);
    inputObject["theoreticalPrice"].value = ((inputObject["theoreticalUsage"].value / frozenWeight.box) * prices.friesBoxFrozen).toFixed(2)
    // inputObject['actualBox'].value = (data / this.proportions.box).toFixed(2);
  }
}

DependencyHub.add(ResultsDisplay);
