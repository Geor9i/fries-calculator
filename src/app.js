import FriesCalculator from "./components/friesCalculator.js";
import StringUtil from "./utils/stringUtil.js";
import EventUtil from "./utils/eventUtil.js";
import EventBus from './utils/evenBus.js';
import Options from "./components/options.js";
import ResultsDisplay from "./components/results.js";
import DependencyHub from "./dependencyResolvers/dependencyHub.js";

const options = DependencyHub.provide(Options);
const friesCalculator = DependencyHub.provide(FriesCalculator);
const resultsDisplay = DependencyHub.provide(ResultsDisplay);
