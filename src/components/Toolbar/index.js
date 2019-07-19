import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';

import style from './style.less';

class Toolbar extends PureComponent {
  static propTypes = {
  }
  render() {
    return (
      <div className={style.container}>Toolbar
      </div>
    );
  }
}

export default cssModules(Toolbar, style, { allowMultiple: true, handleNotFoundStyleName: 'ignore' });
