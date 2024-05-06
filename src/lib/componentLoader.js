export default class componentLoader {
    static dependencies = ['SML'];

        static storage = {};
        static events = {};
    
        static on(eventType, className, callback, deleteOnExec = false) {
            if(DependencyHub.events.hasOwnProperty(eventType)) {
                if (DependencyHub.events[eventType].hasOwnProperty(className)) {
                    DependencyHub.events[eventType][className].push({callback, deleteOnExec});
                }else {
                    DependencyHub.events[eventType][className] = [{callback, deleteOnExec}];
                }
            } else {
                DependencyHub.events[eventType] = {
                    [className]: [{callback, deleteOnExec}]
                };
            }
            
            return () => {
                let subscribtionIndex = DependencyHub.events[eventType][className].length - 1;
                DependencyHub.events[eventType][className].splice(subscribtionIndex, 1);
            }
        }
    
        static emit(eventType, data = null) {
            let deletionQueue = [];
            if (DependencyHub.events.hasOwnProperty(eventType)) {
                Object.keys(DependencyHub.events[eventType]).forEach(className  => {
                    DependencyHub.events[eventType][className].forEach((subscription, index) => {
                        subscription.callback(data);
                        if (subscription.deleteOnExec) {
                            deletionQueue.push({eventType, className, index});
                        }
                    });
                })
            }
            deletionQueue.forEach(request => DependencyHub.events[request.eventType][request.className].splice(request.index, 1));
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
            const resolveDependencies = this._resolveDependencies.bind(dependencyClass);
            DependencyHub.storage[className] = { class: dependencyClass, instance: null, constructorArguments, dependencies, resolveDependencies };
        }
    
        static _resolveDependencies(dependencies) {
            const requesterClass = this.prototype;
            const requesterClassName = this.name;
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
                    throw new Error(`Dependency ${dependencyName} for ${requesterClassName} class is not in storage!`)
                }
                const { instance, dependencies: opposingDependencies } = DependencyHub.storage[dependencyName];
                if (instance === null) {
                    const circularDependencyFlag = opposingDependencies.some(dependencyName => dependencyName === requesterClassName);
                    if (circularDependencyFlag) {
                        const dependencyClass = DependencyHub.storage[dependencyName].class;
                        const placeholderObject = Object.create(dependencyClass.prototype);
                        Object.getOwnPropertyNames(dependencyClass.prototype).forEach(methodName => {
                            placeholderObject[methodName] = dependencyClass.prototype[methodName].bind(placeholderObject);
                        });
    
                        DependencyHub.storage[dependencyName].instance = placeholderObject;
                        DependencyHub.storage[dependencyName].placeholder = true;
                        DependencyHub.on(`init-${requesterClassName}`, dependencyName, DependencyHub.provide.bind(this, dependencyClass), true);
                        DependencyHub.on(`init-${dependencyName}`, requesterClassName, () => DependencyHub.storage[requesterClassName].class.prototype[resolvedDependencyName] = DependencyHub.storage[dependencyName].instance, true);
                    } else {
                        DependencyHub.provide(DependencyHub.storage[dependencyName].class);
                    }
                } 
                requesterClass[resolvedDependencyName] = DependencyHub.storage[dependencyName].instance;
            })
        }
    
        static remove(dependencyName) {
            if (!DependencyHub.storage.hasOwnProperty(dependencyName)) {
                delete DependencyHub.storage[dependencyName];
                DependencyHub.emit(`Delete-${dependencyName}`);
            }else {
                throw new Error(`Dependency ${dependencyName} does not exist!`)
            }
        }
    
        static provide(storedClass) { 
            const storedClassName = storedClass.name;
            if (!DependencyHub.storage.hasOwnProperty(storedClassName)) {
                throw new Error(`Class ${storedClassName} is not in storage!`)
            }
    
            const { constructorArguments } = DependencyHub.storage[storedClassName];
            const classConfigurator = DependencyHub.storage[storedClassName];
            const isPlaceholder = !!classConfigurator.placeholder;
            if (classConfigurator.instance !== null && !isPlaceholder) {
                return classConfigurator.instance
            } else {
                if (isPlaceholder) {
                    classConfigurator.placeholder = false;
                }
    
                classConfigurator.resolveDependencies(classConfigurator.dependencies);
                classConfigurator.instance = new classConfigurator.class(...constructorArguments);
                DependencyHub.emit(`init-${storedClassName}`);
                return classConfigurator.instance;
            }
        }
    }