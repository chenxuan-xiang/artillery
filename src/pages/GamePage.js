import './GamePage.css';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

// const gameId = localStorage.getItem('gameId');

const dimension = {
  backgroundWidth:1000,
  backgroundHeight:500,
  cannonWidth:30,
  cannonHeight:10,
  ratio:2      // reality distance/pixel distance
}

function GamePage() {
    const [gameId, setGameId] = useState(localStorage.getItem('gameId'));
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [player, setPlayer] = useState(parseInt(localStorage.getItem('playerNumber')));
    const [isStarted, setIsStarted] = useState(false);
    const [gameState, setGameState] = useState(undefined);
    const [angle, setAngle] = useState(2);
    const [opponentAngle, setopponentAngle] = useState(2);
    const [speed, setSpeed] = useState(1000);

    const drawCannonRef = useRef();
    const canvasRef = useRef();
    const navigate = useNavigate();

    const drawCannon = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw player 1's cannon
      ctx.save();
      ctx.translate(dimension.backgroundWidth/4, dimension.backgroundHeight);
      if(player === 0){
        ctx.rotate(-angle * Math.PI / 180);
      } else{
        ctx.rotate(-opponentAngle * Math.PI / 180);
      }
      ctx.fillStyle = 'blue';
      ctx.fillRect(0, -dimension.cannonHeight/2, dimension.cannonWidth, dimension.cannonHeight);
      ctx.restore();
      // Draw player 2's cannon
      ctx.save();
      ctx.translate(3 * dimension.backgroundWidth/4, dimension.backgroundHeight);
      if(player === 0){
        ctx.rotate((opponentAngle-180) * Math.PI / 180);
      } else{
        ctx.rotate((angle-180) * Math.PI / 180);
      }
      ctx.fillStyle = 'red';
      ctx.fillRect(0, -dimension.cannonHeight/2, dimension.cannonWidth, dimension.cannonHeight);
      ctx.restore();
    },[angle,opponentAngle,player])

    drawCannonRef.current = drawCannon;    //temporary solution for closure caused by socket io
    const drawProjectiles =(x, y) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      drawCannonRef.current();
      ctx.beginPath();
      ctx.fillStyle = "#0095DD";
      ctx.arc(x/dimension.ratio, y/dimension.ratio, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
    useEffect(()=>{
      drawCannon();
    },[drawCannon])

    useEffect(() => {
      const newSocket = io('http://localhost:3001');
      setSocket(newSocket);
      drawCannon();
      return() => newSocket.disconnect();
    },[])
  
    useEffect(() => {
      if(socket){
        socket.on('connect', () => {
          setConnected(true);
          socket.emit('joinGame',{gameId : gameId, playerNumber : player})
        });
    
        socket.on('disconnect', () => {
          setConnected(false);
          setGameId(null);
        });
  
        socket.on('gameJoined', ({gameId, player}) =>{
          setGameId(gameId);
          localStorage.setItem("gameId", gameId);
          setPlayer(player);
          localStorage.setItem("playerNumber", player);
        })

        socket.on('startGame', (state)=>{
          setIsStarted(true);
          setGameState(state);
        })

        socket.on('stopGame', ()=>{
          setIsStarted(false);
        })

        socket.on('resumeGame', (state)=>{

          setIsStarted(true);
          setGameState(state);
          const opponentPlayer = player === 0 ? state.player2 : state.player1;
          setopponentAngle(opponentPlayer.angle)
        })

        socket.on('updateGameStated', (projectiles) =>{
          drawProjectiles(projectiles.x, projectiles.y)          //closure
        })
        
        socket.on('switchPlayer', (state)=>{
          drawCannon();
          setGameState(state);
        })

        socket.on('endofGame', (isWinner)=>{
          localStorage.removeItem("gameId");
          localStorage.removeItem("playerNumber")
          socket.emit('receivedEndofGame', gameId)
          navigate('/end',{ state: {isWinner: isWinner}}
          );
        })

        socket.on('gameExpired', ()=>{
          alert("This room is expired!")
          navigate('/');
        })

        socket.on('angleChange', ({angle})=>{
          setopponentAngle(angle);
        })
      }
    },[socket])

    const titleHandler = () => {
      if(isStarted){
        return gameState.turn === player ?
        (<h1 className='header'>Your Turn</h1>):
        (<h1 className='header'>Opponent's Turn</h1>)
      }
      else{
        return (<h1 className='header'>Wait for another player to join</h1>)
      }
    }

    const windsignHandler = () => {
      if(gameState){
        return gameState.enviroment.windDirection > 0 ?
        (<p>Wind direction: &#8594; Wind magnitude:{gameState.enviroment.windMagnitude}m/s</p>):
        (<p>Wind direction: &#8592; Wind magnitude: {gameState.enviroment.windMagnitude}m/s</p>)
      }
      else{
        return (<p>Loading wind info for this field</p>)
      }
    } 

    return (
      <>
        <div>
          {titleHandler()}
          {windsignHandler()}
          {player === 0? (<p> you are on the left side (blue)</p>) : (<p> you are on the right side (red)</p>)}
          <canvas id="canvas" ref={canvasRef} width={dimension.backgroundWidth} height={dimension.backgroundHeight + 3} >
  
          </canvas>
          {(gameState && player !== gameState.turn) ?
            <div style={{textAlign:'center'}}>Tips : The longer a missile flies, the harder it is to predict its trajectory </div>
            :
            (<Form className='controlPanel'>
              <div>
                <Form.Label>Fire Speed</Form.Label>
                <Form.Control type="number" placeholder="input the fire spped" value={speed} onChange={(e)=>{setSpeed(e.target.value)}}/>
              </div>
              <div>
                <Form.Label>Range</Form.Label>
                <div className='range'>
                  <Form.Range 
                    min={0} 
                    max={90} 
                    value={angle} 
                    onChange={(e)=>{
                      setAngle(e.target.value);
                      socket.emit('angleChange', {angle : e.target.value, player : player})
                      }}></Form.Range>
                  <span>{angle}</span>
                </div>  
              </div>

                
              <Button 
                variant="primary" 
                onClick={()=>{
                  if (gameId) {
                    socket.emit('updateGameState', {gameId : gameId, angle : angle, speed : speed, player: player})
                  }
                }}
                >
                Fire!!!
              </Button>
            </Form>)        
          }
  
  
        </div>
      </>
    );
  }
  
  export default GamePage;