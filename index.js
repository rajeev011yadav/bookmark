import $ from "jquery";
import { curry, compose } from "ramda";
import Maybe from "data.maybe";
import {isUri} from "valid-url";

let state = [];
const value = element => element.val() ? Maybe.of(element.val()) : Maybe.Nothing();
const bookMark = curry((name, url) => ({ "name": name , "url" : url}));
const bookMarkToHtml = ({name, url}) => {
    return `<div class="card mb-3">
                <div class="row no-gutter">
                    <div class="col-md-2 d-flex justify-content-center align-items-center">
                        <svg class="bi bi-bookmark-fill" width="4em" height="4em" viewBox="0 0 16 16" fill="#007bff" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M3 3a2 2 0 012-2h6a2 2 0 012 2v12l-5-3-5 3V3z" clip-rule="evenodd"/>
                        </svg>
                    </div>
                    <div class="col-md-10 p-0">
                        <div class="card-body">
                            <h4 class="card-title">${name}</h4>
                            <a href="${url}" target="_blank" class="btn btn-sm btn-primary">Visit</a>
                            <button id="remove-btn" class="btn btn-sm btn-danger" data-url="${name}">Remove</button>
                        </div>
                    </div>
                </div>
            </div>`;
};


const validateUrl = url => isUri(url) ? Maybe.of(url) : Maybe.Nothing();

const updateState = curry((newBookMark, state) => [newBookMark, ...state]);
const getBookMark = () => Maybe.of(bookMark)
                            .ap(
                                value($("#name"))
                                .map(e => e.charAt(0).toUpperCase() + e.slice(1))
                            )
                            .ap(
                                value($("#website_url"))
                                .chain(validateUrl)
                            );

const trace = (x) => {console.log(x); return x;};

const stateToHtml = state => state.map(bookMarkToHtml);

const clearInnerHtml = element => {element.html(""); return element;};

const render = curry((element, html) => element.append(html));

const renderState = curry((state, element) => compose(render(element), stateToHtml)(state));

const storeState = (state) => {localStorage.setItem("bookmarkAppState", JSON.stringify(state)); return state;};
const getStateFromStore = () => {const state = localStorage.getItem("bookmarkAppState"); return state ? Maybe.of(JSON.parse(state)) : Maybe.Nothing(); };

const restoreInitialState = (stateFromStore) => {state = stateFromStore; return state;}; 

const changeUI = (selector, state) => compose(renderState(state), clearInnerHtml, $)(selector); 

const init = () => changeUI("#display", getStateFromStore().map(restoreInitialState).getOrElse(state));

$("#form").on("submit", (e) => {
    e.preventDefault();
    state = getBookMark()
                .map(updateState)
                .ap(Maybe.of(state))
                .map(storeState)
                .getOrElse(state);

    changeUI("#display", state);
});

$("#display").on('click', '#remove-btn', e => {
    state = Maybe.of(e.target)
    .map(e => e.getAttribute("data-url"))
    .map(v => state.filter(s => s.name != v))
    .map(storeState)
    .getOrElse(state);
    changeUI("#display", state);
});

init();




