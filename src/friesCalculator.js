import UtilInjector from "./utils.js/utilInjector.js";
import { PORTION_EGDE_CASES, FRIES_PORTIONS_KG } from "./constants.js";

export default class FriesCalculator {
    constructor() {
        this.eventUtil = UtilInjector.event;
        this.evenBus = UtilInjector.eventBus;
        this.util = UtilInjector.util;
        this.portionEgdeCases = PORTION_EGDE_CASES;
        this.portionSizes = FRIES_PORTIONS_KG;
        this.form = document.querySelector('main > form');
        this.submitHandler = this._submitHandler.bind(this);
        this.init();
    }

    init() {
        this.form.addEventListener('submit', this.submitHandler);
    }

    _submitHandler(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = this.eventUtil.getFormData(form);
        let result = this.calculateActual(formData);
    }

    calculateActual(formData) {
        let data = { ...formData };
        data.friesBag = Math.max(0, data.friesBag - data.friesClamshell - data.snackbox);
        data.friesScoop = Math.max(0, data.friesScoop - data.megabox);
        const portionShares = this.getPortionShares(data);
        // console.log(portionShares);
        let portionMax = Object.keys(data).reduce((obj, key) => {
            if (key === 'theoreticalUsage') return obj;

            obj[key] = data[key] * this.portionEgdeCases[key]?.max;
            return obj;
        }, {})
        let totalMax = Object.keys(portionMax).reduce((acc, key) => acc += portionMax[key],0)
        console.log(totalMax);
    }

    getPortionShares(formData) {
        const { friesBag, friesClamshell, megabox, snackbox, friesScoop, theoreticalUsage } = formData;
        const totalFriesRG = [friesBag, friesClamshell, snackbox].reduce((acc, curr) => acc += (curr * this.portionSizes.rg), 0);
        const totalFriesLG = [friesScoop, megabox].reduce((acc, curr) => acc += (curr * this.portionSizes.lg), 0);
        const totalFriesSoldKG = totalFriesLG + totalFriesRG;

        const getShares = (packageQuantity, sizeShareKG = totalFriesRG, size = 'rg') => {
            let shareSizeName = size === 'rg' ? 'shareRg': 'shareLg';
            let share = (packageQuantity * this.portionSizes[size]) / sizeShareKG;
            let shareSize = (packageQuantity * this.portionSizes[size]) / totalFriesSoldKG;
            let shareSizeKG = shareSize * sizeShareKG;
            return {
                share,
                shareKG: share * theoreticalUsage,
                [shareSizeName]: shareSize,
                [shareSizeName + 'KG']: shareSizeKG,
            }
        };

        return {
            friesBag: getShares(friesBag),
            friesClamshell: getShares(friesClamshell),
            snackbox: getShares(snackbox),
            friesScoop: getShares(friesScoop, totalFriesLG, 'lg'),
            megabox: getShares(megabox, totalFriesLG, 'lg'),
    }
}
}