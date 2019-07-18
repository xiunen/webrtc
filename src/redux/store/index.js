/* global window */
/* eslint global-require: "off" */
import {
  applyMiddleware,
  createStore,
  compose
} from 'redux'
import rootReducer from '../reducers'

import customMiddlewares from './middlewares'

/* eslint no-underscore-dangle: "off" */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const configureStore = (initialState = {}) => {
  const middlewares = [...customMiddlewares(),]
  const store = createStore(
    rootReducer(),
    initialState,
    composeEnhancers(
      applyMiddleware(...middlewares)
    )
  )

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers').default
      store.replaceReducer(nextRootReducer)
    })
  }

  return store
}

export default configureStore()
