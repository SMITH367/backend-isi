const http = require('http').createServer();

const io = require('socket.io')(http, {
    cors: {
        origin: "*"
    }
});

io.on('connection', (socket) => {
    console.log('a user connected' + socket.id.substr(0, 2));

    socket.on('message', (message) => {
        console.log(`${socket.id.substr(0,2)} said ${message}`);
        io.emit('message', `${socket.id.substr(0,2)} said ${message}`);
    });
    socket.on('updateState', (message) => {
        console.log(`${socket.id.substr(0,2)} said ${message}`);
        io.emit('updateState', `${socket.id.substr(0,2)} said ${message}`);
    });

});

http.listen(80, () => console.log('listening on http://localhost:80'));


// Regular Websockets

// const WebSocket = require('ws')
// const server = new WebSocket.Server({ port: '8080' })

// server.on('connection', socket => { 

//   socket.on('message', message => {

//     socket.send(`Roger that! ${message}`);

//   });

// });