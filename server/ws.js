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

const checkUser = (userId) => {
  return !!sockets[userId]
}

const saveUser = (name, socket) => {
  sockets[name] = socket;
}

const getFriends = () => {
  return Object.keys(sockets).map(id => ({ id, name: id }))
}

const actions = {
  //登录
  login(socket, data) {
    const { name } = data
    if (checkUser(name)) {
      return sendMsg(socket, { action: 'login', success: false, message: `${name} exist!` })
    }

    saveUser(name, socket)
    sendMsg(socket, { action: 'login', success: true, message: `${name} login success`, user: { id: name } })

    broadcast({
      action: 'friends',
      message: `User: ${name} join!`,
      data: getFriends()
    })
  },

  //登出
  logout(socket) {
    console.log('logut')
    const [user] = Object.entries(sockets).find(item => item[1] === socket) || []

    if (user) {
      delete sockets[user]
      broadcast({
        action: 'friends',
        message: `User: ${user} leave!`,
        data: getFriends()
      })
    }
  },

  //呼叫
  callout(socket, data) {
    const { user, desc, creator } = data

    if (!checkUser(user.id)) {
      return sendMsg(socket, { action: 'callout', success: false, message: `Calling user: [${user.name}] does not exist!` })
    }

    sendMsg(sockets[user.id], {
      action: 'callout', success: true, desc, user: creator, message: `User: [${creator.name}] is calling you!`
    })
  },

  //回答
  answer(socket, data) {
    const { user, desc, creator } = data

    if (!checkUser(user.id)) {
      return sendMsg(socket, { action: 'answer', success: false, user, message: `Answering user: [${user.name}] does not exist` })
    }

    sendMsg(sockets[user.id], {
      action: 'answer', success: true, desc, user: creator, message: `User: [${creator.name}] answered`
    })
  },

  //挂断
  hangup(socket, data) {
    const { name, creator } = data

    if (!checkUser(name)) {
      return sendMsg(socket, { action: 'hangup', success: true, to, message: `Hanging Up user: ${name} not exist!` })
    }

    sendMsg(sockets[name], {
      action: 'hangup', success: true, desc, user: { id: creator }, message: `User: ${creator} is hanging up!`
    })
  },

  //交换candiate
  candidate(socket, data) {
    const { user, desc, creator } = data

    if (!checkUser(user.id)) {
      return sendMsg(socket, { action: 'candidate', success: false, user, message: `Candidate: [${user.name}] not exist` })
    }

    sendMsg(sockets[user.id], {
      action: 'candidate', success: true, desc, user: creator, message: `receive candidate from: [${creator.name}]`
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