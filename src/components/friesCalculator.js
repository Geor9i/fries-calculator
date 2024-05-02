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
    this.stringUtil = UtilInjector.string;
    this.portionEgdeCases = PORTION_EGDE_CASES;
    this.resipePortion = RECIPE_PORTIONS_KG;
    this.cookedPortion = COOKED_PORTIONS_KG;
    this.numberLimit = 6;
    this.form = document.querySelector(".input > form");
    this.resetButton = this.form.querySelector(".reset-container a");
    this.hoverUnit = this._hoverUnit.bind(this);
    this.endHoverUnit= this._endHoverUnit.bind(this);
    this.clickHandler = this._clickHandler.bind(this);
    this.resetHandler = this._resetHandler.bind(this);
    this.inputHandler = this._inputHandler.bind(this);
    this.checkEmpty = this._checkEmpty.bind(this);
    this.init();
  }

  init() {
    this.form.addEventListener("input", this.inputHandler);
    this.resetButton.addEventListener("click", this.resetHandler);
    document.querySelector('form').addEventListener('mouseover', this.hoverUnit);
    document.addEventListener("click", this.clickHandler);
    const formElements = this.eventUtil.inputObject(this.form);
    Object.keys(formElements).forEach((filedName) =>
      formElements[filedName].addEventListener("blur", this.checkEmpty)
    );
  }

  _hoverUnit(e) {
    const element = e.target;
    if (element.matches('.unit')) {
      element.classList.add('unit-hover');
      element.addEventListener('mouseout', this.endHoverUnit)
    }
  }

  _endHoverUnit(e) {
    e.target.classList.remove('unit-hover');
    e.target.removeEventListener('mouseout', this.endHoverUnit);
  }

  _checkEmpty(e) {
    if (e.currentTarget.value === "") {
      e.target.value = 0;
    }
  }

  _resetHandler() {
    this.eventUtil.resetForm(this.form, 0);
    this.evenBus.emit("resetForm");
  }

  _clickHandler(e) {
    if (e.target.matches('input[type="text"]')) {
      e.target.select();
    }else if (e.target.matches('.unit')) {
      const currrentUnit = e.target.dataset.id;
      const unitKeys = e.target.dataset.unit.split('&');
      const unitToggles = {
        weight: ['gr', 'kg'],
        percent: ['%'],
        mult: ['ea', '10x', '100x', '1000x'],
        format: ['box', 'bag', 'kg']
      }
      let currentUnitKey, unitIndex;
      for (let i = 0; i < unitKeys.length;i++) {
        currentUnitKey = unitKeys[i];
        if (!unitToggles[currentUnitKey].includes(currrentUnit)) continue;
        unitIndex = Math.min(unitToggles[currentUnitKey].length - 1, unitToggles[currentUnitKey].findIndex(unit => unit === currrentUnit));
        if (unitIndex === unitToggles[currentUnitKey].length - 1) {
            if(unitKeys.length > 1) {
              if (i >= unitKeys.length - 1) {
                currentUnitKey = unitKeys[0];
                e.target.dataset.id = unitToggles[currentUnitKey][0];
              } else {
                currentUnitKey = unitKeys[i + 1];
                e.target.dataset.id = unitToggles[currentUnitKey][0];
              }
            } else {
              e.target.dataset.id = unitToggles[currentUnitKey][0];
            }
            return 
        } 
        e.target.dataset.id = unitToggles[currentUnitKey][unitIndex + 1];
        return
      }
       

        

      console.log(unitKeys);
      // e.target.dataset.id = unitToggles[unitKey];
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
    Object.keys(formObj).forEach((key) => {
      const inputField = formObj[key];
      let filteredString = this.stringUtil.filterString(inputField.value, [
        { symbol: "\\d", matchLimit: this.numberLimit },
        { symbol: "\\," },
        { symbol: "\\.", matchLimit: 1 },
      ]);
      filteredString = this.stringUtil.patternSplice(filteredString, [{pattern: /\,{2,}/, replace: ','}]);
      inputField.value = this.stringUtil.trimValue(filteredString, [
        { value: "0", end: false, remainAmount: 1 },
      ]);
    });
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
