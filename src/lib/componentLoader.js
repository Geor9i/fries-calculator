import DependencyHub from "../dependencyResolvers/dependencyHub.js";

export default class ComponentLoader {
    static dependencies = [['sml', 'SML']];
    constructor() {
            this.storage = {};
            this.root = this.sml.root;
            this.events = {};
        }

        entry(appComnponent) {
            const app = new appComnponent();
            const domMap = this.sml.m `${app.render()}`;
            this.sml.display(this.root, ...domMap);
        }
    
      
    }

    DependencyHub.add(ComponentLoader);