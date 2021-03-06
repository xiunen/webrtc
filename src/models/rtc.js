import socket from './socket'
import store from '../redux/store'
import * as actionTypes from '../redux/actionTypes'
import { send } from 'q';

export default class RTC {

  createConnection(user) {
    if (!this.connection) {
      this.connection = new RTCPeerConnection();
      this.bindListener()
      this.dataChannel = this.connection.createDataChannel(`channel-${user.id}`)
      this.bindDataChannelListener()
      this.bindStreamListener()
      this.user = user
    }
  }

  log(msg, ...rest) {
    if (!msg) return;
    store.dispatch({
      type: actionTypes.ADD_MESSAGE,
      payload: `[${(this.user || {}).name || '-'}] ${msg}`
    })

    console.log(msg, ...rest)
  }

  bindListener = () => {
    this.connection.onconnection = (e) => {
      this.log('rtc onconnection', e)
    }

    this.connection.onicecandidate = (e) => {
      this.log('rtc onicecandidate', e)
      if (e.candidate) {
        socket.candidate(this.user, e.candidate)
      }
    }

    this.connection.onconnectionstatechange = e => {
      this.log("Connection state change: " + this.connection.connectionState, e)
      if (this.connection.connectionState === 'connected') {
        store.dispatch({
          type: actionTypes.RTC_CONNECTED,
          payload: { user: this.user }
        })
      }else if (this.connection.connectionState === 'disconnected') {
        store.dispatch({
          type: actionTypes.RTC_DISCONNECTED,
          payload:{user:this.user}
        })
      }
    };
    this.connection.onnegotiationneeded = e => {
      this.log("Negotiation needed: ", e);
    };
    this.connection.onicecandidateerror = e => {
      this.log("ICE candidate error: " + e.message);
    }
    this.connection.oniceconnectionstatechange = e => {
      this.log("ICE connection state change: " + this.connection.iceConnectionState, e);
    }
    this.connection.onicegatheringstatechange = e => {
      this.log("ICE gathering state change: " + this.connection.iceGatheringState, e);
    }
    this.connection.onsignalingstatechange = e => {
      this.log("Signaling state change: " + this.connection.signalingState, e);
    }
  }

  bindDataChannelListener() {
    this.dataChannel.onopen = (...args) => {
      this.log('datachannel open', ...args)
    }

    this.dataChannel.onclose = (...args) => {
      this.log('datachannel close', ...args)
    }

    this.dataChannel.onerror = (...args) => {
      this.log('datachannel error', ...args)
    }

    this.dataChannel.onmessage = (...args) => {
      this.log('datachannel message', ...args)
    }

    const self = this

    this.connection.ondatachannel = (e) => {
      this.log('create datachannel', e)
      const recieveChannel = e.channel
      recieveChannel.onmessage = (e) => {
        let result = {};
        if(typeof e.data === 'string'){
          try{
            result = JSON.parse(e.data)
          }catch(e){

          }
        }else{
          //可以处理文件分片
          result = {
            ...this.fileInfo,
            data:e.data,
            done: true
          }
        }

        if(result.type === 'file' && !result.done){
          this.fileInfo = result
        }else{
          store.dispatch({
            type: actionTypes.USER_MSG,
            payload: {
              from: this.user,
              user: this.user,
              ...result,
            }
          })
        }
      }
      recieveChannel.onopen = (...args) => {
        this.log('datachannel onopen ', ...args)
      }
      recieveChannel.onclose = (...args) => {
        this.log('datachannel onclose ', ...args)
      }
      recieveChannel.onerror = (e) => {
        this.log('datachannel onclose ' + e.message)
      }
    }
  }

  bindStreamListener(){
    this.connection.onaddstream = (obj)=>{
      console.log('onaddstream',obj)

      store.dispatch({
        type: actionTypes.ADD_REMOTE_VIDEO,
        payload: obj.stream
      })
    }
  }

  callout(user) {
    this.createConnection(user)
    this.connection.createOffer().then(offer => {
      this.connection.setLocalDescription(offer)

      socket.callout(user, offer)

      store.dispatch({
        type: actionTypes.RTC_CONNECTING,
        payload: { user, rtc: this }
      })
    })
  }

  answer(user) {
    const { connections } = store.getState()
    const connection = connections[user.id]
    if (!connection) return;

    this.createConnection(user)
    this.connection.setRemoteDescription(new RTCSessionDescription(connection.desc))
      .then(() => this.connection.createAnswer())
      .then(answer => {
        this.connection.setLocalDescription(answer)

        socket.answer(user, answer);

        (this.connection.candidates || []).forEach(this.addCandidate);

        store.dispatch({
          type: actionTypes.RTC_RESET_CANDIDATE,
          payload: { user }
        })

        store.dispatch({
          type: actionTypes.RTC_CONNECTING,
          payload: { user, rtc: this, desc: null }
        })

      })
  }

  accept(desc) {
    if (this.connection) {
      this.connection.setRemoteDescription(new RTCSessionDescription(desc))
      this.log('accept answer user: ' + this.user.name)
    }
  }

  addCandidate(candidate) {
    this.connection.addIceCandidate(new RTCIceCandidate(candidate))
    this.log(`add candidate from user: ${this.user.name}`)
  }

  send(obj={}) {
    const { currentUser } = store.getState()
    store.dispatch({
      type: actionTypes.USER_MSG,
      payload: {
        ...obj,
        user: this.user,
        from: currentUser
      }
    })
  }

  sendText(msg) {
    this.dataChannel.send(JSON.stringify({type:'text',msg}))
    this.send({type:'text',msg})
  }

  sendFile(file){
    this.send({type:'file', msg: file})
    const fileReader = new FileReader()
    //大文件分片传输
    this.dataChannel.send(JSON.stringify({
      type:'file',
      msg:{
        name: file.name, 
        size: file.size,
      }
    }))

    fileReader.onload = ()=>{
      // const blob = new Blob([fileReader.result])
      this.dataChannel.send(fileReader.result)
    }
    fileReader.readAsArrayBuffer(file)
  }
  sendImage(file){
    const fileReader = new FileReader()
    fileReader.onload = ()=>{
      const data = {
        type:'image',
        msg:fileReader.result
      }
      this.dataChannel.send(JSON.stringify(data))
    this.send(data)
  }
    fileReader.readAsDataURL(file)
  }

  callVideo(stream){
    console.log('callvideo')
    this.dataChannel.send({type:'video',msg:'call'})
    this.connection.addStream(stream);

    store.dispatch({
      type: actionTypes.ADD_LOCAL_VIDEO,
      payload: stream
    })
  }
}