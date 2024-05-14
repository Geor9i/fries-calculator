
export default class ObjectUtil {

  includes(data, target) {
    let dataType = this.typeof(data);
    let targetType = this.typeof(target);
    if (!targetType || !dataType || ["number", "boolean"].includes(dataType))
      return null;

    if (
      ["string", "array"].includes(dataType) &&
      !["array", "object"].includes(targetType)
    ) {
      return data.includes(target);
    } else if (
      dataType === "string" &&
      ["array", "object"].includes(targetType)
    ) {
      return null;
    } else if (dataType === "array" && targetType === "array") {
      let tempArr = Array.from(data);
      let tempTargetArr = JSON.stringify(Array.from(target));
      for (let element of tempArr) {
        if (Array.isArray(element)) {
          let tempElement = JSON.stringify(Array.from(element));
          if (tempElement === tempTargetArr) {
            return true;
          }
        }
      }
      return false;
    } else if (dataType === "array" && targetType === "object") {
    }
  }

  mergeSort(arr, callback){
    let split = (arr, callback) => {
        if (arr.length <= 1) {
            return arr;
        }
        const middle = Math.floor(arr.length / 2);
        const left = arr.slice(0, middle);
        const right = arr.slice(middle);

        const sortedLeft = split(left, callback);
        const sortedRight = split(right, callback);

        return merge(sortedLeft, sortedRight, callback);
    }
    let merge = (leftArr, rightArr, callback ) => {
        const result = [];
        let leftIndex = 0;
        let rightIndex = 0;


        while (leftIndex < leftArr.length && rightIndex < rightArr.length) {
                let currentSortResult = callback(leftArr[leftIndex], rightArr[rightIndex]);
                currentSortResult < 0 ? result.push(leftArr[leftIndex++]) : result.push(rightArr[rightIndex++]);
        }
        result.push(...leftArr.slice(leftIndex), ...rightArr.slice(rightIndex));
        return result;
    }
    return split(arr, callback);
}


  iterate(data, callback) {
    if (Array.isArray(data)) {
      let result = [...data];
      return result.map((el) => callback(el));
    } else if (typeof data === "object") {
      let result = { ...data };
      return Object.keys(result).reduce((acc, curr) => {
        acc[curr] = callback(data[curr]);
        return acc;
      }, {});
    }
  }

  reduceToObj(arr, data) {
    return arr.reduce((acc, curr) => {
      let dataType = this.typeof(data);
      switch (dataType) {
        case "array":
          acc[curr] = [...data];
          break;
        case "object":
          acc[curr] = { ...data };
          break;
        default:
          acc[curr] = data;
          break;
      }
      return acc;
    }, {});
  }

  reduceToArr(obj, {addParams = {}, setId = false, ownId = false} = {}) {
    return Object.keys(obj).reduce((arr, key, i) => {
      let element = obj[key];
      if (addParams) {
        Object.keys(addParams).forEach(key => {
          element[key] = addParams[key]
        })
      }
      if (setId) {
        element.id = i
      } else if (ownId) {
        element.id = key
      }
      arr.push(element);
      return arr;
    }, [])
  }


  typeof(target) {
    if (target === null) return 'null';
    if (Array.isArray(target)) return 'array';
    
    const type = typeof target;
    if (type !== 'object' || type === 'undefined') {
      return type;
    }
  
    if (target instanceof Date) return 'date';
    if (target instanceof RegExp) return 'regexp';
    if (target instanceof Map) return 'map';
    if (target instanceof Set) return 'set';
    if (target instanceof WeakMap) return 'weakmap';
    if (target instanceof WeakSet) return 'weakset';
    if (typeof target[Symbol.iterator] === 'function') return 'iterable';
  
    if (type === 'object') {
      return Object.prototype.toString.call(target).slice(8, -1).toLowerCase();
    }
  }

