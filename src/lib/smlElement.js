
export class SmlElement {

constructor (type, attributes = {}, children = [], parent) {
    if (!type) {
        throw new Error('SML Elements must have a type!')
    }
    this.type = type;
    this.children = children || [];
    this.attributes = attributes || {};
    this.key = null;
    this.ref = null;
    
    this.classList = {
        add(...classNames) {
            const classStringArr = (attributes?.class || '').split(' ');
            classNames.forEach(newClassName => {
            const classExists = classStringArr.some(className => className === newClassName);
                if (!classExists) {
                    classStringArr.push(newClassName);
                }
            })
            attributes.class = classStringArr.filter(str => str.length).join(' ');
        }, remove(...classNames) {
            let classStringArr = (attributes?.class || '').split(' ');
            classNames.forEach(removeClassName => {
            const classIndex = classStringArr.findIndex(className => className === removeClassName);
                if (classIndex !== -1) {
                    classStringArr = classNames.slice(0, classIndex).concat(classNames.slice(classIndex + 1));
                }
            })
            attributes.class = classStringArr.join(' ');
        },
        toggle(...classNames) {
            let classStringArr = (attributes?.class || '').split(' ');
            classNames.forEach(className => {
            const classIndex = classStringArr.findIndex(currentClassName => currentClassName === className);
                if (classIndex !== -1) {
                    classStringArr = classNames.slice(0, classIndex).concat(classNames.slice(classIndex + 1));
                } else {
                    classStringArr.push(className);
                }
            })
            attributes.class = classStringArr.join(' ');
        }
    }

    Object.defineProperty(this.classList, 'list', {
        get() {
            return this.attributes?.class || '';
        }
    })
}

setAttribute(key, value) {
    this.attributes[key] = value;
}

removeAttribute(key) {
    delete this.attributes[key];
}

appendChild(childNode, { index = -1 } = {}) {
    if (index < 0) {
        this.children.push(...childNode)
    } else {
        this.children.splice(index, 0, ...childNode)
    }
}

prependChild(childNode) {
        this.children.unshift(...childNode);
}
}



