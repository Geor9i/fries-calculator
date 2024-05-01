import UtilInjector from "./utils.js/utilInjector.js";

export default class ResultsDisplay {
    constructor() {
        this.subscriberId = 'FriesCalculator';
        this.evenUtil = UtilInjector.event;
        this.evenBus = UtilInjector.eventBus;
        this.displayData = this._displayData.bind(this);
        this.element = document.querySelector('main .output');
        this.form = this.element.querySelector('form');
        this.init();
    }

    init() {
        this.evenBus.on('calculatorData', this.subscriberId, this.displayData)
    }

    _displayData(data) {
        const inputObject = this.evenUtil.inputObject(this.form);
        inputObject['actualUsage'].value = data;
    }

}