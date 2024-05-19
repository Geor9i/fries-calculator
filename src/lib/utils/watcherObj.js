export default class WatcherObject {
  constructor(object = {}) {
    this.target = object;
    Object.defineProperty(this.target, 'emit', {enumerable: false, value: this.emit});
    Object.defineProperty(this.target, 'on', {enumerable: false, value: this.on});
    Object.defineProperty(this.target, 'events', {enumerable: false, value: {}});
    const handler = {
      set: (target, prop, value, receiver) => {
        const oldValue = target[prop];
        if (oldValue !== value) {
          if (typeof value === 'object'
            && !Array.isArray(value)
            && value !== null) {
              const callbackArr = [target.emit.bind(this, 'propertyChange', value)];
              makeReactive(value, callbackArr);
            } 
        }
       
        Reflect.set(target, prop, value, receiver)
        console.log('set directly');
        target.emit('propertyChange', { property: prop, value });
        return true;
      },
      deleteProperty: (target, prop) => {
        const result = Reflect.deleteProperty(target, prop);
        target.emit('propertyChange', { property: prop, value: undefined });
        return result;
      }
  }
  return new Proxy(this.target, handler);
}
emit(eventName, data = null) {
  if (this.events.hasOwnProperty(eventName)) {
    this.events[eventName].forEach((subscription) => subscription.callback(data));
  }
}

on(eventName, callback) {
  if (this.events.hasOwnProperty(eventName)) {
    this.events[eventName].push({ callback });
  } else {
    this.events[eventName] = [{ callback }];
  }
  const subscribtionIndex = this.events[eventName].length - 1;
  return () => {
      this.events[eventName].splice(subscribtionIndex, 1);
    };
}

}


function makeReactive(obj, callbackArr = []) {
if (typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
  for (let key in obj) {
    let oldValue = obj[key];
    makeReactive(oldValue, callbackArr);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        return oldValue
      },
      set(newValue) {
        if (newValue !== oldValue) {
          makeReactive(newValue, callbackArr);
          oldValue = newValue;
          callbackArr.forEach(callback => callback());
        }
      }
    }) 

  }
}
}