  compare(prop1, prop2, options) {
    let map = ``;
    let globalStructureMatch = true; 
    let globalReferenceMatch = true; 
    const isInvalid = (type) => ['undefined', 'null'].some(invalidType => invalidType === type);
    const isIterable = (type) => ['object', 'array', 'set', 'weakset', 'map', 'weakmap'].includes(type);
    const isPrimitive = (type) => ['number', 'string', 'boolean'].includes(type);
    const placeHolder = (type, value, key) => {
      const placeholders = {
        object: `{ ${key} }`,
        weakmap: `{{ ${key} }}`,
        map: `{{ ${key} }}`,
        array: `[ ${key} ]`,
        set: `$[ ${value} ]`,
        weakset: `$[ ${value} ]`,
        regex: `\/ ${key} \/`,
        number: `${value}`,
        string: `${value}`,
        null: `${value}`,
        boolean: `${value}`,
      }
      return placeholders[type]
    }
    let indent = 0;

    const analyze = (a, b, indent, index) => {
      const typeA = this.typeof(a);
      const typeB = this.typeof(b);

      if (typeA === typeB) {
        if (isInvalid(a)) {
          map + `${a} === ${b} ( ${typeA} )`;
          return true;
        } else {
          if(isPrimitive(typeA)){
            let valueMatch = a === b;
            map += "\n";
            map += `└─── ${valueMatch ? `${value1}` : `${value1} (${valueType1}) !== ${value2} (${valueType2})`}`
            globalStructureMatch = globalStructureMatch ? valueMatch : globalStructureMatch;
            return valueMatch;
          } else if (isIterable(typeA)) {

            const isObject = typeA === 'object';
            const isMap = ['map', 'weakmap'].includes(typeA);
            const isSet = ['set', 'weakset'].includes(typeA);
            let [iteratorA, iteratorB] = [Array.from(a), Array.from(b)];
            if (isObject) {
              [iteratorA, iteratorB] = [Object.keys(a), Object.keys(b)];
            } 

            if (iteratorA.length !== iteratorB.length) {
              map += "\n";
              map += `└─── ${placeHolder(typeA, a, 'a')} !== ${placeHolder(typeB, b, 'b')} | length diff: ${Math.abs(iteratorA.length - iteratorB.length)}`;
              globalStructureMatch = false;
              globalReferenceMatch = false;
              if (!options.fullReport) {
                return false;
              }
            }

            for (let i = 0; i < iteratorA.length; i++) {
              const name = iteratorA[i];
              if (options?.exclude.includes(name)) {
                continue;
              }
              const value1 = isObject ? a[iteratorA[i]] : isMap ? iteratorA[i][1] : iteratorA[i];
              const value2 = isObject ? a[iteratorA[i]] : isMap ? iteratorB[i][1] : iteratorB[i];
              const valueType1 = this.typeof(value1);
              const valueType2 = this.typeof(value2);
              map += "\n";
              let typeMatch = valueType1 === valueType2;
              let valueMatch = value1 === value2;
              let referenceMatch = (isPrimitive(typeA) && valueMatch) || (isIterable(typeA) && a === b);
              globalReferenceMatch = globalReferenceMatch ? referenceMatch : globalReferenceMatch;

              map += '│   '.repeat(indent);
              map += `${i === iteratorA.length - 1 ? '└───' : '├───'} ${referenceMatch && valueMatch ?
                `${placeHolder(valueType1, value1, iteratorA[i])}  ${options.types ? `( ${valueType1} )` : ''}` : `${placeHolder(valueType1, value1, iteratorA[i])} !== ${
                  placeHolder(valueType2, value2, iteratorB[i])} ${!referenceMatch ? '| !== Ref' : ''} ${!valueMatch ? `| i: ${i || index || ''}` : ''}`}`;
  
              if (!typeMatch || !valueMatch) {
                globalStructureMatch = false;
                if (!options.fullReport) {
                  return false;
                }
              }
  
              if (isIterable(valueType1)) {
                const depthMatch = analyze(value1, value2, indent + 1, i);
                if (!options.fullReport && !depthMatch) {
                  return;
                }
              }

              if (i === iteratorA.length - 1) {
                return true;
              }
            }
          }
        }
      } else {
        map += `└─── ${a} (${typeA}) !== ${b} (${typeB})`;
        globalStructureMatch = false;
        return globalStructureMatch;
      }
      return globalStructureMatch
    }
    
    analyze(prop1, prop2, indent);
    if (options.log) {
      console.log(map);
    }
    return {globalReferenceMatch, globalStructureMatch};
  }

