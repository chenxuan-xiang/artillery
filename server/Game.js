const { frameRate, Utility} = require('./Utility');
const {PlayerState} = require('./Player')

const dimension = {
    fieldWidth: 2000,
    fieldHeight: 1000,
    hitThreshold: 3   //for test
  }
const windInfo = {
    maxWindMagnitude: 30,
    minWindMagnitude: 5 
}


class Game {
    constructor(id) {
      this.id = id;
      this.expireTime = 5*60*1000;    // after 5min the room will be removed if no one in it or only one in it
      this.closeRoomTimer = undefined;
      this.projectileMovingInterval = undefined;  //interval to control the projectile Moving
      this.players = [];     
      this.state = {
        currentState:'Idle',
        enviroment:{
            x: dimension.fieldWidth,
            y: dimension.fieldHeight,
            windDirection: Math.round(Math.random()) === 0 ? -1 : 1,
            windMagnitude: Math.floor(Math.random() * (windInfo.maxWindMagnitude - windInfo.minWindMagnitude + 1)) + windInfo.minWindMagnitude
        },
        player1: {
            angle:0,
            x: dimension.fieldWidth/4,
            y: dimension.fieldHeight,
        },
        player2: {
            angle:0,
            x: 3*dimension.fieldWidth/4,
            y: dimension.fieldHeight,
        },
        projectiles:{
            x:0,
            y:0,
            v_x:0,
            v_y:0,            
        },
        turn: 0
      };
    }

    setExpireTimer(f){
        this.closeRoomTimer = setTimeout(()=>{
            f();
          },this.expireTime)
    }

    clearExpireTimer(){
        clearTimeout(this.closeRoomTimer);
    }

    addPlayer(player) {
      this.players.push(player);
      if (this.players.length === 2 && this.players.every((player)=>{return player.state === PlayerState.ONLINE})){
        console.log("can start?")
        this.startGame();
      }
    }

    rejoinPlayer(player, playerNumber){     
        this.players[playerNumber] = player;
        if (this.players.length === 2 && this.players.every((player)=>{return player.state === PlayerState.ONLINE})){
            console.log("test!!!!!")
            this.resumeGame();
        }
    }

    switchPlayer(){
        this.state.turn = this.state.turn === 0 ? 1 : 0;
    }

    numberofPlayer(){
        return this.players.length;
    }

    startGame() {
      this.state.currentState = 'On';
      this.players.forEach((player) => {
        player.socket.emit('startGame',this.state);
      });
    }

    resumeGame() {
        this.state.currentState = 'On';
        this.players.forEach((player) => {
          player.socket.emit('resumeGame',this.state);
        });
        const manipulateSocket = this.players[0].socket;   

        if(this.state.projectiles.x !== 0 && this.state.projectiles.y !== 0){           //middle of a fire and game stopped
            this.generalHandleFire(manipulateSocket)
        } 
      }

    generalHandleFire(socket){
        const opponentPosition = this.state.turn === 0? this.state.player2 : this.state.player1;
        if(this.projectileMovingInterval){clearInterval(this.projectileMovingInterval)}
        this.projectileMovingInterval = setInterval(()=>{
            Utility.calNextPosition(this.state.enviroment, this.state.projectiles);
            //out of border
            if(this.state.projectiles.x > this.state.enviroment.x || 
                this.state.projectiles.x < 0 || 
                this.state.projectiles.y > this.state.enviroment.y ||
                this.state.projectiles.y < 0)  
            {
                clearInterval(this.projectileMovingInterval);
                this.state.projectiles.x = 0;   //move out of the game
                this.state.projectiles.y = 0;
                this.switchPlayer();
                socket.nsp.to(this.id).emit('switchPlayer', this.state)
            }
            
            //there is a hit
            if(Utility.euclideanDis(this.state.projectiles, opponentPosition) <= dimension.hitThreshold){
                clearInterval(this.projectileMovingInterval); 
                this.players.forEach((player,index) => {
                    player.socket.emit('endofGame',this.state.turn === index);      //send win or lose
                  });
            }
            // console.log(this.state.projectiles)
            socket.nsp.to(this.id).emit('updateGameStated', this.state.projectiles)
        }, 1000 / frameRate);
        return this.projectileMovingInterval;
    }

    handleFire(angle, speed, socket){

        const initialPoint = this.state.turn === 0? this.state.player1 : this.state.player2;
        this.state.projectiles = {...this.state.projectiles , ...initialPoint}
        this.state.projectiles.x = initialPoint.x;
        this.state.projectiles.y = initialPoint.y;
        this.state.projectiles.v_x = this.state.turn === 0? speed*Math.cos(angle*Math.PI/180) : -speed*Math.cos(angle*Math.PI/180);
        this.state.projectiles.v_y = -speed*Math.sin(angle*Math.PI/180);
        console.log(this.state)
        return this.generalHandleFire(socket);
    }

  }

module.exports = Game;