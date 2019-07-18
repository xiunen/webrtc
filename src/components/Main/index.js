import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import Sidebar from '../Sidebar'
import style from './style.less';

class Main extends PureComponent {
  static propTypes = {
    currentUser: PropTypes.string,
    friends: PropTypes.arrayOf(PropTypes.string)
  }

  state = {
    selectedUser: null,
    connecting: null,
  }


  render() {
    const { currentUser, friends = [] } = this.props;
    const { selectedUser } = this.state

    return (
      <div className={style.container}>
        <Sidebar currentUser={currentUser} friends={friends} />
        <div>

        </div>
      </div>
    );
  }
}

export default cssModules(Main, style, { allowMultiple: true, handleNotFoundStyleName: 'ignore' });
