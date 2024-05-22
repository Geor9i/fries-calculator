import WatcherArray from "./utils/watcherArray.js";
import WatcherObject from "./utils/watcherObj.js";

class SmlBaseElement {

    constructor(type, attributes = {}, children = [], component) {
        if (!type) {
            throw new Error('SML Elements must have a type!')
        }
        
        Object.defineProperty(this, '_attributeChanges', {enumerable: false, writable: true, value: new Set()})
        Object.defineProperty(this, '_childrenChanges', {enumerable: false, writable: true, value: []})
        Object.defineProperty(this, '_previousAttributesState', {enumerable: false, writable: true, value: { ...attributes } || {}})
        Object.defineProperty(this, '_previousChildrenState', {enumerable: false, writable: true, value:  [...children] || []})
        Object.defineProperty(this, 'component', {enumerable: false, writable: true, value:  component})
        this.type = type;
        this.children = new WatcherArray(...children || []);
        this.attributes = new WatcherObject(attributes || {});

        Object.defineProperty(this, 'onElementChange', {
            value(changePropKey) {
                if (changePropKey === 'attributes') {
                    component._logChange({element: this, newState: {...this.attributes}, oldState: {...this._previousAttributesState}}) 
                    this._previousAttributesState = { ...this.attributes };
                } else if (changePropKey === 'children') {
                    component._logChange({element: this, newState: [...this.children], oldState: [...this._previousChildrenState]}) 
                    this._previousChildrenState = [ ...this.children ];
                }
            },
            enumerable: false,
            writable: false,
            configurable: false
        })

        this.children.on('change', this.onElementChange.bind(this, 'children'));
        this.attributes.on('propertyChange', this.onElementChange.bind(this, 'attributes'));
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

export class SmlElement  extends SmlBaseElement {

constructor (type, attributes = {}, children = [], parent) {
    super(type, attributes, children, parent);

    const attributesRef = this.attributes;
    this.classList = {
        add(...classNames) {
            const classStringArr = (attributesRef?.class || '').split(' ');
            classNames.forEach(newClassName => {
            const classExists = classStringArr.some(className => className === newClassName);
                if (!classExists) {
                    classStringArr.push(newClassName);
                }
            })
            attributesRef.class = classStringArr.filter(str => str.length).join(' ');
        }, remove(...classNames) {
            let classStringArr = (attributesRef?.class || '').split(' ');
            classNames.forEach(removeClassName => {
            const classIndex = classStringArr.findIndex(className => className === removeClassName);
                if (classIndex) {
                    classStringArr = classNames.slice(0, classIndex).concat(classNames.slice(classIndex + 1));
                }
            })
            attributesRef.class = classStringArr.join(' ');
        }
    }

    Object.defineProperty(this.classList, 'list', {
        get() {
            return this.attributes?.class || '';
        }
    })
}

setAttribute(key, value) {
    this.attributes[key] = value;
}

removeAttribute(key) {
    delete this.attributes[key];
}
}



