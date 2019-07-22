export const wsPort = 12580
export const wsStreamerPort = 12581
export const host = '10.12.73.178'
// export const host = 'localhost'
export const server = `ws://${location.hostname}:${wsPort}`
export const shareServer = `ws://${location.hostname}:${wsStreamerPort}`

export const RTC_STATUS = {
  call: 'call',
  accept: 'accept',
  connecting: 'connecting',
  connected: 'connected'
}