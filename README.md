Simple websocket middleware for ReactJS

# installation
``` bash
npm i redux-simple-websocket
```

# usage
create middleware and apply to redux store
``` javascript
import { createStore, applyMiddleware } from "redux"
import { createSimpleWebSocketMiddleware } from "redux-simple-websocket"

const store = createStore( reducer, {}, applyMiddleware( createSimpleWebSocketMiddleware() ) )
```

# actions
``` javascript
import { connectWebSocketAction, closeWebSocketAction, sendDataToWebSocketAction } from "redux-simple-websocket"

// connect to a websocket
dispatch( connectWebSocketAction( endpoint ) )

// close websocket
dispatch( closeWebSocketAction( endpoint ) )

// send message to websocket
dispatch( sendDataToWebSocketAction( endpoint, message ) )
```

if websocket did not connected, and you try to sending, the payload will be push to queue and wait for connection

# events
all actions can be used by import
``` javascript
import { ActionTypes } from "redux-simple-websocket"
```
then you can listen action in your reducers
``` javascript
let defaultState = {
    // 0 == disconnect, 1 == connected
    connected: false,
    endpoint: "ws://localhost:8888/websocket",
    lastError: null,
    log: []
}

const connection = ( state = defaultState, action ) => {
    switch ( action.type ) {
        case ActionTypes.WEBSOCKET_CONNECTED:
            return {
                ...state,
                connected: true,
                log: state.log.concat( ["[OPEN] > " + action.endpoint] )
            }
        case ActionTypes.WEBSOCKET_ERROR:
            return {
                ...state,
                lastError: action.error,
                log: state.log.concat( ["[ERROR] > " + action.endpoint + "\n err" + action.error] )
            }
        case ActionTypes.WEBSOCKET_DISCONNECTED:
            return {
                ...state,
                connected: false,
                log: state.log.concat( ["[CLOSED] > " + action.endpoint] )
            }
        case ActionTypes.SEND_DATA_TO_WEBSOCKET:
            return {
                ...state,
                log: state.log.concat( ["[SEND] (" + action.endpoint + ") > " + JSON.stringify( action.payload )] )
            }
        case ActionTypes.RECEIVED_WEBSOCKET_DATA:
            return {
                ...state,
                log: state.log.concat( ["[RECV] (" + action.endpoint + ") < " + JSON.stringify( action.payload )] )
            }
        case "CHANGE_SIGNALING_SERVER_ENDPOINT":
            if ( action.endpoint != state.endpoint ) {
                return {
                    ...state,
                    endpoint: action.endpoint
                }
            }
    }
    return state
}
````
