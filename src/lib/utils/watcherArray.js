export default class WatcherArray extends Array {
  constructor(...items) {
    super(...items);
    Object.defineProperty(this, 'events', {enumerable: false, value: {}});
    Object.defineProperty(this, 'method', {enumerable: false, writable: true, value: ''});
    return new Proxy(this, {
      set: (target, prop, value, receiver) => {
        const index = isNaN(Number(prop)) ? prop : Number(prop);
        const isArrayIndex = typeof index === 'number' && index >= 0;
        if (isArrayIndex && target[index] !== value) {
          const result = Reflect.set(target, prop, value, receiver);
          this.emit('change', { index, value, method: this.method || 'set' });
          this.method = '';
          return result;
        }
        return Reflect.set(target, prop, value, receiver);
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

  delete(index) {
    this.method = 'delete';
    const result = super.slice(0, index).concat(super.slice(index + 1))
    return result;
  }

  push(...items) {
      this.method = 'push';
      const result = super.push(...items);
      return result;
  }
  unshift(...items) {
      this.method = 'unshift';
      const result = super.unshift(...items);
      return result;
  }
  pop() {
      this.method = 'pop';
      const result = super.pop();
      return result;
  }
  slice(...args) {
      this.method = 'slice';
      const result = super.slice(...args);
      return result;
  }

  reset() {
    this.length = 0;
  }
}
