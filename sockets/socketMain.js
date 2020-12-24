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
    defaultOrbs: 5000,
    defaultSpeed: 6,
    defaultSize: 6,
    defaultZoom: 1.5,
    worldWidth: 5000,
    worldHeight: 5000,
}

function initGame() {
    for (let i = 0; i < settings.defaultOrbs; i++) {
        orbs.push(new Orb(settings));
    }
}

initGame();

// setInterval(() => {
//     io.to('game').emit('tock', {
//     });
// }, 33); // 1/30 of 1 sec

io.sockets.on('connect', (socket) => {
    socket.on('init', (data) => {
        socket.join('game');
        let playerConfig = new PlayerConfig(settings);
        let playerData = new PlayerData(data.playerName, settings);
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
            // console.log(data);
            io.sockets.emit('orbSwitch', {
                orbs: data
            })
        }).catch((err) => {
            // console.log('Orb Collision Not Detected')
        })
        // Player collision check
        let playerDeath = checkForPlayerCollisions(player.playerData, player.playerConfig, players);
        playerDeath.then((data) => {
            console.log('player collision')
        }).catch((err) => {

        })
    })
})

module.exports = io;