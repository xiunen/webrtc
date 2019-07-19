import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import { connect } from 'react-redux';

import style from './style.less';

class Message extends PureComponent {
  static propTypes = {
    messages: PropTypes.arrayOf(PropTypes.object),
    currentUser: PropTypes.object
  }

  render() {
    const { messages, currentUser } = this.props;

    return (
      <div className={style.container}>
        <ul>
          {messages.map(item => (
            <li key={item.time + '-' + item.from.id}
              className={currentUser.id === item.from.id ? style.mine : ''}>
              <div>
                <span className={style.name}>{item.from.name}</span>
                <time>{(new Date(item.time)).toLocaleString()}</time>
              </div>
              <div className={style.msg}>
                {item.msg}
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
