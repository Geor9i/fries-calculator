import { objectUtil } from "./utils/objectUtil.js";
import { sml } from "./sml.js";
import { smlDom } from "./smlDom.js";
import { smlLink } from "./smlLink.js"
import WatcherArray from "./utils/watcherArray.js";
import WatcherObject from "./utils/watcherObj.js";

export default class BaseSmlComponent {
    constructor() {
        this.objectUtil = objectUtil;
        this.objectUtil.defineProperty(this, [
        ['root', null],
        ['tree', []],
        ['attributes', new WatcherObject()],
        ['children', new WatcherArray()],
        ['oldTreeState', []],
        ['unsubscribeArr', []],
        ['events', {}],
        ['changes', []],
        ['smlDom', smlDom],
        ['sml', sml],
        ['smlLink', smlLink],
        ['_isProcessing', true],
        ],
         { e: false, w: true })

         Object.defineProperty(this, 'emit', {enumerable: false, value(eventName, data = null) {
            if (this.events.hasOwnProperty(eventName)) {
              this.events[eventName].forEach((subscription) => subscription.callback(data));
            }
          }})
          Object.defineProperty(this, 'on', {enumerable: false, value(eventName, callback) {
            if (this.events.hasOwnProperty(eventName)) {
              this.events[eventName].push({ callback });
            } else {
              this.events[eventName] = [{ callback }];
            }
            const subscribtionIndex = this.events[eventName].length - 1;
            return () => {
                this.events[eventName].splice(subscribtionIndex, 1);
              };
          }})

        Object.defineProperty(this, 'setRoot', {enumerable: false, value(rootElement) {
            if (rootElement instanceof HTMLElement) {
              this.root = rootElement;
            }
          }});

          Object.defineProperty(this, 'onComponentChange', {
            value(changePropKey) {
                if (changePropKey === 'attributes') {
                    component._logChange({element: this, newState: {...this.attributes}, oldState: {...this._previousAttributesState}}); 
                } else if (changePropKey === 'children') {
                    component._logChange({element: this, newState: [...this.children], oldState: [...this._previousChildrenState]});
                }
            },
            enumerable: false,
            writable: false,
            configurable: false
        })
        const childrenChangeHandler = (data) => {
            if (!this.assignedKeys) {
                this.children.forEach((child, i) => {
                    if (!child.key) {
                        child.key = Math.random() * 10000 + i;
                    }
                })
                this.assignedKeys = true;
            }
            const updatedChild = this.children[data.index];
            updatedChild.key = updatedChild?.key ? updatedChild.key : Math.random() * 10000 + data.index;
            this.onComponentChange('children');
        }
        const childrenUnsubscribe = this.children.on('change', childrenChangeHandler.bind(this));
        const attributesChangeHandler = (data) => {
            data?.property ? this._attributeChanges.add(data.property) : null;
            this.onComponentChange('attributes');
        }
        const attributesUnsubscribe = this.attributes.on('propertyChange', attributesChangeHandler.bind(this));
        this.unsubscribeArr.push(childrenUnsubscribe, attributesUnsubscribe);

        Object.defineProperty(this, '_logChange', {enumerable: false, value(change) {
              this.changes.push(change);
              if (this._isProcessing) return;
              this._isProcessing = true;
              setTimeout(() => {
                this.onChanges([...this.changes]);
                this.update();
                this._isProcessing = false;
                this.emit('doneProcessing');
              }, 0)
            }})
        Object.defineProperty(this, '_resetChanges', {enumerable: false, value: () => this.changes = []})
        Object.defineProperty(this, 'renderMethod', { enumerable:  false, writable: false, value: this.render });
        this.render = () => {
          this.tree = new WatcherArray(...this.renderMethod());
            const logChange = () => {
              this._logChange({
              message: 'Direct Component Tree Children Change',
              newState: [...this.tree],
              oldState: [...this.oldTreeState]
            })
            }
            const unsubscribe = this.tree.on('change', logChange.bind(this));
            this.unsubscribeArr.push(unsubscribe);
          this.oldTreeState = this.objectUtil.deepCopy(this.tree);
        };
        Object.defineProperty(this, 'update', { enumerable:  false, writable: false, value() {
             this.objectUtil.traverseAndUpdate(this.tree, this)
        } });
        Object.defineProperty(this, 'destroyMethod', { enumerable:  false, writable: false, value: this.onDestroy });
        this.onDestroy = () => {
            //TODO Component destroy logic
        Object.keys(this.events).forEach(eventType => this.events[eventType] = []);
        this.unsubscribeArr.forEach(unsubscribe => unsubscribe());
          this.destroyMethod();
        };
          Object.defineProperty(this, 'entry', {enumerable: false, value(rootElement) {
            this.setRoot(rootElement);
            this.render();
            this._resetChanges();
            this._isProcessing = false;
            this.smlDom.buildDom(this.root, this.tree);
            this.afterViewInit();
          }})
          Object.defineProperty(this, 'loadComponents', {enumerable: false, value(...components) {
            this.sml.components = components.map((component) => ({
              name: component.name,
              component,
            }));
          }})
        }

        render() {
            throw new Error("Render method must be defined!");
        }
        onDestroy() {}

        onChanges() {
        }

        useState(initialValue) {
        const key = `${new Date().getTime()}`;
        this.state[key] = initialValue;
    
        const setState = (newValue) => {
            this.state[key] = newValue;
            this.render();
        };
        return [initialValue, setState];
        }
                
}