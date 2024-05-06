import { PORTION_EGDE_CASES, FROZEN_PORTIONS_KG, PRICES, COOKED_PORTIONS_KG, UNIT_TOGGLES, FROZEN_INVENTORY_WEIGHT_KG } from "../constants/constants.js"


export default class UnitValues {

    static getCategory(category) {
        const categorySection = UnitValues[`_${category}`];
        if (categorySection) {
            return { ...categorySection };
        }
    }
    static setValue(category, propName, value) {
        const categorySection = UnitValues[`_${category}`];
        if (categorySection && categorySection[propName]) {
            categorySection[propName] = value;
        }
    }
    static _PRICES = PRICES;
    static _PORTION_EGDE_CASES = PORTION_EGDE_CASES;
    static _FROZEN_PORTIONS_KG = FROZEN_PORTIONS_KG;
    static _COOKED_PORTIONS_KG = COOKED_PORTIONS_KG;
    static _UNIT_TOGGLES = UNIT_TOGGLES;
    static _FROZEN_INVENTORY_WEIGHT_KG = FROZEN_INVENTORY_WEIGHT_KG;

}

