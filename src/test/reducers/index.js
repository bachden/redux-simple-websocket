import { combineReducers, createStore, compose, applyMiddleware } from "redux";

import connection from "./connection"

const reducer = combineReducers({
	connection
})

export default reducer