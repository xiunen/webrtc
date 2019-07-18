import {
  combineReducers
} from 'redux'

import * as actionTypes from '../actionTypes'
import { RTC_STATUS } from '../../constants'


export default (extraReducers = {}) => combineReducers({
  name: (state = '', action) => {
    if (action.type === actionTypes.LOGIN) return action.payload;
    if (action.type === actionTypes.LOGOUT) return null;
    return state;
  },

  selectedUser: (state = null, action) => {
    if (action.type === actionTypes.SELECT_USER) return action.payload;
    return state
  },

  connection: (state = {}, action) => {
    switch (action.type) {
      case actionTypes.RTC_CALL:
        return {
          ...action.payload,
          status: RTC_STATUS.call,
        }
      case actionTypes.RTC_ACCEPT:
        return {
          ...action.payload,
          status: RTC_STATUS.accept,
        }
      case actionTypes.RTC_CONNECTING:
        return {
          ...action.payload,
          status: RTC_STATUS.connecting,
        }
      case actionTypes.RTC_CONNECTED:
        return {
          ...action.payload,
          status: RTC_STATUS.connected,
        }
      case actionTypes.RTC_DISCONNECTED:
        return {}
    }
    return state;
  },

  messages: (state = [], action) => {
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
  friends: (state = [1, 2, 3, 4, 5, 6, 67, 7, 8, 9,], action) => {
    if (action.type === actionTypes.SET_FRIENDS) return action.payload;
    return state
  },
  // calling: () => { }
})