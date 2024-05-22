import { objectUtil } from "./utils/objectUtil.js";
import { sml } from "./sml.js";
import { smlDom } from "./smlDom.js";
import { smlLink } from "./smlLink.js"

export default class BaseSmlComponent {
    constructor() {
        this.objectUtil = objectUtil;
        this.objectUtil.defineProperty(this, [
        ['root', null],
        ['tree', []],
        ['attributes', {}],
        ['children', []],
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
        Object.defineProperty(this, '_logChange', {enumerable: false, value(change) {
              this.changes.push(change);
              if (this._isProcessing) return;
              this._isProcessing = true;
              setTimeout(() => {
                this.onChanges([...this.changes]);
                this._reRender();
                this._isProcessing = false;
                this.emit('doneProcessing');
              }, 0)
            }})
        Object.defineProperty(this, '_resetChanges', {enumerable: false, value: () => this.changes = []})
        Object.defineProperty(this, 'renderMethod', { enumerable:  false, writable: false, value: this.render });
        this.render = () => {
          this.tree = this.renderMethod();
          this.oldTreeState = this.objectUtil.deepCopy(this.tree);
        };
        Object.defineProperty(this, '_reRender', { enumerable:  false, writable: false, value() {
             console.log(this.tree);
            // console.log('tree: ', this.tree);
            // console.log('tree copy: ', this.treeState);
            // this.objectUtil.compare(this.tree, this.treeState, { fullReport: true, log:true, types: true })
            // console.log(this.tree === this.treeState);
        } });
        Object.defineProperty(this, 'destroyMethod', { enumerable:  false, writable: false, value: this.onDestroy });
        this.onDestroy = () => {
            //TODO Component destroy logic
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