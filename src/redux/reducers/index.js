import {
  combineReducers
} from 'redux'

import * as actionTypes from '../actionTypes'
import connections from './connections'


export default (extraReducers = {}) => combineReducers({
  currentUser: (state = null, action) => {
    if (action.type === actionTypes.LOGIN) return action.payload;
    if (action.type === actionTypes.LOGOUT) return null;
    return state;
  },

  selectedUser: (state = null, action) => {
    if (action.type === actionTypes.SELECT_USER) return action.payload;
    return state
  },
  connections,
  logs: (state = [], action) => {
    if (action.type === actionTypes.ADD_MESSAGE) {
      return [
        ...state,
        {
          time: Date.now(),
          msg: action.payload
        }
      ]
    }
    return state
  },
  friends: (state = [], action) => {
    if (action.type === actionTypes.SET_FRIENDS) return action.payload;
    return state
  },
  messages: (state = {}, action) => {
    if (action.type === actionTypes.USER_MSG) {
      const { user, msg, from } = action.payload
      const msgs = state[user.id] || []
      return {
        ...state,
        [user.id]: [
          ...msgs,
          {
            from, msg, time: Date.now()
          }
        ]
      }
    }
    return state;
  }

})