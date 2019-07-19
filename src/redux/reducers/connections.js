import * as actionTypes from '../actionTypes'
import { RTC_STATUS } from '../../constants'

export default (state = {}, action) => {
  const { payload = {} } = action
  const { user, ...rest } = payload
  if (!user) return state;
  const userData = state[user.id] || {}

  switch (action.type) {
    case actionTypes.RTC_CALL:
      return {
        ...state,
        [user.id]: {
          ...userData,
          ...rest,
          status: RTC_STATUS.call,
        }
      }
    case actionTypes.RTC_ACCEPT:
      return {
        ...state,
        [user.id]: {
          ...userData,
          ...rest,
          status: RTC_STATUS.accept,
        }
      }
    case actionTypes.RTC_CONNECTING:
      return {
        ...state,
        [user.id]: {
          ...userData,
          ...rest,
          status: RTC_STATUS.connecting,
        }
      }
    case actionTypes.RTC_CONNECTED:
      return {
        ...state,
        [user.id]: {
          ...userData,
          ...rest,
          status: RTC_STATUS.connected,
        }
      }
    case actionTypes.RTC_RESET_CANDIDATE: {
      return {
        ...state,
        [user.id]: {
          ...userData,
          ...rest,
          candidates: [],
          status: RTC_STATUS.connected,
        }
      }
    }
    case actionTypes.RTC_CANDIDATE: {
      const { candidates = [] } = userData
      if (payload.candidate) {
        candidates.push(payload.candidate)
      }
      return {
        ...state,
        [user.id]: {
          ...userData,
          ...rest,
          candidates,
        }
      }
    }
    case actionTypes.RTC_DISCONNECTED:
      delete state[user.id]
      return { ...state }
  }
  return state;
}