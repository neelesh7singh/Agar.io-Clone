let socket = io.connect('ws://agar-io-clone7.herokuapp.com:80');

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

socket.on('updateLeaderBord', (data) => {
    document.querySelector('.leader-board').innerHTML = "";
    data.forEach((currPlayer) => {
        document.querySelector('.leader-board').innerHTML += `<li class="leaderboadr-player">${currPlayer.name} - ${currPlayer.score}</li>`
    })
})

socket.on('playerDeath', (data) => {
    if (data.died.uid == socket.id) player.isAlive = false;
    document.querySelector('#game-message').innerHTML = `${data.died.name} absorbed by ${data.killedBy.name}`
    $('#game-message').css({
        "background-color": "#00e6e6",
        "opacity": 1
    });
    $('#game-message').show();
    $('#game-message').fadeOut(5000);
})