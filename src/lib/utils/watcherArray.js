export default class WatcherArray extends Array {
  constructor() {
    super();
    this.events = {};
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

  push(...items) {
      const result = super.push(...items);
      this.emit('push');
      return result;
  }
  pop() {
      const result = super.pop();
      this.emit('pop');
      return result;
  }
  slice(...args) {
      const result = super.slice(...args);
      this.emit('slice');
      return result;
  }

  reset() {
    this.length = 0;
  }
}
