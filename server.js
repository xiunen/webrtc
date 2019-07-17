// const { server: WebSocketServer } = require('websocket')
const express = require('express')
const Bundler = require('parcel-bundler');
const bodyParser = require('body-parser');
const port = 12580

const app = express();
app.use(bodyParser());

const data = {
  users: [],
  offers: [],
  answers: [],
  candidates: []
}

const bundler = new Bundler('index.html')

app.post('/login', (req, res) => {
  const { name } = req.body;
  const { users, offers, answers, candidates } = data

  if (name && !users.includes(name)) {
    users.push(name)
  }

  data.offers = offers.filter(item => (item.from !== name && item.to !== name))
  data.answers = answers.filter(item => (item.from !== name && item.to !== name))
  data.candidates = candidates.filter(item => (item.from !== name && item.to !== name))

  return res.json(users.filter(u => u !== name))
})

app.get('/user/:name', (req, res) => {
  const { name } = req.params;
  return res.json(data.users.filter(u => u !== name))
})

app.post('/offers', (req, res) => {
  const { from, to, offer } = req.body
  const { offers } = data
  const exist = offers.find(item => item.from == from && item.to === to)

  if (exist) {
    exist.offer = offer
  } else {
    offers.push({ from, to, offer })
  }

  return res.json(offers.filter(item => item.to === from))
});
app.get('/offer/:name', (req, res) => {
  const { name } = req.params
  return res.json(data.offers.filter(item => item.to === name))
})

app.post('/answers', (req, res) => {
  const { from, to, answer } = req.body
  const { answers } = data
  const exist = answers.find(item => item.from == from && item.to === to)

  if (exist) {
    exist.answer = answer
  } else {
    answers.push({ from, to, answer })
  }
  return res.json(answers.filter(item => item.to === from))
});

app.get('/answer/:name', (req, res) => {
  const { name } = req.params
  return res.json(data.answers.filter(item => item.to === name))
})

app.post('/candidates', (req, res) => {
  const { from, to, candidate } = req.body
  const { candidates } = data
  const exist = candidates.find(item => item.from == from && item.to === to)

  if (exist) {
    exist.candidate = candidate
  } else {
    candidates.push({ from, to, candidate })
  }
  return res.json(candidates.filter(item => item.to === from))
});

app.get('/candidate/:name', (req, res) => {
  const { name } = req.params
  const candidates = data.candidates.filter(item => item.to === name)
  data.candidates = data.candidates.filter(item => item.to !== name)
  return res.json(candidates)
})


app.use(bundler.middleware())
// const httpServer = http.createServer((req, res) => {

// })

app.listen(port)
/*
wsServer = new WebSocketServer({
  httpServer,
  autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}
wsServer.on('request', function (request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    return;
  }

  var connection = request.accept('echo-protocol', request.origin);
  console.log((new Date()) + ' Connection accepted.');
  connection.on('message', function (message) {
    if (message.type === 'utf8') {
      console.log('Received Message: ' + message.utf8Data);
      connection.sendUTF(message.utf8Data);
    }
    else if (message.type === 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
      connection.sendBytes(message.binaryData);
    }
  });
  connection.on('close', function (reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});*/