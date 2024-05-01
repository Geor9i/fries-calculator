import EventBus from "./evenBus.js";
import EventUtil from "./eventUtil.js";
import StringUtil from "./stringUtil.js";

export default class UtilInjector {
    static string = new StringUtil();
    static event = new EventUtil();
    static eventBus = new EventBus();
}