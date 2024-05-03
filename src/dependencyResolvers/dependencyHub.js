export default class DependencyHub{
    static storage = {}

    static add(dependencyClass, constructorArguments = []) {

        if (!dependencyClass.dependencies) {
            dependencyClass.dependencies = []
        }

        const dependencies = Array.isArray(dependencyClass.dependencies) ? dependencyClass.dependencies : [dependencyClass.dependencies];
        const className = dependencyClass.name;

        if (DependencyHub.storage.hasOwnProperty(className)) {
            throw new Error(`Dependency ${className} already exists!`)
        }
        const resolveDependencies = this._resolveDependencies.bind(dependencyClass, dependencies);
        DependencyHub.storage[className] = { class: dependencyClass, instance: null, constructorArguments, resolveDependencies };
    }

    static _resolveDependencies(dependencies) {
        const dependencyClass = this.prototype;
        const dependencyClassName = this.name;
        if (!dependencies.length) {
            return [];
        }
        dependencies.forEach(dependencyName => {
            const inStorage = DependencyHub.storage.hasOwnProperty(dependencyName);
            if (!inStorage) {
                throw new Error(`Dependency ${dependencyName} for ${dependencyClassName} class is not in storage!`)
            }
            const isInstantiated = DependencyHub.storage[dependencyClassName].instance !== null;
            const resolvedName = dependencyName.slice(0,1).toLowerCase() + dependencyName.slice(1);
            if (isInstantiated) {
                dependencyClass[resolvedName] = DependencyHub.storage[dependencyName].instance;
            } else {
                dependencyClass[resolvedName] = DependencyHub.provide(DependencyHub.storage[dependencyName].class);
            }
        })
    }

    static remove(dependencyName) {
        if (!DependencyHub.storage.hasOwnProperty(dependencyName)) {
            delete DependencyHub.storage[dependencyName];
        }else {
            throw new Error(`Dependency ${dependencyName} does not exist!`)
        }
    }

    static provide(dependencyClass) {
        const dependencyClassName = dependencyClass.prototype.constructor.name;
        if (!DependencyHub.storage.hasOwnProperty(dependencyClassName)) {
            throw new Error(`Class ${dependencyClassName} is not in storage!`)
        }

        const { constructorArguments } = DependencyHub.storage[dependencyClassName];
        const classConfigurator = DependencyHub.storage[dependencyClassName];
        if (classConfigurator.instance) {
            return classConfigurator.instance
        } else {
            classConfigurator.resolveDependencies();
            classConfigurator.instance = new classConfigurator.class(...constructorArguments)
            return classConfigurator.instance;
        }
    }
}