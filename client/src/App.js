import './App.css';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Button, Divider, Alert } from '@mui/material';


function App() {

  const [socket, setSocket] = useState(null);
  const [board, setBoad] = useState([]);
  const [ready, setReady] = useState(false);
  const charecters = ["Pawn", "Hero1", "Hero2"];
  const [p1Selects, setP1Selects] = useState([]);
  const [p2Selects, setP2Selects] = useState([]);
  const [alertProps, setAlertProps] = useState({ show: false, severity: '', message: '' });



  useEffect(() => {

    const newSocket = io.connect("http://localhost:8000")

    setSocket(newSocket);


    newSocket.on("initilize", (data) => {
      setReady(data.started);
      setBoad(data.board);  
    });

    newSocket.emit("refreshGame", "Need game update");

    newSocket.on("refreshUpdate", (data) => {
      if (data.started) {
        setReady(true);
        setBoad(data.board);
        setP1Selects(data.players.A.characters);
        setP2Selects(data.players.B.characters);
      } else {
        setP1Selects(data.players.A.characters);
        setP2Selects(data.players.B.characters);
      }
    });

    newSocket.on("characterUpdate", (data) => {
      setP1Selects(data.A);
      setP2Selects(data.B);
    })

    return () => {
      newSocket.close();
    };
  }, []);

  const startGame = () => {
    if (socket) {
      let data = { p1Selects, p2Selects }
      socket.emit("initilize", (data));
    }
  }

  const addSelectP1 = (e) => {
    if (p1Selects.length === 5) {
      alertPlayer({ state: 'info', message: 'P1: Maximum players selected' });
    } else if (socket) {
      let data = { player: 'A', charecters: e.target.innerText };
      socket.emit("selectPlayer", data);
    }
  }

  const addSelectP2 = (e) => {
    if (p2Selects.length === 5) {
      alertPlayer({ state: 'info', message: 'P2: Maximum players selected' });
    } else if (socket) {
      let data = { player: 'B', charecters: e.target.innerText };
      socket.emit("selectPlayer", data);
    }
  }

  const removeSelectP1 = (indexRemove) => {
    setP1Selects((prevSelects) =>
      prevSelects.filter((_, index) => index !== indexRemove)
    );
  };

  const removeSelectP2 = (indexRemove) => {
    setP2Selects((prevSelects) =>
      prevSelects.filter((_, index) => index !== indexRemove)
    );
  };

  const alertPlayer = (data) => {
    setAlertProps({
      show: true,
      severity: data.state,
      message: data.message,
    });

    setTimeout(() => {
      setAlertProps((prevProps) => ({
        ...prevProps,
        show: false,
      }));
    }, 5000);

  };




  if (ready === false) {
    return (
      <div className='container'>
        {alertProps.show && (
          <Alert
            variant='filled'
            severity={alertProps.severity}

            onClose={() => setAlertProps({ ...alertProps, show: false })}
          >{alertProps.message}</Alert>
        )}
        <div className='player1' style={{ marginBottom: "50px" }}>
          <div className='playerHeading'>Player 1</div>
          <div className='selection'> <div className='selectHeading'>Select :</div>{charecters.map((ele, index) => (
            <Button key={index} onClick={(e) => addSelectP1(e)}
              sx={{ '&:hover': { backgroundColor: 'green' } }}
              className='gridSelect' size="large" variant="contained">{ele}</Button>))}
          </div>
          <div className={(p1Selects.length !== 0) ? 'selected' : "empty"}> <div className='selectHeading'>Selected:</div>
            {(p1Selects.length !== 0) ?
              (p1Selects.map((ele, index) => (
                <Button key={index} onClick={() => removeSelectP1(index)}
                  sx={{ '&:hover': { backgroundColor: 'red' } }}
                  className='gridSelect' size="small" variant="contained">{ele}</Button>)))
              : <div style={{ fontSize: "30px" }}>Select Five</div>
            }
          </div>
        </div>
        <Divider sx={{ mt: 3 }} style={{ backgroundColor: "blue" }} />
        <div className='player2'>
          <div className='playerHeading'>Player 2</div>
          <div className='selection'> <div className='selectHeading'>Select:</div>{charecters.map((ele, index) => (
            <Button key={index} onClick={(e) => addSelectP2(e)}
              sx={{ '&:hover': { backgroundColor: 'green' } }}
              className='gridSelect' size="large" variant="contained">{ele}</Button>))}
          </div>
          <div className={(p2Selects.length !== 0) ? 'selected' : "empty"}> <div className='selectHeading'>Selected:</div>
            {(p2Selects.length !== 0) ?
              (p2Selects.map((ele, index) => (
                <Button key={index} onClick={() => removeSelectP2(index)}
                  sx={{ '&:hover': { backgroundColor: 'red' } }}
                  className='gridSelect' size="large" variant="contained">{ele}</Button>)))
              : <div style={{ fontSize: "30px" }}>Select Five</div>
            }
          </div>
        </div>
        <Button variant='contained' sx={{
          '&.Mui-disabled': {
            backgroundColor: '#00092f',
            color: 'grey',
            fontSize: "35px"
          }
        }}
          style={{ marginTop: "50px", width: "100%", height: "50px", fontSize: "35px" }}
          disabled={!(p1Selects.length === 5 && p2Selects.length === 5)}
          onClick={() => startGame()}
        >Start</Button>
      </div>
    )
  }

  else if (ready === true) {
    return (
      <div className='container'>
        {alertProps.show && (
          <Alert
            variant='filled' severity={alertProps.severity}
            onClose={() => setAlertProps({ ...alertProps, show: false })}
          >{alertProps.message}</Alert>
        )}
        <div className='gameContainer'>
          <div className='gameGrid'>
            {board.map((row, rowIndex) => (
              row.map((cell, cellIndex) => (
                <div key={`${rowIndex}-${cellIndex}`}
                  className={`gridItem ${cell && cell[0] === 'A' ? 'A' : cell && cell[0] === 'B' ? 'B' : ''}`}
                  onClick={(e)=>console.log(e)}>
                  {cell !== null && cell}
                </div>
              ))
            ))}
          </div>
        </div>
      </div>
    );
  }



}

export default App;
