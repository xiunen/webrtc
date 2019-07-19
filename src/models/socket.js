import { server } from '../constants'
import store from '../redux/store'
import * as actionTypes from '../redux/actionTypes'

class Socket {
  constructor() {
    this.instance = new WebSocket(server);
    this.bindListener();
    this.open = false
    this.data = []
  }

  log(msg) {
    if (!msg) return;
    store.dispatch({
      type: actionTypes.ADD_MESSAGE,
      payload: msg
    })
  }

  setHandle(handle) {
    if (handle) {
      this.handle = handle
    }
    this.instance.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data)

        if (data.message) {
          this.log(data.message)
        }

        this.handle && this.handle(data)
      } catch (e) {
        this.log(e.message)
      }
    }
  }

  setSender(name) {
    this.sender = name
  }

  send(data = {}) {
    if (!this.open) {
      this.data.push(data)
      return;
    }

    this.instance.send(JSON.stringify({
      ...data,
      creator: this.sender || {}
    }))
  }

  bindListener = () => {
    this.instance.onopen = () => {
      this.open = true
      this.log('Socket open!')
      this.data.forEach(item => {
        this.send(item)
      })
      this.data = []
    }

    this.instance.onclose = () => {
      this.log('Socket close!')
    }

    this.instance.onerror = (e) => {
      this.log('Socket error, err:' + e.message)
    }
  }

  login(name) {
    this.send({ name, action: 'login' })
  }

  logout() {
    this.send({ action: 'logout' })
  }

  callout(user, desc) {
    this.send({ action: 'callout', user, desc })
    this.log(`calling user: [${user.name}]`)
  }

  answer(user, desc) {
    this.send({ action: 'answer', user, desc })
    this.log(`answering user: [${user.name}]`)
  }

  candidate(user, desc) {
    this.send({ action: 'candidate', user, desc })
    this.log(`sending candidate to: [${user.name}]`)
  }
}

const socket = new Socket;

export default socket