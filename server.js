const express = require('express');
const app = express();
app.use(express.static(__dirname + '/public'));
const socketio = require('socket.io');
const PORT = process.env.PORT || 3000;
const expressServer = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
const io = socketio(expressServer);
io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
});
const helmet = require('helmet');
app.use(helmet());

module.exports = {
    app,
    io
}