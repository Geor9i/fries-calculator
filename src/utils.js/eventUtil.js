import DependencyHub from "../dependencyResolvers/dependencyHub.js";

export default class EventUtil {
  // static dependencies = ['StringUtil'];

  constructor () {
    this.maxParentCounter = 10;
  }

  getRelatives(e) {
    let currentElement = e.target;
    const parents = [];
    if (e.target) {
      const target = e.target;
      const children = target.children ? Array.from(target.children) : [];
      let counter = this.maxParentCounter;
      while (currentElement && currentElement.parentElement && counter > 0) {
        currentElement = currentElement.parentElement;
        parents.push(currentElement);
        counter--;
        if (currentElement === e.currentTarget) {
          break;
        }
      }
      return { parents, children };
    }
    return { parents: [], children: [] };
  }

  getFormData(form) {
    const formData = Array.from(new FormData(form).entries()).reduce((formObj, [name, value]) => {
      formObj[name] = value;
      return formObj;
    }, {});
    Object.keys(formData).forEach(key => formData[key] = Number(this.stringUtil.filterString(formData[key], [{symbol: '\\d'}, {symbol: '\\.'}])));
    return formData;
  }

  inputObject(element) {
    return Array.from(element.querySelectorAll('input')).reduce((obj, child) => {
      obj[child.name] = child;
      return obj;
    }, {})
  }

  
  resetForm(formElement, resetValue = '') {
    const formObj = this.inputObject(formElement);
    Object.keys(formObj).forEach(fieldName => formObj[fieldName].value = resetValue);
  }
}

// DependencyHub.add(EventUtil);
console.log(EventUtil.prototype);
