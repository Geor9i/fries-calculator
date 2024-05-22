import FriesCalculator from "./components/friesCalculator.js";
import StringUtil from "./utils/stringUtil.js";
import ObjectUtil from "./utils/objectUtil.js";
import EventUtil from "./utils/eventUtil.js";
import EventBus from "./utils/evenBus.js";
import Options from "./components/options.js";
import ResultsDisplay from "./components/results.js";
import DependencyHub from "./dependencyResolvers/dependencyHub.js";
import SMLComponent from "./lib/smlComponent.js";
import Input from "./components/Input.js";
import Test from "./components/test.js";
 
// const options = DependencyHub.provide(Options);
// const friesCalculator = DependencyHub.provide(FriesCalculator);
// const resultsDisplay = DependencyHub.provide(ResultsDisplay);

class App extends SMLComponent {

    afterViewInit() {
        const element = this.tree[0];
        element.children.push(2)
        element.classList.add('blue');
        element.children.push(1)
        // console.log(element);
    }

    onChanges(changes) {
       console.log(changes);
    }

  render() {
    const text = 'This is some text';
    const getClass = () => 'red';

    return this.m`
    <h1 class="title">Fries calculator</h1>
    `;
  }
}

const app = new App();
app.loadComponents(Input, Test);
app.entry(document.querySelector('.root'));

