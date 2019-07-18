import { server } from '../constants'

class Socket {
  constructor() {
    this.instance = new WebSocket(server);
  }

  setHandle(handle) {
    this.handle = handle
    this.bindListener();
  }

  setMsgHandle(handle) {
    if (handle) {
      this.msgHandle = handle
    }
    if (this.listening) return;
    this.listening = true
    this.instance.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data)

        if (data.message) {
          this.handle(data.message)
        }

        this.msgHandle(data)
      } catch (e) {
        this.handle(e.message)
      }
    }
  }

  setSender(name) {
    this.sender = name
  }

  send(data = {}) {
    this.instance.send(JSON.stringify({
      ...data,
      creator: this.sender || ''
    }))
  }

  bindListener = () => {
    if (this.handle) {
      this.instance.ononpen = () => {
        this.handle('Socket open!')
      }

      this.instance.onclose = () => {
        this.handle('Socket close!')
      }

      this.instance.onerror = (e) => {
        this.handle('Socket error, err:' + e.message)
      }
    }
  }

  login(name) {
    this.send({ name, action: 'login' })
  }

  logout() {
    this.send({ action: 'logout' })
  }


}

const socket = new Socket;

export default socket