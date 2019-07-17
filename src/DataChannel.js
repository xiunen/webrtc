import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';

import style from './style.css';
/**
 * 同一个页面不同模块之间的信息交流
 */
class Simple extends PureComponent {

  state = {
    disabledConnectButton: false,
    disabledDisconnectButton: true,
    disabledMessageInput: true,
    disabledSendButton: true,
    value: '',
    msgs: []
  }

  componentDidMount() {
    const servers = {
      iceServers: [
        {
          urls: 'stun:stun.stunprotocol.org:3478'
        }, {
          urls: 'stun:stun.l.google.com:19302'
        }
      ]
    }
    const optionalRtpDataChannels = {
      optional: [{
        RtpDataChannels: true
      }]
    };
    const localConnection = new RTCPeerConnection(servers);
    this.localConnection = localConnection

    localConnection.ondatachannel = e => {
      event.channel.onmessage = (event) => {
        console.log('local', event.data)
      }
    }

    const sendChannel = localConnection.createDataChannel("sendChannel");
    this.sendChannel = sendChannel

    sendChannel.onopen = this.handleSendChannelStatusChange;
    sendChannel.onclose = this.handleSendChannelStatusChange;


    const remoteConnection = new RTCPeerConnection(servers);
    this.remoteConnection = remoteConnection
    remoteConnection.ondatachannel = this.receiveChannelCallback;

    localConnection.onicecandidate = e => {
      console.log('local candidate', e)
      if (!e || !e.candidate) return;
      remoteConnection.addIceCandidate(e.candidate)
        .catch(this.handleAddCandidateError);
    }

    remoteConnection.onicecandidate = e => {
      console.log('remote candidate', e)
      if (!e || !e.candidate) return;
      localConnection.addIceCandidate(e.candidate)
        .catch(this.handleAddCandidateError);
    }
  }

  connectPeers = () => {
    const { localConnection, remoteConnection } = this
    localConnection.createOffer()
      .then(offer => { console.log(offer), localConnection.setLocalDescription(offer) })
      .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
      .then(() => remoteConnection.createAnswer())
      .then(answer => remoteConnection.setLocalDescription(answer))
      .then(() => localConnection.setRemoteDescription(remoteConnection.localDescription))
      .catch(this.handleCreateDescriptionError);
  }

  disconnectPeers = () => {
    const { sendChannel, receiveChannel, localConnection, remoteConnection } = this
    // Close the RTCDataChannels if they're open.

    sendChannel.close();
    receiveChannel.close();

    // Close the RTCPeerConnections

    localConnection.close();
    remoteConnection.close();

    this.sendChannel = null;
    this.receiveChannel = null;
    this.localConnection = null;
    this.remoteConnection = null;

    this.setState({
      disabledConnectButton: false,
      disabledDisconnectButton: true,
      disabledMessageInput: true,
      disabledSendButton: true,
      value: ''
    })
  }

  receiveChannelCallback = (event) => {
    console.log('remote', event)
    const receiveChannel = event.channel;
    this.receiveChannel = receiveChannel
    receiveChannel.onmessage = this.handleReceiveMessage;
    receiveChannel.onopen = this.handleReceiveChannelStatusChange;
    receiveChannel.onclose = this.handleReceiveChannelStatusChange;
  }

  handleSendChannelStatusChange = (event) => {
    const { sendChannel } = this
    if (sendChannel) {
      const state = sendChannel.readyState;

      if (state === "open") {
        this.setState({
          disabledMessageInput: false,
          disabledDisconnectButton: false,
          disabledConnectButton: true,
          disabledSendButton: false
        })
      } else {
        this.setState({
          disabledMessageInput: true,
          disabledDisconnectButton: true,
          disabledConnectButton: false,
          disabledSendButton: true
        })
      }
    }
  }

  handleLocalAddCandidateSuccess() {
    this.setState({ disabledConnectButton: true })
  }

  handleRemoteAddCandidateSuccess() {
    this.setState({ disabledDisconnectButton: true })
  }

  handleReceiveChannelStatusChange = (event) => {
    const { receiveChannel } = this
    if (receiveChannel) {
      console.log("Receive channel's status has changed to " +
        receiveChannel.readyState);
    }
  }

  sendMessage = () => {
    const { sendChannel } = this
    const { value } = this.state
    sendChannel.send(value);
    this.setState({ value: '' })
  }

  handleReceiveMessage = (event) => {
    const { msgs = [] } = this.state
    this.setState({
      msgs: [
        ...msgs,
        event.data
      ]
    })
  }

  render() {
    const { disabledConnectButton,
      disabledDisconnectButton,
      disabledSendButton,
      disabledMessageInput,
      value,
      msgs
    } = this.state
    return (
      <div>
        <div>
          <button
            id="connectButton" name="connectButton" className="buttonleft"
            onClick={this.connectPeers} disabled={disabledConnectButton}
          >
            Connect
          </button>
          <button id="disconnectButton" name="disconnectButton"
            onClick={this.disconnectPeers}
            className="buttonright" disabled={disabledDisconnectButton}>
            Disconnect
          </button>
        </div>
        <div className="messagebox">
          <label htmlFor="message">
            Enter a message:
            <input type="text" name="message" id="message"
              placeholder="Message text" size={60}
              disabled={disabledMessageInput}
              value={value}
              onChange={e => this.setState({ value: e.target.value })}
            />
          </label>
          <button id="sendButton" name="sendButton"
            onClick={this.sendMessage}
            className="buttonright" disabled={disabledSendButton}>
            Send
          </button>
        </div>
        <div className="messagebox" id="receivebox">
          <p>Messages received:</p>
          {msgs.map(item => (<p key={item}>{item}</p>))}
        </div>
      </div>
    );
  }
}

export default cssModules(Simple, style, { allowMultiple: true, handleNotFoundStyleName: 'ignore' });
