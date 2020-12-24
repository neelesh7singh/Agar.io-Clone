let socket = io.connect('http://localhost:8080');

function init() {
    draw();
    socket.emit('init', {
        playerName: player.name,
    })
}

socket.on('initReturn', (data) => {
    orbs = data.orbs;
    setInterval(() => {
        socket.emit('tick', {
            id: socket.id,
            xVector: player.xVector,
            yVector: player.yVector,
        })
    }, 33);
})

socket.on('tock', (data) => {
    if (data.id != socket.id) return;
    players = data.players;
    player.locX = data.playerX;
    player.locY = data.playerY;
});

socket.on('orbSwitch', (data) => {
    data.orbs.forEach(obj => {
        orbs.splice(obj.index, 1, obj.orb);
    })
})