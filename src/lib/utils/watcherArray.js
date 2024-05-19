export default class WatcherArray extends Array {
  constructor() {
    super();
    Object.defineProperty(this, 'events', {enumerable: false, value: {}});
    return new Proxy(this, {
       set: (target, prop, value) => {
        prop = Number(prop);
        super[prop] = value;
        this.emit('change', { method: 'set', index: prop, value });
        return true;
      }
    });
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

  get(index) {
    return super[index];
  }

  set(index, value) {
    let oldValue = super[index];
    super[index] = value;
    this.emit('change', { method: 'set', index, value, oldValue });
    return value;
  }

  delete(index) {
    const deletedValue = super[index];
    const result = super.slice(0, index).concat(super.slice(index + 1))
    this.emit('change', { method: 'delete', index, value: deletedValue });
    return result;
  }

  push(...items) {
      const result = super.push(...items);
      this.emit('change', { method: 'push', result });
      return result;
  }
  pop() {
      const result = super.pop();
      this.emit('change', { method: 'pop', result });
      return result;
  }
  slice(...args) {
      const result = super.slice(...args);
      this.emit('change', { method: 'slice', result });
      return result;
  }

  reset() {
    this.length = 0;
  }
}
