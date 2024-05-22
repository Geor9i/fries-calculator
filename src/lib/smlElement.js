import { objectUtil } from "./utils/objectUtil.js";
import WatcherArray from "./utils/watcherArray.js";
import WatcherObject from "./utils/watcherObj.js";

class SmlBaseElement {

    constructor(type, attributes = {}, children = [], component) {
        if (!type) {
            throw new Error('SML Elements must have a type!')
        }
        this.objectUtil = objectUtil;
        this.objectUtil.defineProperty(this, [
            ['_attributeChanges', new Set()],
            ['_childrenChanges', []],
            ['_previousAttributesState', { ...attributes } || {}],
            ['_previousChildrenState', [...children] || []],
            ['component', component],
            ['unsubscribeArr', []],
            ['ref', null]
        ], {e: false, w: true})
        this.type = type;
        this.children = new WatcherArray(...children || []);
        this.attributes = new WatcherObject(attributes || {});

        Object.defineProperty(this, 'onElementRemove', {
            value() {
              this.unsubscribeArr.forEach(unsubscribe => unsubscribe());
            },
            enumerable: false,
            writable: false,
            configurable: false
        })
        Object.defineProperty(this, 'onElementChange', {
            value(changePropKey) {
                if (changePropKey === 'attributes') {
                    component._logChange({element: this, newState: {...this.attributes}, oldState: {...this._previousAttributesState}}) 
                } else if (changePropKey === 'children') {
                    component._logChange({element: this, newState: [...this.children], oldState: [...this._previousChildrenState]}) 
                }
            },
            enumerable: false,
            writable: false,
            configurable: false
        })

        const childrenUnsubscribe = this.children.on('change', this.onElementChange.bind(this, 'children'));
        const attributesUnsubscribe = this.attributes.on('propertyChange', this.onElementChange.bind(this, 'attributes'));
        this.unsubscribeArr.push(childrenUnsubscribe, attributesUnsubscribe);
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



