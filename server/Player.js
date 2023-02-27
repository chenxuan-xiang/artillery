const PlayerState = {
    ONLINE: 'online',
    OFFLINE: 'offline',
  };

class Player {
    constructor(socket) {
      this.socket = socket;     
      this.state = PlayerState.ONLINE;
    }
    
    offLine(){
        this.state = PlayerState.OFFLINE
    }

    onLine(){
        this.state = PlayerState.ONLINE
    }

  }

module.exports = { Player, PlayerState };