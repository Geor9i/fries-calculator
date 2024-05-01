import UtilInjector from "../utils.js/utilInjector.js";
import {
  PORTION_EGDE_CASES,
  RECIPE_PORTIONS_KG,
  COOKED_PORTIONS_KG,
} from "../constants.js";

export default class FriesCalculator {
  constructor() {
    this.eventUtil = UtilInjector.event;
    this.evenBus = UtilInjector.eventBus;
    this.util = UtilInjector.util;
    this.portionEgdeCases = PORTION_EGDE_CASES;
    this.resipePortion = RECIPE_PORTIONS_KG;
    this.cookedPortion = COOKED_PORTIONS_KG;
    this.form = document.querySelector(".input > form");
    this.resetButton = this.form.querySelector('.reset-container a');
    this.select = this._select.bind(this);
    this.resetHandler = this._resetHandler.bind(this);
    this.inputHandler = this._inputHandler.bind(this);
    this.init();
  }

  init() {
    this.form.addEventListener("input", this.inputHandler);
    this.resetButton.addEventListener('click', this.resetHandler);
    document.addEventListener('click', this.select);
  }

  _resetHandler() {
        this.eventUtil.resetForm(this.form, 0);
        this.evenBus.emit('resetForm');
  }

  _select(e) {
    if (e.target.matches('input[type="text"]')) {
        e.target.select();
    }
  }


  _inputHandler(e) {
    e.preventDefault();
    const form = e.currentTarget;
    this.sanitizeInput(form);
    const formData = this.eventUtil.getFormData(form);
    let result = this.calculate(formData);
    this.evenBus.emit("calculatorData", result);
  }

  sanitizeInput(form) {
    const formObj = this.eventUtil.inputObject(form);
    Object.keys(formObj).forEach(
      (key) =>
        (formObj[key].value = this.util.filterString(formObj[key].value, [
          { symbol: "\\d" },
          { symbol: "\\,", matchLimit: 1 },
          { symbol: "\\.", matchLimit: 1 },
        ]))
    );
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
    return actualUsage;
  }

  forecastActualUsage(formData) {
    console.log(formData);
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
