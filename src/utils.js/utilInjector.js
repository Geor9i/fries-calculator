import EventBus from "./evenBus.js";
import EventUtil from "./eventUtil.js";
import Util from "./util.js";

export default class UtilInjector {
    static util = new Util();
    static event = new EventUtil();
    static eventBus = new EventBus();
}