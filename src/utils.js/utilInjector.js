import DependencyHub from "../dependencyResolvers/dependencyHub.js";
import EventBus from "./evenBus.js";
import EventUtil from "./eventUtil.js";
import StringUtil from "./stringUtil.js";

export default class UtilInjector {
    static string = DependencyHub.provide(StringUtil);
    static event = DependencyHub.provide(EventUtil);
    static eventBus = DependencyHub.provide(EventBus);
}