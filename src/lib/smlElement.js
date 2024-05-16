import WatcherArray from "./utils/watcherArray.js";

function turnReactive(target, key, value, {getters = [], setters = []} = {}) {

    Object.defineProperty(target, key, {
        
        get() {
            getters.forEach(callback => {
                if (typeof callback !== 'function') return;
                callback()
            })
            return value
        },
        set(newValue) {
            setters.forEach(callback => {
                if (typeof callback !== 'function') return;
                callback()
            })
            value = newValue
        },
        enumerable: true
    })
}

class SmlBaseElement {

    constructor(type, attributes = {}, children = [], component) {
        if (!type) {
            throw new Error('SML Elements must have a type!')
        }
        

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

        Object.defineProperty(this, 'turnReactive', {
            get() {
                return turnReactive;
            },
            enumerable: false
        })

        Object.defineProperty(this, 'alertComponent', {
            value(changePropKey) {
                component.changes.push([this, changePropKey]);
            },
            enumerable: false,
            writable: false,
            configurable: false
        })

        this.type = type;
        this.children = new WatcherArray(...children || []);
        this.children.on('push', this.alertComponent.bind(this, 'children'))
        this.turnReactive(this, 'attributes', (attributes || {}), {setters: [this.alertComponent.bind(this, 'attributes')]});
        this.component = component;
    }

   

}

export class SmlElement  extends SmlBaseElement {

constructor (type, attributes = {}, children = [], parent) {
    super(type, attributes = {}, children = [], parent)
}
}



