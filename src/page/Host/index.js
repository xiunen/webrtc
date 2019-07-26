import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import socket from '../helpers/socket'
import { decorator } from '../helpers/rtc'

import style from './style.less';

class Host extends PureComponent {
  static propTypes = {
  }

  state = {
    roomId: '',
    active: false
  }

  connections = {}

  candidates = {}

  canAddCandidates = {}

  startLive = () => {
    if (!this.state.roomId) return;
    navigator.mediaDevices.getUserMedia({
      video: true,
      // audio: true
    }).then(stream => {
      socket.init();
      socket.setFrom(this.state.roomId)
      socket.setHandle(this.listen)
      socket.send({ action: 'startLive' })
      this.stream = stream
      this.setState({
        active: true
      }, () => {
        this.video.srcObject = this.stream
      })
    }).catch(e => {
      console.error(e)
    })
  }

  // sendStream=()=>{
  //   Object.keys(this.connections).map(key=>{
  //     this.connections[key].addStream(this.stream)
  //   })
  // }

  listen = (data) => {
    if (data.action === 'join') {
      const peer = new RTCPeerConnection()
      decorator(peer)
      this.connections[data.from] = peer;
      // peer.addTrack(this.stream);
      // this.stream.getTracks().forEach(track => {
      //   peer.addTrack(track, this.stream)
      // });
      peer.addStream(this.stream)
      peer.onicecandidate = e => {
        console.log('onicecandidate....')
        if (e.candidate) {
          socket.send({
            action: "scandidate",
            to: data.from,
            desc: e.candidate
          })
        }
      }

      // this.canAddCandidate = true
      this.canAddCandidates[data.from] = true
      peer.createOffer().then(offer => {
        peer.setLocalDescription(offer)
        socket.send({
          action: 'call',
          desc: offer,
          to: data.from
        })
      })
    } else if (data.action === 'answer') {
      const peer = this.connections[data.from];
      peer.setRemoteDescription(new RTCSessionDescription(data.desc))
    } else if (data.action === 'call') {
      const peer = new RTCPeerConnection()
      decorator(peer)
      this.connections[data.from] = peer;
      peer.addStream(this.stream)
      // peer.addTrack(this.stream);
      // this.stream.getTracks().forEach(track => {
      //   peer.addTrack(track, this.stream)
      // });
      peer.onicecandidate = e => {
        console.log('onicecandidate....')
        if (e.candidate) {
          socket.send({
            action: "candidate",
            to: data.from,
            desc: e.candidate
          })
        }
      }
      // const dataChannel = peer.createDataChannel('xxxx')
      peer.setRemoteDescription(new RTCSessionDescription(data.desc))
        .then(() => peer.createAnswer())
        .then(answer => {
          peer.setLocalDescription(answer)
          socket.send({ action: 'answer', to: data.from, desc: answer })
          this.canAddCandidates[data.from] = true
          if (this.candidates[data.from]) {
            this.candidates[data.from].foreach(item => {
              peer.addIceCandidate(new RTCIceCandidate(item))
            })
            delete this.candidates[data.from]
          }
        })
    } else if (data.action === 'candidate') {
      const peer = this.connections[data.from]
      if (peer) {
        if (this.canAddCandidates[data.from]) {
          peer.addIceCandidate(new RTCIceCandidate(data.desc))
        } else {
          if (!this.candidates[data.from]) {
            this.candidates[data.from] = []
          }
          this.candidates[data.from].push(data.desc)
        }
      }
    }
  }

  render() {
    const { roomId, active } = this.state
    const url = `${location.protocol}//${location.host}/audience.html?room=${roomId}`
    return (
      <div>{
        active ? (
          <div>
            <div>
              <video ref={c => { this.video = c }} autoPlay />
            </div>
            <div>
              {url}
              {/* <button onClick={this.sendStream}>推流</button> */}
            </div>
          </div>
        ) : <div>
            <input value={roomId} onChange={e => this.setState({ roomId: e.target.value })} />
            <button onClick={this.startLive}>Start Live</button>
          </div>
      }
      </div>
    );
  }
}

export default cssModules(Host, style, { allowMultiple: true, handleNotFoundStyleName: 'ignore' });
