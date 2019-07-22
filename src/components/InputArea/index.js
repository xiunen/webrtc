import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import { connect } from 'react-redux'

import style from './style.less';

class InputArea extends PureComponent {
  static propTypes = {
    connection: PropTypes.object
  }

  state = {
    value: ''
  }

  send = () => {
    const { value } = this.state
    if (!value) return;
    const { connection } = this.props;
    connection.rtc.sendText(value)
    this.setState({ value: '' })
  }

  handlePressEnter = (e) => {
    if (e.which === 13 || e.keyCode === 13) {
      this.send()
    }
  }

  changeInput = e => {
    this.setState({ value: e.target.value.trim() })
  }

  render() {
    const { value } = this.state;

    return (
      <div className={style.container} >
        <div>
          <textarea value={value} onChange={this.changeInput}
            resize='off' ref={c => { this.input = c }} autoFocus style={{ fontSize: 16 }}
            onKeyDown={this.handlePressEnter}
          />
        </div>
        <div className={style['action-container']}>
          <button onClick={this.send} className='primary'>Send</button>
        </div>
      </div>
    );
  }
}

export default connect(state => {
  const { selectedUser, connections } = state;
  return {
    connection: connections[selectedUser.id]
  }
})(cssModules(InputArea, style, { allowMultiple: true, handleNotFoundStyleName: 'ignore' }));
