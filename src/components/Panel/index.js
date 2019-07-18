import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';

import style from './style.less';

class Panel extends PureComponent {
  static propTypes = {
    title: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node,
  }

  state = {
    open: true
  }

  render() {
    const { title, children, className = '' } = this.props
    const classNames = `${style.container} ${className}`
    const { open } = this.state

    return (
      <section className={classNames}>
        {title ? <header className={style.header}>
          <span>{title}</span>
          {open ? <button onClick={() => this.setState({ open: false })}>&times;</button> :
            (<button onClick={() => this.setState({ open: true })}>+</button>)}
        </header> : null}
        {open ? <div className={style.content}>{children}</div> : null}
      </section>
    );
  }
}

export default cssModules(Panel, style, { allowMultiple: true, handleNotFoundStyleName: 'ignore' });
