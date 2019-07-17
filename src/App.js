import React, { PureComponent } from 'react';
// import PropTypes from 'prop-types';
// import cssModules from 'react-css-modules';

// import style from './style.css';
const configuration = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302'
    },
    // {
    //   urls: 'stun:stun.stunprotocol.org:3478'
    // },
  ]
}

class App extends PureComponent {
  // static propTypes = {
  // }

  state = {
    fields: { name: '' },
    message: '',
    logined: false,
    users: [],
    callings: [],
    name: "",
    messages: [],
    connecting: null,
    connected: false
  }

  connection = new RTCPeerConnection()

  componentDidMount() {
    this.inter = setInterval(() => {
      this.getUserList();
      this.getCallingList();
      this.getAnswers();

      // console.log(this.dataChannel)
    }, 3000)

    this.createDataChannel()
    this.initEventListener()
  }

  componentWillUnmount() {
    clearInterval(this.inter)
    this.disconnectUser()
  }

  createDataChannel = () => {
    this.dataChannel = this.connection.createDataChannel('sendChannel')

    this.dataChannel.onopen = (...args) => {
      console.log('datachannel open', ...args)
    }

    this.dataChannel.onclose = (...args) => {
      console.log('datachannel close', ...args)
    }

    this.dataChannel.onerror = (...args) => {
      console.log('datachannel error', ...args)
    }

    this.dataChannel.onmessage = (...args) => {
      console.log('datachannel message', ...args)
    }
  }

  initEventListener = () => {
    const { inited } = this.state

    if (inited) return;

    console.log('listen')

    this.connection.onconnection = (...args) => {
      console.log('onconnection', ...args)
    }

    this.connection.onnegotiationneeded = (...args) => {
      console.log('onnegotiationneeded', ...args)
    }

    this.connection.ondatachannel = (e) => {
      console.log('ondatachannel', e)
      const recieveChannel = e.channel
      recieveChannel.onmessage = (...args) => {
        console.log('ondatachannel onmessage ', ...args)
      }
      recieveChannel.onopen = (...args) => {
        console.log('ondatachannel onopen ', ...args)
      }
      recieveChannel.onclose = (...args) => {
        console.log('ondatachannel onclose ', ...args)
      }
    }

    this.connection.onicecandidate = (e) => {
      if (!(this.connection.remoteDescription)) return;
      // console.log(this.connection)
      if (e.candidate) {
        this.connection.addIceCandidate(e.candidate)
      }
      console.log('onicecandidate', e)
    }

    this.setState({ inited: true })
  }


  openDataChannel = (e) => {
    if (e.type === 'open') {
      this.setState({ connected: true })
    }
    // console.log('open data channel', e)
  }
  closeDataChannel = (e) => {
    console.log('close data channel', e)
  }

