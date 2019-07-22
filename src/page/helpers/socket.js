import { shareServer } from '../../constants/index'

class Socket {
  constructor() {
    this.data = []
  }

  init() {
    this.socket = new WebSocket(shareServer)
    this.bindListener()
  }

  setFrom(uid) {
    this.from = uid || `${Date.now()}${Math.random()}`
  }

  bindListener() {
    this.socket.onopen = () => {
      this.active = true
      this.data.forEach((item) => {
        this.send(item)
      })
      this.data = []
    }
  }

  send(data = {}) {
    if (!this.active) {
      this.data.push(data)
      return;
    }

    this.socket.send(JSON.stringify({
      to: this.to,
      from: this.from,
      ...data,
    }))
  }

  setTo(id) {
    this.to = id
  }

  setHandle(handle) {
    if (!handle) return;

    this.handle = handle
    this.socket.onmessage = (msg) => {
      const data = JSON.parse(msg.data)
      this.handle && this.handle(data)
    }
  }

  getUserId() {
    return this.userId
  }
}

export default new Socket()