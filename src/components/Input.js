import SMLComponent from "../lib/smlComponent.js";

export default class Input extends SMLComponent {
    constructor() {
        super()

    }

    render() {
        return `
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
    </div>`
    }
}