  hasOwnProperties(object, properties, operator = "&&") {
    if (operator === "&&") {
      return properties.find((key) => {
        if (!object[key]) {
          return false;
        }
      })
        ? true
        : false;
    } else if (operator === "||") {
      return properties.find((key) => {
        if (object[key]) {
          return true;
        }
      })
        ? true
        : false;
    }
  }

  
  /**
   *
   * @param {Object} targetObject Supply target Object
   * @param {Object} options supply targets
   * @param {String} options.extractKey look only inside this specific Key name in the object
   * @param {Boolean} options.extractSubKeys an array of all wanted properties!
   * @param {String} options.immerseKey Value used as key for new object used to surround all qualifying end value
   * @param {Array} options.avoidKeys object keys to avoid during immersion
   *
   * @returns {Object} a new Object containing all wanted keys containing props and their values unless  options.targetKey are specified, in which case it returns an object with the values discovered under the targetKey
   */
  keyTools(
    targetObject,
    {
      extractKey = null,
      extractSubKeys = null,
      immerseKey = null,
      avoidKeys = null,
    } = {}
  ) {
    if (
      (this.typeof(targetObject) !== "object" && (!immerseKey || !avoidKeys)) ||
      (!extractKey && !extractSubKeys && !immerseKey && !avoidKeys)
    )
      return null;

    extractSubKeys = extractSubKeys
      ? Array.isArray(extractSubKeys)
        ? extractSubKeys
        : [extractSubKeys]
      : null;
    const log = {
      withinTargetKey: false,
      targetKeyExtracted: false,
      paths: {},
    };

    const submerge = (targetObject, path = {}) => {
      const validateKey = (key) => {
        if (extractKey === key || log.withinTargetKey) {
          log.withinTargetKey = true;
          return true;
        }
        if (extractSubKeys && extractSubKeys.includes(key)) {
          return true;
        }

        return false;
      };
      const validateImmersion = (targetObject, key) => {
        if (
          immerseKey &&
          avoidKeys &&
          !avoidKeys.includes(key) &&
          !this.isEmpty(targetObject[key]) &&
          this.typeof(targetObject[key]) !== "object"
        ) {
          return true;
        }
        return false;
      };
      for (let key in targetObject) {
        if (validateKey(key)) {
          log.targetKeyExtracted = extractKey !== null ? true : false;
          path = { ...path, [key]: targetObject[key] };
          continue;
        } else if (validateImmersion(targetObject, key)) {
          if (!path.hasOwnProperty(immerseKey)) {
            path[key] = {};
          }
          path[key][immerseKey] = targetObject[key];
        } else if (this.typeof(targetObject[key]) === "object") {
          if (!path.hasOwnProperty(key)) {
            path[key] = {};
          }
          path[key] = submerge(targetObject[key], path[key]);
        }
      }
      log.withinTargetKey = false;
      return this.deleteEmptyKeys(path);
    };

    for (let key in targetObject) {
      if (this.typeof(targetObject[key]) === "object") {
        if (extractKey && extractKey !== key) continue;

        let path = { [key]: {} };
        log.withinTargetKey = extractKey === key ? true : false;
        let discovered = submerge(targetObject[key], path[key]);
        if (discovered) {
          if (log.targetKeyExtracted) {
            return discovered;
          }
          path[key] = discovered;
          log.paths = { ...log.paths, ...path };
        }
      } else if (
        !extractKey &&
        extractSubKeys &&
        extractSubKeys.includes(key)
      ) {
        log.paths[key] = targetObject[key];
      } else if (extractKey && extractKey === key) {
        return targetObject[key];
      } else if (immerseKey && avoidKeys && !avoidKeys.includes(key)) {
        log.paths[key] = {};
        log.paths[key][immerseKey] = targetObject[key];
      }
    }
    return Object.keys(log.paths).length > 0 ? log.paths : null;
  }

  deleteEmptyKeys(targetObject) {
    if (this.typeof(targetObject) !== "object") return null;

    let result = { ...targetObject };
    for (let key in result) {
      if (this.isEmpty(result[key])) {
        delete result[key];
      }
    }
    if (this.isEmpty(result)) {
      return null;
    } else {
      return result;
    }
  }

  isEmpty(target) {
    if (!target) return true;

    const isEmptyObject = (object) => {
      for (let key in object) {
        let type = this.typeof(object[key]);
        if (type === "object") {
          if (Object.keys(object[key]).length === 0) {
            continue;
          }
          if (!isEmptyObject(object[key])) {
            return false;
          }
        } else if (["array", "string", "boolean", "number"].includes(type)) {
          if (!this.isEmpty(object[key])) {
            return false;
          }
        } else if (object[key] === null || object[key] === undefined) {
          continue;
        }
      }
      return true;
    };

    let type = this.typeof(target);
    switch (type) {
      case "string":
        return target.length === 0;
      case "array":
        return target.filter((el) => !this.isEmpty(el)).length === 0;
      case "object":
        return isEmptyObject(target);
      case "undefined":
      case "null":
        return true;
      default:
        return false;
    }
  }

