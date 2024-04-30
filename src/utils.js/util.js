export default class Util {
    constructor() {

    }

    formatNumber(stringValue) {
        const pattern = /[^\d.]+/g;
                return Number(stringValue.replace(pattern, ''));
    }
}