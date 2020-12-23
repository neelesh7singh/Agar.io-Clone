class Player {
    constructor(socketId, playerData, playerConfig) {
        this.socketId = socketId;
        this.playerData = playerData;
        this.playerConfig = playerConfig;
    }
}

module.exports = Player;