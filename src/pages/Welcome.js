import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import './Welcome.css';

const Welcome = () => {
  const navigator = useNavigate();

  return (
    <>
      <div className='Head' style={{textAlign:'center'}}>
        <h1 >Welcome to the Artillery Game</h1>
      </div>

      <div className='rule'>
        <Card style={{ width: '30rem'}}>
          <Card.Body>
            <Card.Title style={{fontSize:'2em'}}>Rule</Card.Title>
            <Card.Text>
            <p>
            Each player has a cannon that fires projectiles at the
            opposing player. The players take turns firing their cannons at each other until one player hits the
            opposing player's cannon with a projectile, at which point they win and the game is over.
            </p>
            </Card.Text>
            <Button 
              variant="primary"
              id ='playButton'
              onClick={()=>{navigator('/game')}}>
              Play!</Button>
          </Card.Body>
        </Card>        
      </div>

    </>
  );
}

export default Welcome;