import FriesCalculator from "./components/friesCalculator.js";
import StringUtil from "./utils/stringUtil.js";
import ObjectUtil from './utils/objectUtil.js'
import EventUtil from "./utils/eventUtil.js";
import EventBus from './utils/evenBus.js';
import Options from "./components/options.js";
import ResultsDisplay from "./components/results.js";
import DependencyHub from "./dependencyResolvers/dependencyHub.js";
import './app.config.js';
import SMLComponent from "./lib/smlComponent.js";
import Heading from "./components/heading.js";
import SML from "./lib/sml.js";

const sml = DependencyHub.provide(SML);
// const options = DependencyHub.provide(Options);
// const friesCalculator = DependencyHub.provide(FriesCalculator);
// const resultsDisplay = DependencyHub.provide(ResultsDisplay);


class App extends SMLComponent {

    render() {
        return `
        <main>
        <Heading />
        </main>`
    }

}
sml.loadComponents(Heading);
sml.entry(App);





