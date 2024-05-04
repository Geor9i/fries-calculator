import { PRICES } from "../constants.js";
import DependencyHub from "../dependencyResolvers/dependencyHub.js";

export default class Options {

  static dependencies = ['StringUtil', 'EventBus', 'EventUtil']

  constructor() {
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
  //  Populate fields
   const fieldsObj = this.eventUtil.inputObject(this.form);
    Object.keys(fieldsObj).forEach(key => fieldsObj[key].value = this.prices[key])
  }

  _updateOptions(e){
    const name = e.target.name;
    this.prices[name] = Number(e.target.value);
    console.log(name);
    console.log(this.prices);
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