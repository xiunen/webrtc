import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import { connect } from 'react-redux';

import Video from '../Video'

import style from './style.less';

class Message extends PureComponent {
  static propTypes = {
    messages: PropTypes.arrayOf(PropTypes.object),
    currentUser: PropTypes.object
  }

  renderContent(item) {
    const { currentUser } = this.props

    if (item.type === 'file') {
      const blob = new Blob([item.data])
      const url = URL.createObjectURL(blob)
      if (item.from.id === currentUser.id) return `[FILE]: ${item.msg.name}`
      return (
        <div>
          <div>[FILE]: {item.msg.name}</div>
          <div>
            <a href={url} download={item.msg.name}>Download</a>
          </div>
        </div>
      );
    }

    if (item.type === 'image') {
      return (
        <img src={item.msg} className={style.img} />
      )
    }



    return item.msg
  }

  componentDidUpdate() {
    if (this.wrapper) {
      this.wrapper.scrollTo(0, this.wrapper.scrollTop)
    }
  }

  render() {
    const { messages, currentUser } = this.props;

    return (
      <div className={style.container} ref={c => { this.wrapper = c }}>
        <ul>
          {messages.map(item => (
            <li key={item.time + '-' + item.from.id}
              className={currentUser.id === item.from.id ? style.mine : ''}>
              <div>
                <span className={style.name}>{item.from.name}</span>
                <time>{(new Date(item.time)).toLocaleString()}</time>
              </div>
              <div className={style.msg}>
                {this.renderContent(item)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default connect(state => {
  const { currentUser, selectedUser, messages } = state

  return {
    currentUser,
    messages: messages[selectedUser.id] || []
  }
})(cssModules(Message, style, { allowMultiple: true, handleNotFoundStyleName: 'ignore' }));
