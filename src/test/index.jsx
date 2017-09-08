import React from "react"
import ReactDOM from "react-dom"
import {Provider} from "react-redux"

import {createSimpleWebSocketMiddleware} from "../main"
import {createStore, applyMiddleware} from "redux";

import Application from "./components/application"
import reducer from "./reducers"

const store = createStore(reducer, {}, applyMiddleware(createSimpleWebSocketMiddleware()))

ReactDOM.render((
    <Provider store={store}>
        <Application/>
    </Provider>
), document.getElementById("application-root"))
