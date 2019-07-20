import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';

import style from './style.less';

class Panel extends PureComponent {
  static propTypes = {
    title: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node,
    maxHeight: PropTypes.bool,
  }

  state = {
    open: false,
    maxHeight: null
  }

  componentDidMount() {
    const { maxHeight, title } = this.props
    if (maxHeight) {
      this.setState({
        maxHeight: document.body.getBoundingClientRect().height - (title ? 50 : 10)
      })
    }

  }

  render() {
    const { title, children, className = '' } = this.props
    const classNames = `${style.container} ${className}`
    const { open, maxHeight } = this.state
    const bodyStyle = {}

    if (maxHeight) {
      bodyStyle.maxHeight = maxHeight
      bodyStyle.overflow = 'auto'
    }

    return (
      <section className={classNames}>
        {title ? <header className={style.header}>
          <span>{title}</span>
          {open ? <button onClick={() => this.setState({ open: false })}>&times;</button> :
            (<button onClick={() => this.setState({ open: true })}>+</button>)}
        </header> : null}
        {open ? <div className={style.content} style={bodyStyle}>{children}</div> : null}
      </section>
    );
  }
}

export default cssModules(Panel, style, { allowMultiple: true, handleNotFoundStyleName: 'ignore' });
