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
import ComponentLoader from "./lib/componentLoader.js";

const loader = DependencyHub.provide(ComponentLoader);
// const options = DependencyHub.provide(Options);
// const friesCalculator = DependencyHub.provide(FriesCalculator);
// const resultsDisplay = DependencyHub.provide(ResultsDisplay);


class App extends SMLComponent {

    render() {
        return `<header class="cat" data-id="first">
        <img src="fd" alt="fd" />
            <h1>Hello to my site <a href="https://google.com" class="link">this is a link</a></h1>
            <nav>
                <ul>
                    <li>List Item 01</li>
                    <li>List Item 02</li>
                    <li>List Item 03</li>
                    <li>List Item 04</li>
                    <li>List Item 05</li>
                </ul>
            </nav>
        </header>
        <main>
            <aside>
                <nav>
                    <ul>
                        <li><a href="https://Link_Test1"></a>Link 1</li>
                        <li><a href="https://Link_Test2"></a>Link 2</li>
                        <li><a href="https://Link_Test3"></a>Link 3</li>
                        <li><a href="https://Link_Test4">click me</a>Link 4</li>
                    </ul>
                </nav>
            </aside>
            <section class="part" id="section1"></section>
            <section class="part" id="section2"></section>
            <section class="part" id="section3"></section>
        </main>
        <footer>
            &copy; KFC
        </footer> `
    }

}

loader.entry(App);