  login = () => {
    const { fields: { name } } = this.state

    if (!name) {
      alert('Name Required')
      return;
    }

    fetch('/login', {
      method: 'POST',
      body: JSON.stringify({
        name,
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => res.json()).then(res => {
      this.setState({ logined: true, users: res, name })
    })
  }

  getUserList = () => {
    const { name } = this.state
    if (!name) return;
    fetch(`/user/${name}`).then(res => res.json()).then(res => {
      this.setState({ users: res })
    })
  }

  getCallingList = () => {
    const { name, connecting } = this.state
    if (!name || connecting) return;
    fetch(`/offer/${name}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => res.json()).then(res => {
      this.setState({ callings: res })
    })
  }

  getAnswers = () => {
    const { name, connecting } = this.state

    if (!name || connecting) return;

    fetch(`/answer/${name}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => res.json()).then(res => {
      if (res.length) {
        const conn = res[0]
        console.log('connecting answer', conn.answer)
        this.setState({ connecting: conn.from })
        this.connection.setRemoteDescription(new RTCSessionDescription(conn.answer))
      }
    })

  }

  sendMsg = () => {
    if (!this.connection) return;

    const { name, message } = this.state
    console.log(name, message)
    this.dataChannel.send(JSON.stringify({ name, message, timestamp: Date.now() }))
  }

  disconnectUser = () => {
    if (this.dataChannel) {
      this.dataChannel.close()
    }

    if (this.connection) {
      this.connection.close()
    }

    this.setState({
      connected: false,
      connecting: null
    })
  }

  connectUser = (user) => {
    if (!this.connection) return;
    if (!user) {
      alert('User offline')
      return;
    }

    const { connection } = this
    const { name } = this.state

    connection.createOffer().then(offer => {
      console.log('offer created', offer)
      connection.setLocalDescription(offer)
      return fetch('/offers', {
        method: 'POST',
        body: JSON.stringify({
          offer,
          from: name,
          to: user
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }).then(res => res.json()).catch(e => {
      console.error('connect error', e)
    })

  }

  answerUser = ({ from, offer }) => {
    const { connection } = this;
    const { name } = this.state

    console.log('answer offer', offer)

    connection.setRemoteDescription(new RTCSessionDescription(offer))
      .then(() => connection.createAnswer())
      .then(answer => {
        console.log('answer created', answer)
        connection.setLocalDescription(answer)

        this.setState({
          connecting: from
        })

        return fetch('/answers', {
          method: 'POST',
          body: JSON.stringify({
            from: name,
            to: from,
            answer
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        })
      }).then(res => res.json()).catch(e => {
        console.error('connect error', e)
      })
  }

  renderUserList() {
    const { users, callings, connecting } = this.state

    if (!users.length) return null;

    const callingUsers = callings.map(item => item.from)

    if (connecting) {
      callingUsers.push(connecting)
    }

    return (
      <div style={{ borderBottom: '1px solid #ccc' }}>
        <h3 style={{ padding: 5, margin: 0 }}>Friends</h3>
        <ul id='users'>
          {users.map(key => (
            <li key={key}>
              <span>{key}</span>
              {callingUsers.includes(key) ? null : <a onClick={() => this.connectUser(key)}>Call</a>}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  renderCallingList() {
    const { callings: items, connecting } = this.state
    const callings = items.filter(item => item.from !== connecting)
    if (!callings.length) return null;
    return (
      <div style={{ borderBottom: '1px solid #ccc' }}>
        <h3 style={{ padding: 5, margin: 0 }}>Callings</h3>
        <ul id='users'>
          {callings.map(user => (
            <li key={user.from}>
              <span>{user.from}</span>
              <a onClick={() => this.answerUser(user)}>Answer</a>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  renderConnecting() {
    const { connecting } = this.state
    if (!connecting) return null;
    return (
      <div style={{ borderBottom: '1px solid #ccc' }}>
        <h3 style={{ padding: 5, margin: 0 }}>Connecting</h3>
        <div style={{ borderTop: '1px solid #eee', padding: 10 }}>
          {connecting}
        </div>
      </div>
    )
  }

  renderMessageList() {
    return (
      <div style={{ height: 380, padding: 10 }}>
        hello
      </div>
    )
  }

  renderInput() {
    const { connected } = this.state
    return (
      <div style={{ height: 100, borderTop: '1px solid #ccc', display: 'flex' }}>
        <div style={{ width: 500 }}>
          <div style={{ width: '100%', borderBottom: '1px solid #ddd', padding: '5px 10px', background: '#eee' }}>Toolbar</div>
          <div>
            <textarea disabled={!connected}
              value={this.state.message}
              onChange={e => this.setState({ message: e.target.value })}
              style={{ width: '100%', height: '100%', border: 'none' }} rows={4} >
            </textarea>
          </div>
        </div>
        <div style={{ width: 100, height: 100, boderLeft: '1px solid #ccc' }}>
          <button disabled={!connected}
            onClick={this.sendMsg}
            style={{ display: 'block', width: '100%', height: '100%', background: '#ccc', border: 'none' }}
          >Send</button>
        </div>
      </div>
    )
  }

  renderLogin() {
    const style = {
      position: 'absolute', border: '1px solid #eee',
      width: 300, padding: 20, left: '50%', marginLeft: -100, top: 150,
      boxShadow: '2px 2px 5px #ccc',
      textAlign: 'center'
    }
    const { fields: { name } } = this.state
    return <div style={style}>
      <div>登录</div>
      <div>
        <input style={{ width: '100%', boxSizing: "border-box", fontSize: 16, padding: 5 }} type="text" value={name} onChange={e => this.setState({ fields: { name: e.target.value } })} />
      </div>
      <div>
        <button onClick={this.login}>登录</button>
      </div>
    </div>
  }

  render() {
    const { logined, connecting } = this.state

    if (!logined) return this.renderLogin()

    return (
      <div style={{
        display: 'flex',
        marginLeft: '50%', transform: "translateX(-50%)",
        background: '#fff',
        width: 800, height: 500, border: '1px solid #ccc'
      }}>
        <div style={{ width: 600 }}>
          {this.renderMessageList()}
          {this.renderInput()}
        </div>
        <div style={{ width: 200, borderLeft: '1px solid #ccc' }}>
          {this.renderUserList()}
          {this.renderCallingList()}
          {this.renderConnecting()}
        </div>
      </div>
    );
  }
}

export default App;
