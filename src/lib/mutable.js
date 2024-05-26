export function getRef(context, reference) {
  this.subscribe({reference, context});
  return result
}

export default class Mutable {
  constructor(initialValue) {
    let value = initialValue;
    const refs = [];
    Object.defineProperty(this, 'value', {
      get() {
        return value
      },
      set(newValue) {
        if (newValue !== value) {
          Array.from(refs).forEach(ref => console.log(ref))
          value = newValue
        }
      }
     })
     Object.defineProperty(this, 'subscribe', {
     value(ref) {
      refs.push(ref);
     }
     })
     Object.defineProperty(this, 'map', {
      value(callback) {
        if (!Array.isArray(value)) return;
        const result = (context, reference) => {
          this.subscribe({reference, context});
          return result
        }
      }
    })
  }
   
 }