import { PRICES } from "../constants.js";
import UtilInjector from "../utils.js/utilInjector.js";

export default class Options {
  constructor() {
    this.eventUtil = UtilInjector.event;
    this.evenBus = UtilInjector.eventBus;
    this.stringUtil = UtilInjector.string;
    this.optionsButton = document.querySelector('.options-button-container .options-button');
    this.optionsSection = document.querySelector('section.options');
    this.form = this.optionsSection.querySelector('form');
    this.prices = PRICES;
    this.updateOptions = this._updateOptions.bind(this);
    this.inputHandler = this. _inputHandler.bind(this);
    this.toggleMenu = this._toggleMenu.bind(this);
    this.menuOpen = false; 
    this.init();
  }

  init() {
   this.optionsButton.addEventListener('click', this.toggleMenu);
   this.form.addEventListener('input', this.inputHandler);
   this.form.addEventListener('change', this.updateOptions);
  }

  _updateOptions(e){
    console.log(e.target.value);
  }

  _inputHandler(e) {
    e.preventDefault();
    const form = e.currentTarget;
    this.sanitizeInput(form);
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

  _toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.optionsSection.classList.toggle('options-open');
    this.optionsButton.classList.toggle('options-button-close');
    window.scrollTo({ top:  this.menuOpen ? this.optionsSection.offsetTop: document.body.offsetTop, behavior: "smooth" });
  }

}
