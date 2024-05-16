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
        
        this._attributesState = {};
        this._childrenState = {};

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
                if (changePropKey === 'attributes') {
                    component.changes.push({component:this, changePropKey, newState: {...this.attributes}, oldState: {...this._attributesState}});
                    this._attributesState = { ...this.attributes };
                } else if (changePropKey === 'children') {
                    component.changes.push({component:this, changePropKey, newState: {...this.children}, oldState: {...this._childrenState}});
                    this._childrenState = { ...this.children };
                }
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
    super(type, attributes, children, parent);
    this.classList = {
        list: [],
        add(...classNames) {
            classNames.forEach(className => this.classList.list.includes(className) ? null : this.classList.list.push(className))
        }, remove(...classNames) {
            classNames.forEach(className => {
                const index = this.classList.list.findIndex(name => name === className );
                if (index !== -1 ) {
                    this.classList.list.splice(index, 1)
                } 
                    
            })
        }
    }
}



setAttribute(key, value) {
    this.attributes = {
        ...this.attributes,
        [key]: value
    }
}


}



