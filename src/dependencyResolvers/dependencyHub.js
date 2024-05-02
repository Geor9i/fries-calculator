export default class DependencyHub{
    static storage = {}

    static add(dependencyClass, constructorArguments = []) {

        if (!dependencyClass.dependencies) {
            dependencyClass.dependencies = []
        }

        const dependencies = Array.isArray(dependencyClass.dependencies) ? dependencyClass.dependencies : [dependencyClass.dependencies];
        const className = dependencyClass.prototype.constructor.name;

        if (DependencyHub.storage.hasOwnProperty(className)) {
            throw new Error('Dependecy name already exists!')
        }

        const constructor = dependencyClass.prototype.constructor;
        dependencyClass.prototype._getDependencies = DependencyHub._getDependencies.bind(dependencyClass);
        Object.defineProperty(dependencyClass.prototype, '_getDependencies',  { enumerable: false });
        const resolvedDependencies = DependencyHub._getDependencies.call(dependencyClass);
        Object.keys(resolvedDependencies).forEach(key => {
            dependencyClass.prototype[key] = dependencies[key];
        })
        
        DependencyHub.storage[className] = { class: dependencyClass, dependencies, instance: null, constructorArguments };
    }

    static _getDependencies() {
        const dependencyClass = this.prototype;
        const dependencyClassName = dependencyClass.constructor.name;
        const dependencies = DependencyHub.storage[dependencyClassName]?.dependencies;
        if (!dependencies) {
            return [];
        }
        return  dependencies.reduce((dependencyObject, dependencyName) => {
            const inStorage = DependencyHub.storage.hasOwnProperty(dependencyClassName);
            if (!inStorage) {
                throw new Error(`Dependency ${dependencyName} for ${dependencyClassName} class is not in storage!`)
            }
            const isInstantiated = DependencyHub.storage[dependencyClassName].instance !== null;
            if (isInstantiated) {
                dependencyObject[dependencyClassName] = DependencyHub.storage[dependencyName].instance;
            } else {
                dependencyObject[dependencyClassName] = DependencyHub.provide(DependencyHub.storage[dependencyName].class);
            }
            return dependencyObject;
        }, {})
    }

    static remove(dependencyName) {
        if (!this.storage.hasOwnProperty(dependencyName)) {
            delete DependencyHub.storage[dependencyName];
        }else {
            throw new Error('Dependecy name not in storage!')
        }
    }

    static provide(dependencyClass) {
        const dependencyClassName = dependencyClass.prototype.constructor.name;
        const { constructorArguments } = DependencyHub.storage[dependencyClassName];
        if (!DependencyHub.storage.hasOwnProperty(dependencyClassName)) {
            throw new Error('Class is not in storage!')
        }
        const classConfigurator = DependencyHub.storage[dependencyClassName];
        if (classConfigurator.instance) {
            return classConfigurator.instance
        } else {
            classConfigurator.instance = new classConfigurator.class(...constructorArguments)
            return classConfigurator.instance;
        }
    }
}