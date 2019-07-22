const { Server: WebSocket } = require('ws')

const server = new WebSocket({
  port: 12581,
})

// const streamers = {

// }
// const audiences = {

// }

const rooms = {
  //"streamerId":["audienceId"]
}

const sockets = {}
const send = (socket, obj) => {
  socket.send(JSON.stringify(obj))
}
const checkRoom = (socket, data, action) => {
  // if (!rooms[data.to] || !sockets[data.to]) {
  if (!sockets[data.to]) {
    send(socket, { action, success: false, message: "Room not exist" })
    return false
  }

  return true;
}

const checkAudience = (socket, data, action) => {
  if (!sockets[data.to]) {
    send(socket, { action, success: false, message: "User not exist" })
    return false
  }

  return true;
}

const actions = {
  answer(socket, data) {
    if (!checkRoom(socket, data, 'answer')) return;
    send(sockets[data.to], { action: 'answer', from: data.from, desc: data.desc, success: true })
  },
  call(socket, data) {
    if (!checkAudience(socket, data, 'call')) return;
    send(sockets[data.to], {
      action: "call",
      desc: data.desc,
      success: true,
      from: data.from
    })
  },
  //audience candidate
  acandidate(socket, data) {
    if (!checkRoom(socket, data, 'scandidate')) return;
    send(sockets[data.to], { action: 'candidate', from: data.from, desc: data.desc, success: true })
  },
  //streamer candidate
  candidate(socket, data) {
    if (!checkAudience(socket, data, 'candidate')) return;
    send(sockets[data.to], { action: 'candidate', from: data.from, desc: data.desc, success: true })
  },

  join(socket, data) {
    if (!checkRoom(socket, data, 'join')) return;
    send(sockets[data.to], { action: 'join', from: data.from, success: true })
  },
  startLive(socket, data) {
    // rooms[data.from] = []
  },
  logout() {
    console.log('logout')
  }
}

server.on('connection', (socket) => {
  console.log('connect')
  socket.on('open', () => {
    console.log('ws open')
  })

  socket.on('message', (msg) => {
    // console.log('message input sockets size:', Object.keys(sockets).length, typeof msg)
    try {
      const req = JSON.parse(msg)
      const { action, ...rest } = req
      console.log(req.from)
      if (req.from) {
        sockets[req.from] = socket;
      }
      actions[action] && actions[action](socket, { ...rest })
    } catch (e) {
      console.error(e)
    }
  })

  socket.on('close', () => {
    actions.logout(socket)
  })
})

server.on('error', (e) => {
  console.log(e)
})
