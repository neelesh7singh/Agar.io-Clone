const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.static(__dirname + '/public'));
app.use(cors());
const socketio = require('socket.io');
const PORT = process.env.PORT || 3000;
const expressServer = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
const io = socketio(expressServer);
const helmet = require('helmet');
app.use(helmet());

module.exports = {
    app,
    io
}