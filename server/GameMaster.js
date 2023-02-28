const Game = require('./Game');
const { Player } = require('./Player')
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

class GameMaster {
  constructor(server) {
    this.games = {};       //for simplicity, not use db this time
    this.io = socketIo(server,{
        cors: {
          origin: '*',
        }
    });
    this.io.on('connection', this.onConnection.bind(this));
  }

  onConnection(socket) {
    socket.emit("connected")
    this.registerHandler(socket);
  }

  findGame() {
    for (const gameId in this.games) {
      const game = this.games[gameId];
      if (game.players.length < 2) {
        return game;
      }
    }
    return null;    //all the room full
  }

  createNewGame() {
    const gameId = uuidv4();
    const game = new Game(gameId);
    this.games[gameId] = game;    //add the game to the map
    return game;
  }

  registerHandler(socket) {
    let gameIdCopy = null;
    let projectileMovingInterval = undefined;  //used for resume game state

    const setExpire = (game) => {
      game.setExpireTimer(()=>{
        delete this.games[game.id];
        socket.emit('gameExpired');
      });
    }

    const clearExpire = (game) => {
      game.clearExpireTimer();
    }

    socket.on('joinGame', ({gameId, playerNumber}) => {
      if(!gameId || !this.games[gameId] || this.games[gameId].numberofPlayer > 1){          //new user
        playerNumber = 1;
        let game = this.findGame();
        // no available game room
        if (!game) {           
          game = this.createNewGame();
          setExpire(game);    
          playerNumber = 0;
        } else {        // exist a game where one player is waiting
          clearExpire(game);   
        }

        socket.join(game.id);
        game.addPlayer(new Player(socket));
        gameIdCopy = game.id;
        socket.emit('gameJoined', {gameId : game.id, player : playerNumber});
        socket.to(game.id).emit('playerJoined');
        Object.keys(this.games).forEach((element,index) => {
        });
      }
      else {                         //old users
        socket.join(gameId);
        gameIdCopy = gameId;
        let game = this.games[gameId];
        clearExpire(game);
        game.rejoinPlayer(new Player(socket), playerNumber);
        socket.emit('gameJoined', {gameId : gameId, player : playerNumber});
        socket.to(gameId).emit('playerJoined');
      }          
    });

    // handle fire in the game
    socket.on('updateGameState', ({gameId, angle, speed, player}) => {
      let game = this.games[gameId];
      // calculate projectory
      if(player === game.state.turn && game.state.projectiles.x === 0 && game.state.projectiles.y === 0){
        game.handleFire(angle, speed, socket);
      }
    });  
    
    socket.on('angleChange', ({angle,player})=>{
      if(gameIdCopy && this.games[gameIdCopy]){
        const game = this.games[gameIdCopy];
        socket.to(gameIdCopy).emit("angleChange",{angle:angle})
        if(player === 0){
          game.state.player1.angle = angle;
        } else {
          game.state.player2.angle = angle;
        }
      }
    })

    socket.on('disconnect', () => {
      if(gameIdCopy && this.games[gameIdCopy]){
        const game = this.games[gameIdCopy];
        const player = game.players.find((player) => player.socket == socket);
        player.offLine();
        setExpire(game);
        socket.to(gameIdCopy).emit("stopGame");
        clearInterval(game.projectileMovingInterval)    //stop fire
      }
    });

    socket.on('receivedEndofGame', (gameId) => {
      delete this.games[gameId];          //delete game instance
      socket.disconnect();
    })

  }
}

module.exports = {GameMaster};