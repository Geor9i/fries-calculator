const reactiveHandler = {
    get(target, prop) {
        console.log(`${target[prop]}`);
        return target[prop];
    },
    set(target, prop, value) {
        console.log(target);
        console.log(`Setting property '${prop}' to '${value}'`);
        if (typeof value === 'object' ) {
            value = new Proxy(value, reactiveHandler)
        }
        target[prop] = value;
        return true; // Indicate success
    }
}

class SmlBaseElement {

    constructor() {
        let _domLink = null;
        Object.defineProperty(this, 'ref', {
            get() {
                return _domLink;
            },
            set(value) {
                 _domLink = value;
            },
            enumerable: false
        })
    }

    

}


export default class SmlElement  extends SmlBaseElement {

constructor (type, attributes, children) {
    super()
    if (!type) {
        throw new Error('SML Elements must have a type!')
    }
    this.type = type;
    this.children = children || [];
    this.attributes = attributes || {};
}
}