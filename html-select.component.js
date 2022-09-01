let idPrefix = 0;

export class ExtendedSelect extends HTMLElement {
#selection = new Map();
#currentFocus = null;

constructor () {
super ();
//console.log(`${this.tagName} constructed\n`);
} // constructor

connectedCallback () {
if (this.isConnected) {
console.log(`${this.tagName} is connected\n`);
this.setAttribute("role", "listbox");
if (this.isMultiselectable()) this.setAttribute("aria-multiselectable", "true");
this.addEventListener("click", this.#handleClick);
this.addEventListener("keydown", this.#handleKeydown);
this.#findLabel();

} else {
console.log(`${this.tagName} is not connected\n`);
} // if
} // connectedCallback

isMultiselectable () {
return this.isConnected && this.hasAttribute("multiple");
} // isMultiselectable

getFocus() {
return this.#currentFocus;
} // getFocus

selectOption (option) {
if (not(option?.matches("extended-option"))) return;

this.#selection.set(option, true);
option.setAttribute("aria-selected", "true");
option.dispatchEvent(new CustomEvent("change", {bubbles: true}));
} // selectOption

unselectOption (option) {
if (not(option?.matches("extended-option"))) return;

this.#selection.delete(option);
option.setAttribute("aria-selected", "false");
} // unselectOption

get selectedOptions () {
return [...this.#selection.entries()].filter(entry => entry[1]).map(entry => entry[0]);
} // selectedOptions

get length () {
return this.children.length;
} // get length

get selectedIndex () {
if (this.children.length === 0 || this.#selection.size === 0) return -1;
return [...this.children].findIndex(x => x[1].getAttribute("aria-selected") === "true");
} // get selectedIndex

clearSelection () {
[...this.children].forEach(option => option.setAttribute("aria-selected", "false"));
} // clearSelection

clearFocus () {
[...this.children].forEach(option => option.setAttribute("tabindex", "-1"));
} // clearFocus

setInitialFocus (option) {
if (this.getFocus()) return;
this.#focusOption(option);
} // setInitialFocus

#handleClick (e) {
if (not(e.target.matches("extended-option"))) return;
const option = e.target;
this.#focusOption(option);
option.focus();
} // handleClick


#handleKeydown (e) {
if (not(e.target.matches("extended-option"))) return;
const key = e.key;
const option = e.target;

if (key === "ArrowDown" && option.nextElementSibling) option.nextElementSibling.click();
else if (key === "ArrowUp" && option.previousElementSibling) option.previousElementSibling.click();
else if (key === " ") {
if (this.isMultiselectable()) this.toggleOption(option);
option.click();
} // if
} // handleKeydown

#focusOption (option) {
this.clearFocus();

if (not(this.isMultiselectable())) {
this.clearSelection();
this.selectOption(option);
} // if

option.setAttribute("tabindex", "0");
this.#currentFocus = option;
} // #focusOption

toggleOption (option) {
if (this.isMultiselectable()) {
option.getAttribute("aria-selected") === "true"? this.unselectOption(option)
: this.selectOption(option);
} // if
} // toggleOption

getFocus () {
return this.querySelector("[tabindex='0']");
} // getFocus

#findLabel () {
if (this.hasAttribute("aria-label") || this.hasAttribute("aria-labelledby")) return;

if (this.parentElement.matches("label")) attachLabel(this.parentElement, this);
else if (this.id) {
const label =  document.querySelector(`label[for="${this.id}"]`);
if (label) attachLabel(label, this);
} // if
} // findLabel
}; // class ExtendedSelect

customElements.define("extended-select", ExtendedSelect);


function attachLabel (label, element) {
const id = label.id? label.id : (label.id = generateId());
element.setAttribute("aria-labelledby", id);
} // attachLabel

function generateId () {
let id = "";
do {
idPrefix += 1;
id = `label-${idPrefix}`;
} while (not(isUniqueId(id)));

return id;
} // generateId

function isUniqueId (id) {
return not(document.getElementById(id));
} // isUniqueId

function not (x) {return !!!x;}

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

function checkScope (element) {
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