  hasNestedProperty(object, props, key = true) {
    if (this.typeof(object) !== "object") return null;
    props = Array.isArray(props) ? props : [props];

    if (key) {
      for (let key in object) {
        if (props.includes(key)) {
          return true;
        } else if (this.typeof(object[key]) === "object") {
          if (this.hasNestedProperty(object[key], props)) {
            return true;
          }
        }
      }
    } else {
      for (let key in object) {
        if (props.includes(object[key])) {
          return true;
        } else if (this.typeof(object[key]) === "object") {
          if (this.hasNestedProperty(object[key], props, false)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  getNestedProperty(targetObject, propName) {
    let propNameArr = propName.split(".");
    if (propNameArr.length === 1) {
      return targetObject[propName] ? targetObject[propName] : null;
    }
    return propNameArr.reduce((obj, prop) => {
      return obj && obj[prop] ? obj[prop] : null;
    }, targetObject);
  }

  setNestedProperty(targetObject, propName, setValue) {
    let propNameArr = propName.split(".");
    let lastProp = propNameArr.pop();
    if (propNameArr.length === 0) {
      targetObject[lastProp] = setValue;
      return targetObject;
    }
    propNameArr.reduce((obj, prop) => {
      if (!obj[prop]) {
        obj[prop] = {};
      }
      return obj[prop];
    }, targetObject)[lastProp] = setValue;
    return targetObject;
  }

  rotateArr(arr, options = {}) {
    options.amount = options.amount ? Math.max(0, options.amount) : 1;
    options.left = options.left !== undefined ? options.left : true;
    options.element = options.element ? options.element : null;
    let result = [...arr];

    if (!options.element) {
      let i = options.amount;
      while (i !== 0) {
        options.left
          ? result.push(result.shift())
          : result.unshift(result.pop());
        i--;
      }
    } else if (result.includes(options.element)) {
      while (result[0] !== options.element) {
        result.unshift(result.pop());
      }
    }
    return result;
  }

  filterBy(
    list,
    filterKey,
    { filterOption = "string", reverse = false, hierarchyArr = [] } = {}
  ) {
    let result = list.sort(([idA, detailsA], [idB, detailsB]) => {
      if (filterOption === "date") {
        let dateA = new Date(detailsA[filterKey]);
        let dateB = new Date(detailsB[filterKey]);
        return reverse
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      } else if (filterOption === "hierarchy") {
        let highestPositionA = detailsA[filterKey].sort(
          (a, b) => hierarchyArr.indexOf(a) - hierarchyArr.indexOf(b)
        )[0];
        let highestPositionB = detailsB[filterKey].sort(
          (a, b) => hierarchyArr.indexOf(a) - hierarchyArr.indexOf(b)
        )[0];
        return reverse
          ? hierarchyArr.indexOf(highestPositionA) -
              hierarchyArr.indexOf(highestPositionB)
          : hierarchyArr.indexOf(highestPositionB) -
              hierarchyArr.indexOf(highestPositionA);
      } else if (filterOption === "string") {
        return reverse
          ? detailsB[filterKey].localeCompare(detailsA[filterKey])
          : detailsA[filterKey].localeCompare(detailsB[filterKey]);
      }
    });
    // console.log(result.map(([id, obj]) => obj[filterKey]).join(', '));
    return result;
  }

  search(list, keyword, { filter = [], returnBool = false } = {}) {
    let discovered = Object.keys(list).filter((listItem) => {
      for (let item in list[listItem]) {
        let content = list[listItem][item];
        let type = this.typeof(content);
        if (
          type === "string" &&
          content.toLowerCase().includes(keyword.toLowerCase())
        ) {
          return true;
        } else if (
          type === "array" &&
          content.find((el) => {
            let elType = this.typeof(el);
            if (
              elType === "string" &&
              el.toLowerCase().includes(keyword.toLowerCase())
            ) {
              return true;
            } else if (elType === "number" && String(el).includes(keyword)) {
              return true;
            } else if (elType === "object") {
              return this.search(el, keyword, { returnBool: true });
            }
            return false;
          })
        ) {
          return true;
        } else if (type === "number" && String(content).includes(keyword)) {
          return true;
        } else if (
          type === "object" &&
          this.search(content, keyword, { returnBool: true })
        ) {
          return true;
        }
      }
      return false;
    });
    if (returnBool) {
      return discovered.length > 0 ? true : false;
    }
    return discovered.reduce((obj, curr) => {
      obj[curr] = { ...list[curr] };
      return obj;
    }, {});
  }
}

