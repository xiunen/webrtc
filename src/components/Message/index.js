import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import { connect } from 'react-redux'
import Panel from "../Panel";

import style from './style.less';

class Message extends PureComponent {
  static propTypes = {
    messages: PropTypes.arrayOf(PropTypes.object)
  }
  render() {
    const { messages } = this.props
    return (<div className={style.msgs} >
      <Panel title='Log'>
        <ul>
          {messages.map(item => (
            <li key={item.time}>
              <time>{(new Date(item.time)).toLocaleString()}</time>
              <div>{item.msg}</div>
            </li>
          ))}
        </ul>
      </Panel>
    </div >
    )
  }
}

export default connect(state => ({
  messages: state.messages
}))(cssModules(Message, style, { allowMultiple: true, handleNotFoundStyleName: 'ignore' }));
