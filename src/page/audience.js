import React from 'react'
import ReactDOM from 'react-dom'

import App from './Audience/index'

const init = () => {
  const container = document.querySelector('#app');
  ReactDOM.hydrate(
    <App />,
    container
  )
}

init()