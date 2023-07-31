const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const { SerialPort } = require('serialport')
const app = express()
const port = 5000

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', '*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
})

const comport = new SerialPort({
  path: 'COM9',
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none'
})

io.on('connection', (socket) => {
  console.log('A new client connected')

  socket.on('message', (data) => {
    console.log('Received message:', data)
  })
})

const readablePort = () => {
  try {
    comport.on('readable', () => {
      let data = comport.read().toString()
      data = data.replace(/^\D+/g, '')
      data = data.replace('2 ', '')
      data = data.replace('000000', '')
      data = data.trim()
      if (typeof data == 'string') {
        const dataNumber = parseFloat(data)
        console.log(dataNumber);
        return io.emit('data', dataNumber)
      } else {
        return io.emit('data', data)
      }
    })
  } catch (error) {
    console.log(error)
  }
}
readablePort()
server.listen(port, () => console.log('Server listening on port', port))