/**
 * <!-- 
    <h1 class="title">Fries calculator</h1>
    <main>

        <div class="input">
            <p class="title">Input</p>
            <form>
                <div class="reset-container">
                    <a title="Reset">Reset</a>
                </div>
                <fieldset class="product-values">
                    <legend>Product</legend>
                    <div title="Theoretical usage from inventory activity" class="form-group">
                        <label for="theoretical-usage-kg">Theoretical Usage</label>
                        <div class="unit" data-id="kg" data-unit="format">
                            <input value="521.93" name="theoreticalUsage" type="text" id="theoretical-usage-kg">
                        </div>
                    </div>
                    <div title="Wasted fries from inventory activity" class="form-group">
                        <label for="friesWaste">Waste</label>
                        <div class="unit" data-id="kg" data-unit="format">
                            <input value="37" name="waste" type="text" id="friesWaste">
                        </div>
                    </div>
                    <div title="Overportioning amount" class="form-group">
                        <label for="overportionPercent">Overportioning</label>
                        <div class="unit" data-id="%" data-unit="percent&weight">
                            <input max="100" min="0" value="80" name="overportionPercent" type="text"
                                id="overportionPercent">
                        </div>
                    </div>
                    <div title="Unnacounted fries" class="form-group">
                        <label for="unacountedFries">Unaccounted</label>
                        <div class="unit" data-id="kg" data-unit="format">
                            <input value="15.00" name="unaccounted" type="text" id="unacountedFries">
                        </div>
                    </div>

                </fieldset>

                <fieldset class="packaging-amounts">
                    <legend>Amounts</legend>
                    <div title="Theoretical usage of 11/11 fries bags" class="form-group">
                        <label for="friesBag">Fries Bag</label>
                        <div class="unit" data-id="ea" data-unit="mult">
                            <input required value="3,137.00" name="friesBag" type="text" id="friesBag">
                        </div>
                    </div>
                    <div title="Actual usage of fries clamshells" class="form-group">
                        <label for="friesClamshellAmount">Fries Clamshell</label>
                        <div class="unit" data-id="ea" data-unit="mult">
                            <input required value="985.00" name="friesClamshell" type="text" id="friesClamshellAmount">
                        </div>
                    </div>
                    <div title="Theoretical usage of snackboxes" class="form-group">
                        <label for="snackboxAmount">Snackbox</label>
                        <div class="unit" data-id="ea" data-unit="mult">
                            <input required value="116.00" name="snackbox" type="text" id="snackboxAmount">
                        </div>
                    </div>
                    <div title="Theoretical usage of large fries scoops" class="form-group">
                        <label for="friesScoopAmount">Fries Scoop</label>
                        <div class="unit" data-id="ea" data-unit="mult">
                            <input required value="133.00" name="friesScoop" type="text" id="friesScoopAmount">
                        </div>
                    </div>
                    <div title="Theoretical usage of megaboxes" class="form-group">
                        <label for="megaboxAmount">Megabox</label>
                        <div class="unit" data-id="ea" data-unit="mult">
                            <input required value="43.00" name="megabox" type="text" id="megaboxAmount">
                        </div>
                    </div>
                </fieldset>
            </form>
        </div>


        <div class="output">
            <p class="title">Results</p>
            <form>
                <fieldset class="product-values">
                        <legend>Actual Usage</legend>
                    <div title="Calculated actual usage of fries" class="form-group">
                        <p class="output-heading">Frozen Fries</p>
                        <div class="unit" data-id="kg" data-unit="format">
                            <input name="actualUsage" disabled type="text">
                        </div>
                    </div>
                    <div title="Calculated actual total fries usage in KG" class="form-group">
                        <p class="output-heading">Price</p>
                        <div class="unit" data-id="£">
                            <input name="actualPrice" disabled type="text">
                        </div>
                    </div>
                </fieldset>
                <fieldset class="product-values">
                    <legend>Theoretical Usage</legend>
                    <div title="Calculated theo total fries usage in KG" class="form-group">
                        <p class="output-heading">Frozen Fries</p>
                        <div class="unit" data-id="box" data-unit="format">
                            <input name="theoreticalUsage" disabled type="text">
                        </div>
                    </div>
                    <div title="Calculated actual total fries usage in KG" class="form-group">
                        <p class="output-heading">Price</p>
                        <div class="unit" data-id="£">
                            <input name="theoreticalPrice" disabled type="text">
                        </div>
                    </div>
                </fieldset>
                <fieldset class="packaging-amounts">
                    <legend>Portions</legend>
                    <div title="Calculated actual fries usage from fries bags" class="form-group">
                        <p class="output-heading">Fries Bag</p>
                        <div class="unit" data-id="ea" data-unit="mult">
                            <input name="friesBags" disabled type="text">
                        </div>
                    </div>
                    <div title="Calculated actual fries usage from fries clamshells" class="form-group">
                        <p class="output-heading">Fries Clamshell</p>
                        <div class="unit" data-id="ea" data-unit="mult">
                            <input name="friesClamshell" disabled type="text">
                        </div>
                    </div>
                    <div title="Calculated actual fries usage from snackboxes" class="form-group">
                        <p class="output-heading">Snackbox</p>
                        <div class="unit" data-id="ea" data-unit="mult">
                            <input name="snackbox" disabled type="text">
                        </div>
                    </div>
                    <div title="Calculated actual fries usage from fries scoops" class="form-group">
                        <p class="output-heading">Fries Scoop</p>
                        <div class="unit" data-id="ea" data-unit="mult">
                            <input name="friesScoop" disabled type="text">
                        </div>
                    </div>
                    <div title="Calculated actual fries usage from megaboxes" class="form-group">
                        <p class="output-heading">Megabox</p>
                        <div class="unit" data-id="ea" data-unit="mult">
                            <input name="megabox" disabled type="text">
                        </div>
                    </div>
                </fieldset>
            </form>
        </div>
    </main>

    <div title="Toggle options menu" class="options-button-container">
        <svg class="options-button">
            <use xlink:href="./svg/sprite.svg#arrow_down"></use>
        </svg>
    </div>

    
    <section id="options" class="options">
        <p class="title">Options</p>
        <form>
            <fieldset class="product-values">
                <legend>Prices</legend>
                <div title="Price of box of fries" class="form-group">
                    <p class="output-heading">Fries Box Price</p>
                    <div class="unit" data-id="£">
                        <input name="friesBoxFrozen" type="text">
                    </div>
                </div>
                <div title="Price of regular portion of fries" class="form-group">
                    <p class="output-heading">RG Fries</p>
                    <div class="unit" data-id="£">
                        <input name="friesBag" type="text">
                    </div>
                </div>
                <div title="Price of large portion of fries" class="form-group">
                    <p class="output-heading">LG Fries</p>
                    <div class="unit" data-id="£">
                        <input name="friesScoop" type="text">
                    </div>
                </div>
                <div title="Price of large portion of fries" class="form-group">
                    <p class="output-heading">Snackbox</p>
                    <div class="unit" data-id="£">
                        <input name="snackbox" type="text">
                    </div>
                </div>
                <div title="Price of large portion of fries" class="form-group">
                    <p class="output-heading">Megabox</p>
                    <div class="unit" data-id="£">
                        <input name="megabox" type="text">
                    </div>
                </div>
            </fieldset>
            <fieldset class="product-values">
                <legend>Cooked Portion Sizes</legend>
                <div title="Cooked Portion size for rg bag of fries" class="form-group">
                    <p class="output-heading"> RG Fries Bag</p>
                    <div class="unit" data-id="kg" data-unit="weight">
                        <input name="friesBag" type="text">
                    </div>
                </div>
                <div title="Cooked Portion size for lg scoop of fries" class="form-group">
                    <p class="output-heading">LG Fries Scoop</p>
                    <div class="unit" data-id="kg" data-unit="weight">
                        <input name="friesScoop" type="text">
                    </div>
                </div>
                <div title="Cooked Portion size for rg bag of fries" class="form-group">
                    <p class="output-heading">Snackbox</p>
                    <div class="unit" data-id="kg" data-unit="weight">
                        <input name="snackbox" type="text">
                    </div>
                </div>
                <div title="Cooked Portion size for rg bag of fries" class="form-group">
                    <p class="output-heading">Megabox</p>
                    <div class="unit" data-id="kg" data-unit="weight">
                        <input name="megabox" type="text">
                    </div>
                </div>
            </fieldset>
            <fieldset class="product-values">
                <legend>Frozen Portion Sizes</legend>
                <div title="Frozen Portion size for rg bag of fries" class="form-group">
                    <p class="output-heading"> RG Fries Bag</p>
                    <div class="unit" data-id="kg" data-unit="weight">
                        <input name="friesBag" type="text">
                    </div>
                </div>
                <div title="Frozen Portion size for lg scoop of fries" class="form-group">
                    <p class="output-heading">LG Fries Scoop</p>
                    <div class="unit" data-id="kg" data-unit="weight">
                        <input name="friesScoop" type="text">
                    </div>
                </div>
                <div title="Frozen Portion size for rg bag of fries" class="form-group">
                    <p class="output-heading">Snackbox</p>
                    <div class="unit" data-id="kg" data-unit="weight">
                        <input name="snackbox" type="text">
                    </div>
                </div>
                <div title="Frozen Portion size for rg bag of fries" class="form-group">
                    <p class="output-heading">Megabox</p>
                    <div class="unit" data-id="kg" data-unit="weight">
                        <input name="megabox" type="text">
                    </div>
                </div>
            </fieldset>
        </form>
    </section> -->
 */
