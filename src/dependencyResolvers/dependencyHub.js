export default class DependencyHub{
    static storage = {};
    static events = {};

    static on(eventType, className, callback) {
        if(DependencyHub.events.hasOwnProperty(eventType)) {
            if (DependencyHub.events[eventType].hasOwnProperty(className)) {
                DependencyHub.events[eventType][className].push({callback});
            }else {
                DependencyHub.events[eventType][className] = [{callback}];
            }
        } else {
            DependencyHub.events[eventType] = {
                [className]: [{callback}]
            };
        }
        
        return () => {
            let subscribtionIndex = DependencyHub.events[eventType][className].length - 1;
            DependencyHub.events[eventType][className].splice(subscribtionIndex, 1);
        }
    }

    static emit(eventType, data = null) {
        if (DependencyHub.events.hasOwnProperty(eventType)) {
            Object.keys(DependencyHub.events[eventType]).forEach(className  => {
                DependencyHub.events[eventType][className].forEach(subscription => subscription.callback(data));
            })
        }
    }

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
        dependencies.forEach(entry => {
            let dependencyName, resolvedDependencyName;
            if (typeof entry === 'string') {
                dependencyName = entry;
                resolvedDependencyName = dependencyName.slice(0,1).toLowerCase() + dependencyName.slice(1);
            } else {
                 [resolvedDependencyName, dependencyName] = entry;
            }
            const inStorage = DependencyHub.storage.hasOwnProperty(dependencyName);
            if (!inStorage) {
                throw new Error(`Dependency ${dependencyName} for ${dependencyClassName} class is not in storage!`)
            }
            const isInstantiated = DependencyHub.storage[dependencyClassName].instance !== null;
            if (!isInstantiated) {
                DependencyHub.provide(DependencyHub.storage[dependencyName].class);
            } 
            dependencyClass[resolvedDependencyName] = DependencyHub.storage[dependencyName].instance;
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
        const dependencyClassName = dependencyClass.name;
        if (!DependencyHub.storage.hasOwnProperty(dependencyClassName)) {
            throw new Error(`Class ${dependencyClassName} is not in storage!`)
        }

        const { constructorArguments } = DependencyHub.storage[dependencyClassName];
        const classConfigurator = DependencyHub.storage[dependencyClassName];
        if (classConfigurator.instance) {
            return classConfigurator.instance
        } else {
            classConfigurator.resolveDependencies();
            classConfigurator.instance = new classConfigurator.class(...constructorArguments);
            return classConfigurator.instance;
        }
    }
}