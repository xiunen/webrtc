import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import store from './redux/store'

import App from './App'

const init = () => {
  const container = document.querySelector('#app')
  ReactDOM.hydrate(
    <Provider store={store}>
      <App />
    </Provider>, container)
}

init()