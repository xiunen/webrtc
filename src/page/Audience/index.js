import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import socket from '../helpers/socket'
import { decorator } from '../helpers/rtc'

import style from './style.less';

class Audience extends PureComponent {

  static propTypes = {

  }

  candidates = []

  componentDidMount() {
    this.initialSocket()
    this.initPeerConection()
  }

  initialSocket() {
    const location = new URL(window.location)
    let room = location.searchParams.get('room')
    if (!room) {
      // room = window.prompt("请输入房间ID", "")
    }
    if (!room) {
      // window.alert('请刷新页面')
      return;
    }
    socket.init()
    socket.setFrom()
    socket.setTo(room)
    socket.send({ action: 'join' })
    socket.setHandle(this.listen)
  }

  initPeerConection() {
    this.peer = new RTCPeerConnection()
    // this.dataChannel = this.peer.createDataChannel('xxx')
    decorator(this.peer)

    // this.peer.createOffer().then(desc => {
    //   this.peer.setLocalDescription(desc)
    //   socket.send({ action: 'call', desc })
    // })

    this.peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.send({ action: 'acandidate', desc: e.candidate })
      }
    }

    this.peer.onaddstream = (e) => {
      console.log('onaddstream', e.stream)
      this.video.srcObject = e.stream
      this.video.play()
    }

    // this.peer.ontrack = (e) => {
    //   console.log('ontrack', e)
    // this.video.srcObject = e.streams[0]
    // }
  }

  listen = (data) => {
    if (data.action === 'call') {
      this.peer.setRemoteDescription(new RTCSessionDescription(data.desc))
        .then(() => this.peer.createAnswer())
        .then(answer => {
          this.peer.setLocalDescription(answer)
          socket.send({
            action: 'answer',
            desc: answer
          })
          this.canAddCandidate = true
          if (this.candidates) {
            this.candidates.forEach(item => {
              this.peer.addIceCandidate(new RTCIceCandidate(item))
            })
            this.candidates = []
          }
        })
    }

    if (data.action === 'answer') {
      this.canAddCandidate = true
      this.peer.setRemoteDescription(new RTCSessionDescription(data.desc))
    }

    if (data.action === 'candidate') {
      if (this.canAddCandidate) {
        this.peer.addIceCandidate(new RTCIceCandidate(data.desc))
      } else {
        this.candidates.push(data.desc)
      }
    }

    // console.log(this.peer)
  }

  render() {
    console.log('111')
    return (
      <div>
        <div>
          <video ref={c => { this.video = c }} autoPlay controls="controls"></video>
        </div>
      </div>
    );
  }
}

export default cssModules(Audience, style, { allowMultiple: true, handleNotFoundStyleName: 'ignore' });
