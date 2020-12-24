const io = require('../server').io
const Orb = require('./classes/Orb')
const Player = require('./classes/Player')
const PlayerConfig = require('./classes/PlayerConfig')
const PlayerData = require('./classes/PlayerData')

const checkForOrbCollisions = require('./checkCollisions').checkForOrbCollisions
const checkForPlayerCollisions = require('./checkCollisions').checkForPlayerCollisions

let player = {}
let orbs = []
let players = []
let playersObj = []
let settings = {
    defaultOrbs: 700,
    defaultSpeed: 10,
    defaultSize: 7,
    defaultZoom: 1.5,
    worldWidth: 5000,
    worldHeight: 5000,
}

function initGame() {
    for (let i = 0; i < settings.defaultOrbs; i++) {
        orbs.push(new Orb(settings));
    }
}

function getLeaderBord() {
    players.sort((a, b) => b.score - a.score);
    let leaderBord = players.map((curPlayer) => {
        return {
            name: curPlayer.name,
            score: curPlayer.score
        }
    })
    return leaderBord;
}

initGame();

io.sockets.on('connect', (socket) => {
    socket.on('init', (data) => {
        socket.join('game');
        let playerConfig = new PlayerConfig(settings);
        let playerData = new PlayerData(data.playerName, settings, socket.id);
        player = new Player(socket.id, playerData, playerConfig);

        setInterval(() => {
            socket.emit('tock', {
                id: player.socketId,
                players,
                playerX: player.playerData.locX,
                playerY: player.playerData.locY,
            });
        }, 33); // 1/30 of 1 sec

        socket.emit('initReturn', {
            orbs
        });
        players.push(playerData);
        playersObj.push(player);
    })
    socket.on('tick', (data) => {
        if (!player.playerConfig) return;
        playersObj.forEach(p => {
            if (p.socketId == data.id)
                player = p;
        });
        speed = player.playerConfig.speed;
        yV = player.playerConfig.yVector = data.yVector;
        xV = player.playerConfig.xVector = data.xVector;
        if (!xV) return;
        if ((player.playerData.locX < 5 && player.playerData.xVector < 0) || (player.playerData.locX > settings.worldWidth) && (xV > 0)) {
            player.playerData.locY -= speed * yV;
        } else if ((player.playerData.locY < 5 && yV > 0) || (player.playerData.locY > settings.worldHeight) && (yV < 0)) {
            player.playerData.locX += speed * xV;
        } else {
            player.playerData.locX += speed * xV;
            player.playerData.locY -= speed * yV;
        }
        // Orb collision check
        let capturedOrb = checkForOrbCollisions(player.playerData, player.playerConfig, orbs, settings);
        capturedOrb.then((data) => {
            io.sockets.emit('orbSwitch', {
                orbs: data
            })
            io.sockets.emit('updateLeaderBord', getLeaderBord())
        }).catch((e) => { })
        // Player collision check
        let playerDeath = checkForPlayerCollisions(player.playerData, player.playerConfig, players, player.socketId);
        playerDeath.then((data) => {
            io.sockets.emit('updateLeaderBord', getLeaderBord())
            io.sockets.emit('playerDeath', data);
        }).catch((e) => { })
    })

    socket.on('disconnect', (data) => {
        // console.log(data)
        if (!player.playerData) return
        players.forEach((player, i) => {
            if (player.uid == socket.id)
                players.splice(i, 1);
        })
        playersObj.forEach((player, i) => {
            if (player.socketId == socket.id)
                players.splice(i, 1);
            io.sockets.emit('updateLeaderBord', getLeaderBord())
        })
    })
})

module.exports = io;