import React from "react"
import {connect} from "react-redux"

import {changeServerEndpoint} from "../actions"
import {connectWebSocketAction, closeWebSocketAction, sendDataToWebSocketAction} from "../../main"

class Application extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            message: ""
        }
    }

    render() {
        return (
            <div>
                <input type="text" value={this.props.endpoint} disabled={this.props.connected} placeholder="endpoint" onChange={(e) => {
                    changeEndpoint(e.target.value)
                }}/>
                <button onClick={(e) => {
                    (this.props.connected
                        ? this.props.disconnect
                        : this.props.connect)(this.props.endpoint)
                }}>{this.props.connected
                        ? "Disconnect"
                        : "Connect"}</button>
                <br/>
                <textarea disabled={true} value={this.props.log.join("\n")} disabled={!this.props.connected} style={{
                    width: "400px",
                    height: "300px"
                }}/>
                <br/>
                <input value={this.state.message} type="text" placeholder="Message to send" onChange={(e) => {
                    this.setState({message: e.target.value})
                }}/>
                <button onClick={(e) => {
                    this.props.send(this.props.endpoint, {
                        command: "chat",
                        message: this.state.message
                    });
                    this.setState({message: ""})
                }}>Send</button>
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => ({connected: state.connection.connected, endpoint: state.connection.endpoint, log: state.connection.log})

const mapDispatchToProps = (dispatch, ownProps) => ({
    changeEndpoint: (endpoint) => {
        dispatch(changeServerEndpoint(endpoint))
    },
    connect: (endpoint) => {
        dispatch(connectWebSocketAction(endpoint))
    },
    disconnect: (endpoint) => {
        dispatch(closeWebSocketAction(endpoint))
    },
    send: (endpoint, message) => {
        dispatch(sendDataToWebSocketAction(endpoint, message))
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(Application)
