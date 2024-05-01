import UtilInjector from "../utils.js/utilInjector.js";

export default class Options {
  constructor() {
    this.eventUtil = UtilInjector.event;
    this.evenBus = UtilInjector.eventBus;
    this.stringUtil = UtilInjector.string;
    this.optionsButton = document.querySelector('.options-button-container .options-button');
    this.optionsSection = document.querySelector('section.options');
    this.toggleMenu = this._toggleMenu.bind(this);
    this.menuOpen = false; 
    this.init();
  }

  init() {
   this.optionsButton.addEventListener('click', this.toggleMenu);
  }

  _toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.optionsSection.classList.toggle('options-open');
    this.optionsButton.classList.toggle('options-button-close');
    window.scrollTo({ top:  this.menuOpen ? this.optionsSection.offsetTop: document.body.offsetTop, behavior: "smooth" });
  }

}
