const { Server: WebSocket } = require('ws')

const server = new WebSocket({
  port: 12580,
})

const sockets = {}

const broadcast = (msg) => {
  Object.keys(sockets).forEach(key => {
    sendMsg(sockets[key], msg)
  })
}

const sendMsg = (socket, msg) => {
  const result = (typeof msg === 'object') ? JSON.stringify({ ...msg, time: Date.now() }) : msg
  socket.send(result)
}

const checkUser = (user) => {
  return !!sockets[user]
}

const saveUser = (name, socket) => {
  sockets[name] = socket;
}

const actions = {
  //登录
  login(socket, data) {
    const { name } = data
    if (checkUser(name)) {
      return sendMsg(socket, { action: 'login', success: false, message: `${name} exist!` })
    }

    saveUser(name, socket)
    sendMsg(socket, { action: 'login', success: true, message: `${name} login success`, name })

    broadcast({
      action: 'friends',
      message: `${name} join!`,
      data: Object.keys(sockets)
    })
  },

  //登出
  logout(socket) {
    console.log('logut')
    const [user] = Object.entries(sockets).find(item => item[1] === socket) || {}

    broadcast({
      action: 'friends',
      message: `${user} leave!`,
      data: Object.keys(sockets)
    })

    if (user) {
      delete sockets[user]
    }
  },

  //呼叫
  call(socket, data) {
    const { name, desc, creator } = data

    if (!checkUser(name)) {
      return sendMsg(socket, { action: 'call', success: false, to, message: `Calling user: ${name} does not exist!` })
    }

    sendMsg(sockets[name], {
      action: 'call', success: true, desc, name: creator, message: `User: ${creator} is calling you!`
    })
  },

  //回答
  answer(socket, data) {
    const { name, desc, creator } = data

    if (!checkUser(name)) {
      return sendMsg(socket, { action: 'answer', success: false, to, message: `Answering user: ${name} does not exist` })
    }

    sendMsg(sockets[name], {
      action: 'answer', success: true, desc, name: creator, message: `User: ${creator} answered`
    })
  },

  //挂断
  hangup(socket, data) {
    const { name, creator } = data

    if (!checkUser(name)) {
      return sendMsg(socket, { action: 'hangup', success: true, to, message: `Hanging Up user: ${name} not exist!` })
    }

    sendMsg(sockets[name], {
      action: 'hangup', success: true, desc, message: `User: ${creator} is hanging up!`
    })
  },

  //交换candiate
  candidate(socket, data) {
    const { name, desc, creator } = data

    if (!checkUser(name)) {
      return sendMsg(socket, { action: 'candidate', success: false, to, message: `Candidate: ${name} not exist` })
    }

    sendMsg(sockets[name], {
      action: 'candidate', success: true, desc, message: `receive candidate from: ${creator}`
    })
  }

}

server.on('connection', (socket) => {
  console.log('connect')
  socket.on('open', () => {
    console.log('ws open')
  })

  socket.on('message', (msg) => {
    console.log('message input sockets size:', Object.keys(sockets).length, typeof msg)
    try {
      const req = JSON.parse(msg)
      const { action, ...rest } = req
      actions[action] && actions[action](socket, { ...rest })
    } catch (e) {
      console.error(e)
    }
  })

  socket.on('close', () => {
    actions.logout(socket)
  })
})