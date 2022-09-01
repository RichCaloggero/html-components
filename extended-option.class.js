export class ExtendedOption extends HTMLElement {
static get observedAttributes() {
return ["aria-selected"];
} // static observedAttributes


constructor () {
super ();
//console.log(`${this.tagName} constructed\n`);
} // constructor

connectedCallback () {
if (this.isConnected) {
console.log(`${this.tagName} connected\n; ${[...this.parentElement.children].includes(this)}`);
checkScope(this);
this.setAttribute("role", "option");
this.setAttribute("tabindex", "-1");
if (this.parentElement.isMultiselectable()) {
this.setAttribute("aria-selected", "false");
if (this.hasAttribute("select")) this.parentElement.selectOption(this);
} // if
if (not(this.parentElement.getFocus())) this.parentElement.setInitialFocus(this);

} else {
console.log(`${this.tagName} is not connected\n`);
} // if
} // connectedCallback


attributeChangedCallback (name, oldValue, newValue) {
//console.log(`attribute ${name}: was ${oldValue}, now ${newValue}`);

if (name === "aria-selected") handleSelectionChange(this, newValue);
} // attributeChangedCallback
}; // class ExtendedOption

customElements.define("extended-option", ExtendedOption);

export function checkScope (element) {
if (element.parentElement.matches("extended-select")) return;
throw new Error("EXTENDED-OPTION must be child of EXTENDED-SELECT\n");
} // checkScope

export function buildShadowDom (element) {

} // buildShadowDom


function handleSelectionChange (option, value) {
if (option.parentElement.isMultiselectable()) option.setAttribute("aria-checked", value);
} // handleSelectionChange

function handleCheckedStateChange (option, value) {
} // handleCheckedStateChange

function not (x) {return !!!x;}

