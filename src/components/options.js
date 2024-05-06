import DependencyHub from "../dependencyResolvers/dependencyHub.js";
import UnitValues from "./unitValues.js";

export default class Options {

  static dependencies = ['StringUtil', 'EventBus', 'EventUtil']

  constructor() {
    this.optionsButton = document.querySelector('.options-button-container .options-button');
    this.optionsSection = document.querySelector('section.options');
    this.form = this.optionsSection.querySelector('form');
    this.prices = PRICES;
    this.frozenPortions = FROZEN_PORTIONS_KG;
    this.cookedPortions = COOKED_PORTIONS_KG;
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
  //  Populate fields
   const fieldsObj = this.eventUtil.inputObject(this.form);
    Object.keys(fieldsObj).forEach(key => fieldsObj[key].value = this.prices[key] || this.frozenPortions[key] || this.cookedPortions[key])
  }

  _updateOptions(e){
    const name = e.target.name;
    const value = Number(e.target.value);
    if (this.prices.hasOwnProperty(name)) {
        this.prices[name] = value;
      } else if (this.frozenPortions.hasOwnProperty(name)) {
        this.frozenPortions[name] = value;
      } else if (this.cookedPortions.hasOwnProperty(name)) {
        this.cookedPortions[name] = value;
    }
    this.eventBus.emit('OptionsUpdate', {[name]: value});
  }

  _inputHandler(e) {
    e.preventDefault();
    const form = e.currentTarget;
    this.stringUtil.sanitizeInput(form);
  }

  _toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.optionsSection.classList.toggle('options-open');
    this.optionsButton.classList.toggle('options-button-close');
    window.scrollTo({ top:  this.menuOpen ? this.optionsSection.offsetTop: document.body.offsetTop, behavior: "smooth" });
  }

}


DependencyHub.add(Options);