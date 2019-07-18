const { SERVER } = process.env

if (SERVER === 'http') {
  require('./http')
} else {
  require('./ws')
}