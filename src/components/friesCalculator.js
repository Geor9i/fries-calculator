import DependencyHub from "../dependencyResolvers/dependencyHub.js";
import UnitValues from "./unitValues.js";

export default class FriesCalculator {

  static dependencies = ['StringUtil', 'EventBus', 'EventUtil']

  constructor() {
    this.subscriberId = 'FriesCalculator';
    this.portionEgdeCases = PORTION_EGDE_CASES;
    this.resipePortion = FROZEN_PORTIONS_KG;
    this.cookedPortion = COOKED_PORTIONS_KG;
    this.unitToggles = UNIT_TOGGLES;
    this.numberLimit = 6;
    this.form = document.querySelector(".input > form");
    this.resetButton = this.form.querySelector(".reset-container a");
    this.hoverUnit = this._hoverUnit.bind(this);
    this.endHoverUnit = this._endHoverUnit.bind(this);
    this.clickHandler = this._clickHandler.bind(this);
    this.resetHandler = this._resetHandler.bind(this);
    this.inputHandler = this._inputHandler.bind(this);
    this.init();
  }

  init() {
    this.form.addEventListener("input", this.inputHandler);
    this.resetButton.addEventListener("click", this.resetHandler);
    document.body.addEventListener("mouseover", this.hoverUnit);
    document.addEventListener("click", this.clickHandler);
    const formElements = this.eventUtil.inputObject(this.form);
    this.eventBus.on("OptionsUpdate", this.subscriberId, this._updateOptionsReceiveRecalculate)
  }

  _updateOptionsReceiveRecalculate(data) {
    const [key, value] = Object.entries(data)[0];
    console.log({key, value});
  }

  _hoverUnit(e) {
    const element = e.target;
    if (element.matches(".unit")) {
      element.classList.add("unit-hover");
      element.addEventListener("mouseout", this.endHoverUnit);
    }
  }

  _endHoverUnit(e) {
    e.target.classList.remove("unit-hover");
    e.target.removeEventListener("mouseout", this.endHoverUnit);
  }

  _resetHandler() {
    this.eventUtil.resetForm(this.form, 0);
    this._resetUnits();
    this.eventBus.emit("resetForm");
  }

  _resetUnits() {
    const unitElements = Array.from(document.querySelectorAll('.unit'));
    unitElements.forEach(element => {
      if (!element.dataset.unit) return;
      const unitKey = element.dataset.unit.split('&')[0];
      element.dataset.id = this.unitToggles[unitKey][0]
    })
  }

  _clickHandler(e) {
    if (e.target.matches('input[type="text"]')) {
      e.target.select();
    } else if (e.target.matches(".unit")) {
      // Toggle between units and unit modes
      const currrentUnit = e.target.dataset.id;
      const hasKeys = e.target.dataset.unit; 
      if (!hasKeys) return;

      const unitKeys = e.target.dataset.unit.split("&");
      for (let i = 0; i < unitKeys.length; i++) {
        let currentUnitKey = unitKeys[i];
        if (!this.unitToggles[currentUnitKey].includes(currrentUnit)) continue;
        let unitIndex = Math.min(
          this.unitToggles[currentUnitKey].length - 1,
          this.unitToggles[currentUnitKey].findIndex((unit) => unit === currrentUnit)
        );
        if (unitIndex === this.unitToggles[currentUnitKey].length - 1) {
          if (unitKeys.length > 1) {
            if (i >= unitKeys.length - 1) {
              currentUnitKey = unitKeys[0];
              e.target.dataset.id = this.unitToggles[currentUnitKey][0];
            } else {
              currentUnitKey = unitKeys[i + 1];
              e.target.dataset.id = this.unitToggles[currentUnitKey][0];
            }
          } else {
            e.target.dataset.id = this.unitToggles[currentUnitKey][0];
          }
          return;
        }
        e.target.dataset.id = this.unitToggles[currentUnitKey][unitIndex + 1];
        return;
      }
    }
  }

  _inputHandler(e) {
    e.preventDefault();
    const form = e.currentTarget;
    this.stringUtil.sanitizeInput(form);
    const formData = this.eventUtil.getFormData(form);
    const data = this.calculate(formData);
    this.eventBus.emit("calculatorData", data);
  }

  calculate(formData) {
    let data = { ...formData };
    data.friesBag = Math.max(
      0,
      data.friesBag - data.friesClamshell - data.snackbox
    );
    data.friesScoop = Math.max(0, data.friesScoop - data.megabox);
    const portionShares = this.getPortionShares(data);
    const actualUsage = this.forecastActualUsage(data);
    return {actualUsage, theoreticalUsage: formData.theoreticalUsage};
  }

  forecastActualUsage(formData) {
    const { waste, overportionPercent, unaccounted } = formData;
    const { friesBag, friesClamshell, megabox, snackbox, friesScoop } =
      formData;
    const rgPackaging = { friesBag, friesClamshell, snackbox };
    const lgPackaging = { megabox, friesScoop };
    const adjust = (packagingName, packagingAmount, portionSize = "rg") => {
      const { min, max } = this.portionEgdeCases[packagingName];
      const portionIncrease = overportionPercent / 100;
      const portion = Math.max(
        min,
        Math.min(max, this.resipePortion[portionSize] * (portionIncrease + 1))
      );
      return packagingAmount * portion;
    };
    let totalRg = Object.keys(rgPackaging).reduce(
      (acc, key) => (acc += adjust(key, rgPackaging[key])),
      0
    );
    let totalLg = Object.keys(lgPackaging).reduce(
      (acc, key) => (acc += adjust(key, lgPackaging[key], "lg")),
      0
    );
    return totalRg + totalLg + waste + unaccounted;
  }

  getPortionShares(formData) {
    const {
      friesBag,
      friesClamshell,
      megabox,
      snackbox,
      friesScoop,
      theoreticalUsage,
    } = formData;
    const totalFriesRG = [friesBag, friesClamshell, snackbox].reduce(
      (acc, curr) => (acc += curr * this.resipePortion.rg),
      0
    );
    const totalFriesLG = [friesScoop, megabox].reduce(
      (acc, curr) => (acc += curr * this.resipePortion.lg),
      0
    );
    const totalFriesSoldKG = totalFriesLG + totalFriesRG;

    const getShares = (
      packageQuantity,
      sizeShareKG = totalFriesRG,
      size = "rg"
    ) => {
      let shareSizeName = size === "rg" ? "shareRg" : "shareLg";
      let share = (packageQuantity * this.resipePortion[size]) / sizeShareKG;
      let shareSize =
        (packageQuantity * this.resipePortion[size]) / totalFriesSoldKG;
      let shareSizeKG = shareSize * sizeShareKG;
      return {
        share,
        shareKG: share * theoreticalUsage,
        [shareSizeName]: shareSize,
        [shareSizeName + "KG"]: shareSizeKG,
      };
    };

    return {
      friesBag: getShares(friesBag),
      friesClamshell: getShares(friesClamshell),
      snackbox: getShares(snackbox),
      friesScoop: getShares(friesScoop, totalFriesLG, "lg"),
      megabox: getShares(megabox, totalFriesLG, "lg"),
    };
  }
}


DependencyHub.add(FriesCalculator);