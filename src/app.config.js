import DependencyHub from "./dependencyResolvers/dependencyHub.js";
import SML from "./lib/sml.js";

const root = document.querySelector('.root');
const sml = DependencyHub.provide(SML);
sml.setRoot(root);