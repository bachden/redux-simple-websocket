export const ActionTypes = {
    WEBSOCKET_CONNECTED: '@@redux-simple-websocket/WEBSOCKET_CONNECTED',
    WEBSOCKET_DISCONNECTED: '@@redux-simple-websocket/WEBSOCKET_DISCONNECTED',
    WEBSOCKET_ERROR: '@@redux-simple-websocket/WEBSOCKET_ERROR',
    SEND_DATA_TO_WEBSOCKET: '@@redux-simple-websocket/SEND_DATA_TO_WEBSOCKET',
    CLOSE_WEBSOCKET: '@@redux-simple-websocket/CLOSE_WEBSOCKET',
    CONNECT_WEBSOCKET: '@@redux-simple-websocket/CONNECT_WEBSOCKET',
    RECEIVED_WEBSOCKET_DATA: '@@redux-simple-webSocket/RECEIVED_WEBSOCKET_DATA'
}

let actionTypeValues = [];
for (var key in ActionTypes) {
    actionTypeValues.push(ActionTypes[key])
}

export const connectWebSocketAction = (endpoint) => ({type: ActionTypes.CONNECT_WEBSOCKET, endpoint})

export const sendDataToWebSocketAction = (endpoint, data) => ({type: ActionTypes.SEND_DATA_TO_WEBSOCKET, payload: data, endpoint})

export const closeWebSocketAction = (endpoint) => ({type: ActionTypes.CLOSE_WEBSOCKET, endpoint})

let createConnectionAction = (endpoint) => ({type: ActionTypes.WEBSOCKET_CONNECTED, endpoint})

let createDisonnectionAction = (endpoint) => ({type: ActionTypes.WEBSOCKET_DISCONNECTED, endpoint})

let createErrorAction = (endpoint, error) => ({type: ActionTypes.WEBSOCKET_ERROR, error: new Error(error), endpoint})

let createMessageAction = (endpoint, data) => ({type: ActionTypes.RECEIVED_WEBSOCKET_DATA, endpoint, payload: data})

const createSimpleWebSocketMiddleware = () => {

    var connections = {}

    return store => {

        function setupSocket(endpoint) {
            var socket = new WebSocket(endpoint)
            socket.onopen = (e) => {
                var connection = getConnection(endpoint);
                connection.connected = true
                store.dispatch(createConnectionAction(endpoint))

                var queue = connection.queue;
                connection.queue = []
                if (queue.length > 0) {
                    queue.map(data => {
                        store.dispatch(sendDataToWebSocketAction(endpoint, data))
                    })
                }
            }

            socket.onerror = (err) => {
                delete connections[endpoint]
                store.dispatch(createErrorAction(endpoint, err))
            }

            socket.onmessage = (e) => {
                var data = e.data;
                try {
                    data = JSON.parse(data)
                } catch (err) {
                    // do nothing
                }
                store.dispatch(createMessageAction(endpoint, data))
            }

            socket.onclose = () => {
                delete connections[endpoint]
                store.dispatch(createDisonnectionAction(endpoint))
            }

            return socket
        }

        function setupConnection(endpoint) {
            if (connections[endpoint]) {
                store.dispatch(createErrorAction(endpoint, "WebSocket for endpoint '" + endpoint + "' already created"))
                return undefined;
            }
            try {
                var socket = setupSocket(endpoint)
            } catch (err) {
                store.dispatch(createErrorAction(endpoint, err))
                return
            }
            var connection = {
                endpoint: endpoint,
                websocket: socket,
                connected: false,
                queue: []
            }
            connections[endpoint] = connection
            return connection
        }

        function getConnection(endpoint) {
            if (!connections[endpoint]) {
                return setupConnection(endpoint)
            }
            return connections[endpoint]
        }

        function isWebSocketAction(action) {
            return actionTypeValues.indexOf(action.type) > -1;
        }

        function isConnectionAvailable(endpoint) {
            return connections[endpoint]
                ? true
                : false;
        }

        return next => action => {
            if (!isWebSocketAction(action)) {
                return next(action);
            }

            var endpoint = action.endpoint;
            if (typeof endpoint != "string" || endpoint.indexOf("ws") != 0) {
                next(createErrorAction(endpoint, "Endpoint invalid"))
            } else {
                if (action.type == ActionTypes.CLOSE_WEBSOCKET) {
                    if (isConnectionAvailable(endpoint)) {
                        getConnection(endpoint).websocket.close()
                    }
                    return;
                }

                var okToNext = true;
                if ([ActionTypes.SEND_DATA_TO_WEBSOCKET, ActionTypes.CONNECT_WEBSOCKET].indexOf(action.type) > -1) {
                    var connection = getConnection(action.endpoint);
                    if (connection && ActionTypes.SEND_DATA_TO_WEBSOCKET == action.type) {
                        if (connection.connected) {
                            connection.websocket.send(JSON.stringify(action.payload))
                        } else {
                            connection.queue.push(action.payload)
                            okToNext = false
                        }
                    }
                }

                if (okToNext) {
                    next(action)
                }
            }
        }
    }
}

const tobeExported = {
    createSimpleWebSocketMiddleware,
    ActionTypes,
    connectWebSocketAction,
    closeWebSocketAction,
    sendDataToWebSocketAction
}

export default tobeExported

module.exports = tobeExported
