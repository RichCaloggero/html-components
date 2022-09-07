const runTests = true;
let idPrefix = 0;

export class ExtendedSelect extends HTMLElement {
static formAssociated = true;
#internals = null;
#value = null;
#currentFocus = null;

static get observedAttributes () {
return ["multiple"];
} // static get observedAttributes

constructor () {
super ();
this.#internals = this.attachInternals();
this.setAttribute("role", "listbox");
//console.log(`${this.tagName} constructed\n`);
} // constructor

connectedCallback () {
//if (this.isConnected) {
this.addEventListener("click", this.#handleClick);
this.addEventListener("keydown", this.#handleKeydown);
this.#findLabel();
if (runTests) console.log(`${this.tagName} is connected\n`);

//} else {
//console.log(`${this.tagName} is not connected\n`);
//} // if
} // connectedCallback

attributeChangedCallback (name, oldValue, newValue) {
if (name === "multiple") this.handleMultipleChanged (newValue, oldValue);
} // attributeChangedCallback 

handleMultipleChanged (newValue, oldValue) {
this.setAttribute("aria-multiselectable",
(newValue === "" || newValue)? "true" : "false"
); // setAttribute

if (runTests) console.log("handleMultipleChanged: ", newValue, ", ", this.getAttribute("aria-multiselectable"), "\n");
} // handleMultipleChanged


/// form support

// Form controls usually expose a "value" property
get value() { return this.#value; }
set value(v) { this.#value = v; }

// The following properties and methods aren't strictly required,
// but browser-level form controls provide them. Providing them helps
// ensure consistency with browser-provided controls.
get form() { return this.#internals.form; }
get name() { return this.getAttribute('name'); }
get type() { return this.localName; }
get validity() {return this.#internals.validity; }
get validationMessage() {return this.#internals.validationMessage; }
get willValidate() {return this.#internals.willValidate; }

checkValidity() { return this.#internals.checkValidity(); }
reportValidity() {return this.#internals.reportValidity(); }



isMultiselectable () {
return this.hasAttribute("aria-multiselectable");
} // isMultiselectable


#selectOption (option) {
option.setAttribute("aria-selected", "true");
option.dispatchEvent(new CustomEvent("change", {bubbles: true}));
} // #selectOption

#unselectOption (option) {
option.setAttribute("aria-selected", "false");
option.dispatchEvent(new CustomEvent("change", {bubbles: true}));
} // #unselectOption

get selectedOptions () {
return this.querySelectorAll("[aria-selected='true']");
} // selectedOptions

get length () {
return this.children.length;
} // get length

get options () {
return this.children;
} // get options

get selectedIndex () {
if (this.children.length === 0 || this.selectedOptions.length === 0) return -1;
return [...this.children].findIndex(x => x === this.selectedOptions[0]);
} // get selectedIndex

add (element, before) {
if (before instanceof Element && this.contains(before)) before.insertAdjacentElement("beforeBegin", element);
else if (this.children[before]) this.children[before].insertAdjacentElement("beforeBegin", element);
else this.insertAdjacentElement("beforeEnd", element);

this.addOption(element);
} // add

addOption (option) {
option.setAttribute("aria-selected", "false");
if (this.isMultiselectable()) {
if (option.hasAttribute("selected")) this.#selectOption(option);
} // if
//if (runTests && this.id === "test-api") console.log("addOption: ", this, ", ", option, "\n");

if (not(this.#getFocus())) this.#setInitialFocus(option);
} // addOption

#getFocus () {
return this.querySelector("[tabindex='0']");
} // #getFocus

clearSelection () {
[...this.children].forEach(option => option.setAttribute("aria-selected", "false"));
} // clearSelection

#clearFocus () {
[...this.children].forEach(option => option.setAttribute("tabindex", "-1"));
} // #clearFocus

#setInitialFocus (option) {
if (this.#getFocus()) return;
this.#focusOption(option);
} // setInitialFocus

#handleClick (e) {
if (not(e.target.matches("extended-option"))) return;

const option = e.target;
this.#focusOption(option);
option.focus();
} // handleClick

#handleKeydown (e) {
if (not(e.target instanceof ExtendedOption)) return;

const key = e.key;
const option = e.target;

if (key === "ArrowDown" && option.nextElementSibling) option.nextElementSibling.click();
else if (key === "ArrowUp" && option.previousElementSibling) option.previousElementSibling.click();
else if (this.isMultiselectable() && key === " ") {
this.#toggleOption(option);
option.click();
} else if (this.length > 0 && key === "Home") {
this.children[0].click();
} else if (this.length > 0 && key === "End") {
this.children[this.length-1].click();
} // if
} // handleKeydown

#focusOption (option) {
this.#clearFocus();

if (not(this.isMultiselectable())) {
this.clearSelection();
this.#selectOption(option);
} // if

option.setAttribute("tabindex", "0");
this.#currentFocus = option;
} // #focusOption

#toggleOption (option) {
if (this.isMultiselectable()) {
option.getAttribute("aria-selected") === "true"? this.#unselectOption(option)
: this.#selectOption(option);
} // if
} // toggleOption


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
this.setAttribute("role", "option");
this.setAttribute("tabindex", "-1");
this.setAttribute("aria-selected", "false");
//console.log(`${this.tagName} constructed\n`);
} // constructor

connectedCallback () {
//if (this.isConnected) {
if (this.parentElement instanceof ExtendedSelect) {
//console.log("calling addOption: ", this, ", ", this.parentElement);
this.parentElement.addOption(this);
} // if
if (runTests) console.log(`${this.tagName} connected\n; ${[...this.parentElement.children].includes(this)}`);

//} else {
//console.log(`${this.tagName} is not connected\n`);
//} // if
} // connectedCallback

attributeChangedCallback (name, oldValue, newValue) {
//console.log(`attribute ${name}: was ${oldValue}, now ${newValue}`);

if (name === "aria-selected") this.#handleSelectionChange(newValue);
} // attributeChangedCallback

#handleSelectionChange (value) {
if (this.parentElement?.isMultiselectable() & value === "true") this.setAttribute("aria-checked", "true");
else this.removeAttribute("aria-checked");
} // #handleSelectionChange

#handleCheckedStateChange (option, value) {
} // handleCheckedStateChange

}; // class ExtendedOption

customElements.define("extended-option", ExtendedOption);

function checkScope (element) {
if (element.parentElement.matches("extended-select")) return;
throw new Error("EXTENDED-OPTION must be child of EXTENDED-SELECT\n");
} // checkScope

export function buildShadowDom (element) {

} // buildShadowDom



/// Tests

if (runTests) {
let l = new ExtendedSelect();

try {
console.log("** running tests **\n");
l.id = "test-api";
l.setAttribute("multiple", "");
l.setAttribute("aria-label", "test API");
l.insertAdjacentHTML("beforeEnd", `
<extended-option value="0">option 0</extended-option>
<extended-option selected value="1">option 1</extended-option>
<extended-option selected value="2">option 2</extended-option>
`);
if (not(l.length === 3)) throw new Error(`test: length not correct;  ${l.length}\n`);

let x = new ExtendedOption();
x.textContent = "option added at the end";
l.add(x);
if (not(l.options[l.length-1] === x)) throw new Error(`add to end not working; ${l.options[l.length-1].textContent}\n`);

x = new ExtendedOption();
x.textContent = "option added at the beginning";
l.add(x, 0);
if (not(l.options[0] === x)) throw new Error(`add to beginning not working; ${l.options[0].textContent}\n`);

x = new ExtendedOption();
x.textContent = "option added before index 1";
l.add(x, l.children[1]);
if (not(l.options[1] === x)) throw new Error(`add before index 1 not working; ${l.options[1].textContent}\n`);

x = document.createElement("h2");
x.textcontent = "self test";
document.body.appendChild(x);
document.body.appendChild(l);
if (not(l.selectedOptions.length === 2)) throw new Error (`test: selectedOptions.length  not correct; ${l.selectedOptions.length}\n`);
if (not(l.selectedOptions[0] === l.children[3] && l.selectedOptions[1] === l.children[4])) throw new Error(`test: selectedOptions not correct;  ${l.selectedOptions}\n`);

document.body.insertAdjacentHTML("beforeEnd", `
<h2>html select element test</h2>
<select id="html-select" multiple>
<option>foo</option>
<option selected>bar</option>
<option selected>baz</option>
</select>
`);


console.log("** tests complete **\n");


} catch (e) {
console.log(e);
debugger;
} // catch
} // if runTests

