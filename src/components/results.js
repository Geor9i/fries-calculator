import { PROPORTIONS_KG } from "../constants.js";
import UtilInjector from "../utils.js/utilInjector.js";

export default class ResultsDisplay {
    constructor() {
        this.proportions = PROPORTIONS_KG;
        this.subscriberId = 'FriesCalculator';
        this.evenUtil = UtilInjector.event;
        this.evenBus = UtilInjector.eventBus;
        this.displayData = this._displayData.bind(this);
        this.element = document.querySelector('main .output');
        this.form = this.element.querySelector('form');
        this.init();
    }

    init() {
        this.evenBus.on('calculatorData', this.subscriberId, this.displayData);
        this.evenBus.on('resetForm', this.subscriberId, () => this.evenUtil.resetForm(this.form, 0));

    }

    _displayData(data) {
        const inputObject = this.evenUtil.inputObject(this.form);
        inputObject['actualUsage'].value = data.toFixed(2);
        // inputObject['actualBox'].value = (data / this.proportions.box).toFixed(2);
    }

}