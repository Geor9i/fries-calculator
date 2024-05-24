import { objectUtil } from "./utils/objectUtil.js";
import { sml } from "./sml.js";
import { smlDom } from "./smlDom.js";
import { smlLink } from "./smlLink.js"

export default class SMLComponent  {
  constructor() {
    this.components = [];
    this.attributes = {};
    this.children = [];
    objectUtil.defineProperty(this, [
    ['componentAttributes', {}],
    ['componentChildren', []],
    ['events', {}],
    ['changes', []],
    // ['_isProcessing', true],
    ],
     { e: false, w: true });

     
        //  Object.defineProperty(this, 'emit', {enumerable: false, value(eventName, data = null) {
        //     if (this.events.hasOwnProperty(eventName)) {
        //       this.events[eventName].forEach((subscription) => subscription.callback(data));
        //     }
        //   }})
        //   Object.defineProperty(this, 'on', {enumerable: false, value(eventName, callback) {
        //     if (this.events.hasOwnProperty(eventName)) {
        //       this.events[eventName].push({ callback });
        //     } else {
        //       this.events[eventName] = [{ callback }];
        //     }
        //     const subscribtionIndex = this.events[eventName].length - 1;
        //     return () => {
        //         this.events[eventName].splice(subscribtionIndex, 1);
        //       };
        //   }})

        //   Object.defineProperty(this, 'onComponentChange', {
        //     value(changePropKey) {
        //         if (changePropKey === 'attributes') {
        //             this._logChange({element: this, newState: {...this.attributes}, oldState: {...this._previousAttributesState}}); 
        //         } else if (changePropKey === 'children') {
        //             this._logChange({element: this, newState: [...this.children], oldState: [...this._previousChildrenState]});
        //           } else if (changePropKey === 'tree') {
        //           this._logChange({element: this, newState: [...this.tree], oldState: [...this.oldTreeState]});
        //         }
        //     },
        //     enumerable: false,
        //     writable: false,
        //     configurable: false
        // })
        // const childrenChangeHandler = (target, data) => {
        //   const assignedKeys = target === 'tree' ? this.treeKeys : this.childrenKeys;
        //   const changesArr = target === 'tree' ? this._treeChanges : this.childrenChanges;
        //   const children = target === 'tree' ? this.tree : this.children;
          
        //   if (!assignedKeys) {
        //       // const initialStateArr = (target === 'tree' ? this._treeBeforeChanges : this._childrenBeforeChanges).map(child)
        //         children.forEach((child, i) => {
        //             if (!child.key) {
        //                 child.key = Math.random() * 10000 + i;
        //             }
        //             changesArr.push(child.key)
        //         })
        //         target === 'tree' ? this.treeKeys = true : this.childrenKeys = true;
        //     }
        //     const updatedChild = children[data.index];
        //     updatedChild.key = updatedChild?.key ? updatedChild.key : Math.random() * 10000 + data.index;
        //     this.onComponentChange(target);
        // }
        // const childrenUnsubscribe = this.children.on('change', childrenChangeHandler.bind(this, 'children'));
        // const attributesChangeHandler = (data) => {
        //     data?.property ? this._attributeChanges.add(data.property) : null;
        //     this.onComponentChange('attributes');
        // }
        // const attributesUnsubscribe = this.attributes.on('propertyChange', attributesChangeHandler.bind(this));
        // this.unsubscribeArr.push(childrenUnsubscribe, attributesUnsubscribe);

        // Object.defineProperty(this, '_logChange', {enumerable: false, value(change) {
        //       this.changes.push(change);
        //       if (this._isProcessing) return;
        //       this._isProcessing = true;
        //       setTimeout(() => {
        //         this.onChanges([...this.changes]);
        //         this.update();
        //         this._isProcessing = false;
        //         this.emit('doneProcessing');
        //       }, 0)
        //     }})
        // Object.defineProperty(this, '_resetChanges', {enumerable: false, value: () => this.changes = []})
    Object.defineProperty(this, 'setParent', { enumerable:  false, writable: false, value: (parent) => this.parent = parent });
     Object.defineProperty(this, 'renderMethod', { enumerable: false, writable: false, value: this.render });
     this.render = () => {
       this.children = [...this.renderMethod()];
     };

     Object.defineProperty(this, 'update', { enumerable:  false, writable: false, value() {
      objectUtil.traverseAndUpdate(this)
 } });
 Object.defineProperty(this, 'destroyMethod', { enumerable:  false, writable: false, value: this.onDestroy });
 this.onDestroy = () => {
 //TODO Component destroy logic
 // Object.keys(this.events).forEach(eventType => this.events[eventType] = []);
 // this.unsubscribeArr.forEach(unsubscribe => unsubscribe());
   this.destroyMethod();
 };

    this.onInit();
  }
  onInit() {}

  afterViewInit() {}

  m(stringsArr, ...values) {
    const placeHolders = [];
    let htmlString = ``;
    // Recombine html string parts
    stringsArr.forEach((str, i) => {
      htmlString += str;
      const value = values[i];
      if (value && typeof value === "string") {
        htmlString += value;
      } else if (value) {
        placeHolders.push({ index: htmlString.length, value });
      }
    });
    return sml.stringToTree({ htmlString, placeHolders, parentComponent: this, components: this.components });
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


     
       
      
         
       

        
                