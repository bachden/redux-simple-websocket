import {ActionTypes} from "../../main/index"

let defaultState = {
    connected: false,
    endpoint: "ws://localhost:8888/signal",
    lastError: null,
    log: []
}

const connection = (state = defaultState, action) => {
    switch (action.type) {
        case ActionTypes.WEBSOCKET_CONNECTED:
            return {
                ...state,
                connected: true,
                log: state.log.concat(["[OPEN] > " + action.endpoint])
            }
        case ActionTypes.WEBSOCKET_ERROR:
            return {
                ...state,
                lastError: action.error,
                log: state.log.concat(["[ERROR] > " + action.endpoint + "\n err" + action.error])
            }
        case ActionTypes.WEBSOCKET_DISCONNECTED:
            return {
                ...state,
                connected: false,
                log: state.log.concat(["[CLOSED] > " + action.endpoint])
            }
        case ActionTypes.SEND_DATA_TO_WEBSOCKET:
            return {
                ...state,
                log: state.log.concat(["[SEND] (" + action.endpoint + ") > " + JSON.stringify(action.payload)])
            }
        case ActionTypes.RECEIVED_WEBSOCKET_DATA:
            return {
                ...state,
                log: state.log.concat(["[RECV] (" + action.endpoint + ") < " + JSON.stringify(action.payload)])
            }
        case "CHANGE_SERVER_ENDPOINT":
            if (action.endpoint != state.endpoint) {
                return {
                    ...state,
                    endpoint: action.endpoint
                }
            }
    }
    return state
}

export default connection
