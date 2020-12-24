const express = require('express');
const app = express();
app.use(express.static(__dirname + '/public'));
const socketio = require('socket.io');
const port = process.env.PORT || 80
const expressServer = app.listen(port, () => {
    console.log('Server listening on port 8080');
});
const io = socketio(expressServer);
const helmet = require('helmet');
app.use(helmet());

module.exports = {
    app,
    io
}