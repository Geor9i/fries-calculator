import App from "./app.js";
import { smlBootloader } from "./lib/smlBootLoader.js";

const root = document.querySelector('.root');
smlBootloader.entry(root, App);