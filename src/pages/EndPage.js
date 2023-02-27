
import React from 'react';
import { useNavigate, useLocation  } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import './EndPage.css';

const EndPage = () => {
  const navigator = useNavigate();
  const location = useLocation();

  const titleHandler = () => {
    if(location.state){
      const { isWinner } = location.state;
      return isWinner?
      (<h1>you win!!!</h1>):
      (<h1>you lose....</h1>)
    }
    else{
      return (<h1 className='header'>You have not played the game!</h1>)
    }
  }
  return (
    <>
      <div className='Head' style={{textAlign:'center'}}>
        {titleHandler()}
      </div>

      <div className='hint'>
        <Card style={{ width: '30rem'}}>
          <Card.Body>
            <Card.Title style={{fontSize:'2em'}}>hint</Card.Title>
            <Card.Text>
            <p>your may want to take the wind direction and magnitude into consideration</p>
            </Card.Text>
            <div className='buttonSet'>
              <Button 
                variant="primary"
                id ='playButton'
                onClick={()=>{navigator('/game')}}>
                Play again!
              </Button>
              <Button 
                variant="primary"
                id ='playButton'
                onClick={()=>{navigator('/')}}>
                Main Page
              </Button>              
            </div>
          </Card.Body>
        </Card>        
      </div>

    </>
  );
}

export default EndPage;