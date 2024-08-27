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
    const [currentTurn, setCurrentTurn] = useState('');
    const [currentPawn, setCurrentPawn] = useState('');
    const [currentIndex, setCurrentIndex] = useState({ row: null, column: null })
    const [pawnList, SetPawnList] = useState([]);
    const [p1History, setP1History] = useState([]);
    const [p2History, setP2History] = useState([]);





    useEffect(() => {

      const newSocket = io.connect("http://localhost:8000")

      setSocket(newSocket);


      newSocket.on("initilize", (data) => {
        setReady(data.started);
        setBoad(data.board);
        setCurrentTurn(data.currentPlayer);
      });

      newSocket.emit("refreshGame", "Need game update");

      newSocket.on("gameWon", (data) => {
        setAlertProps({
          show: true,
          severity: "success",
          message: `Player ${data.winner} Won The Game`,
        });
      })

      newSocket.on("restartGame", (data) => {
        setReady(data.started);
        setBoad(data.board);
        setCurrentTurn(data.currentPlayer);
        setP1Selects(data.players.A.characters);
        setP2Selects(data.players.B.characters);
      });

      newSocket.on("invalidWarning", data => {

        setAlertProps({
          show: true,
          severity: "warning",
          message: data.reason,
        });

        setTimeout(() => {
          setAlertProps((prevProps) => ({
            ...prevProps,
            show: false,
          }));
        }, 5000);
      })

      newSocket.on("refreshUpdate", (data) => {
        if (data.started) {
          setReady(true);
          setCurrentTurn(data.currentPlayer);
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

      newSocket.on("clientMoveUpdate", (data) => {
        setCurrentTurn(data.currentPlayer);
        setBoad(data.board);
        setP1History(data.players.A.moveList);
        setP2History(data.players.B.moveList);
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
      setP1Selects((prevSelects) => {
        const updatedSelects = prevSelects.filter((_, index) => index !== indexRemove);

        if (socket) {
          const data = { p1: updatedSelects, player: 'A' };
          socket.emit("characterRemove", data);
        }

        return updatedSelects;
      });
    };

    const removeSelectP2 = (indexRemove) => {
      setP2Selects((prevSelects) => {
        const updatedSelects = prevSelects.filter((_, index) => index !== indexRemove);

        if (socket) {
          const data = { p2: updatedSelects, player: 'B' };
          socket.emit("characterRemove", data);
        }

        return updatedSelects;
      });
    };

    const pickHandler = (cell, rowIndex, columnIndex) => {
      if (currentTurn === cell[0]) {
        setCurrentPawn(cell);
        setCurrentIndex({ row: rowIndex, column: columnIndex })
        if (cell !== null && cell[2] === 'P') {
          SetPawnList(['L', 'R', 'F', 'B']);
        } else if (cell[2] === 'H' && cell[3] === '1') {
          SetPawnList(['L', 'R', 'F', 'B']);
        }
        else if (cell[2] === 'H' && (cell[3] === '2')) {
          SetPawnList(['FL', 'FR', 'BL', 'BR']);
        }
      }
    }

    const updateMove = (ele) => {
      let data = { ele, currentIndex, currentPawn };
      if (socket) {
        socket.emit("updateMove", data);
      }
      SetPawnList([]);
    }


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

    const restartGame = () => {
      if (socket) {
        socket.emit("reInitilize", "Restart Game")
      }
    }

    if (ready === false) {
      return (
        <div className='container' style={{ marginTop: "150px", width: "600px" }}>
          {alertProps.show && (
            <Alert
              variant='filled'
              severity={alertProps.severity}
              onClose={() => setAlertProps({ ...alertProps, show: false })}
            >
              {alertProps.message}
            </Alert>
          )}
          <div className='player1'>
            <div className='playerHeading'>Player 1</div>
            <div className='selection'>
              <div className='selectHeading'>Select:</div>
              <div className="button-group" style={{ display: 'flex', flexWrap: 'nowrap', gap: '10px' }}>
                {charecters.map((ele, index) => (
                  <Button
                    key={index}
                    onClick={(e) => addSelectP1(e)}
                    sx={{ '&:hover': { backgroundColor: 'green' } }}
                    className='gridSelect'
                    size="large"
                    variant="contained"
                    style={{ minWidth: '100px', padding: '10px 20px' }}
                  >
                    {ele}
                  </Button>
                ))}
              </div>
            </div>
            <div className={(p1Selects.length !== 0) ? 'selected' : "empty"}>
              <div className='selectHeading'>Selected:</div>
              <div className="button-group" style={{ marginLeft: "-40px", display: 'flex', flexWrap: 'nowrap', gap: '5px' }}>
                {p1Selects.length !== 0 ? (
                  p1Selects.map((ele, index) => (
                    <Button
                      key={index}
                      onClick={() => removeSelectP1(index)}
                      sx={{ '&:hover': { backgroundColor: 'red' } }}
                      className='gridSelect'
                      size="large"
                      variant="contained"
                      style={{ minWidth: '80px', padding: '10px 10px' }}
                    >
                      {ele}
                    </Button>
                  ))
                ) : (
                  <div style={{ marginLeft: "40px", fontSize: "30px" }}>Select Five</div>
                )}
              </div>
            </div>
          </div>

          <Divider sx={{ mt: 3 }} style={{ backgroundColor: "blue" }} />

          <div className='player2'>
            <div className='playerHeading'>Player 2</div>
            <div className='selection'>
              <div className='selectHeading'>Select:</div>
              <div className="button-group" style={{ display: 'flex', flexWrap: 'nowrap', gap: '10px' }}>
                {charecters.map((ele, index) => (
                  <Button
                    key={index}
                    onClick={(e) => addSelectP2(e)}
                    sx={{ '&:hover': { backgroundColor: 'green' } }}
                    className='gridSelect'
                    size="large"
                    variant="contained"
                    style={{ minWidth: '100px', padding: '10px 20px' }}
                  >
                    {ele}
                  </Button>
                ))}
              </div>
            </div>
            <div className={(p2Selects.length !== 0) ? 'selected' : "empty"}>
              <div className='selectHeading'>Selected:</div>
              <div className="button-group" style={{ marginLeft: "-40px", display: 'flex', flexWrap: 'nowrap', gap: '5px' }}>
                {p2Selects.length !== 0 ? (
                  p2Selects.map((ele, index) => (
                    <Button
                      key={index}
                      onClick={() => removeSelectP2(index)}
                      sx={{ '&:hover': { backgroundColor: 'red' } }}
                      className='gridSelect'
                      size="large"
                      variant="contained"
                      style={{ minWidth: '80px', padding: '10px 10px' }}
                    >
                      {ele}
                    </Button>
                  ))
                ) : (
                  <div style={{ marginLeft: "40px", fontSize: "30px" }}>Select Five</div>
                )}
              </div>
            </div>
          </div>

          <Button
            variant='contained'
            sx={{
              '&.Mui-disabled': {
                backgroundColor: '#00092f',
                color: 'grey',
                fontSize: "35px"
              }
            }}
            style={{
              marginTop: "50px",
              width: "100%",
              height: "50px",
              fontSize: "35px"
            }}
            disabled={!(p1Selects.length === 5 && p2Selects.length === 5)}
            onClick={() => startGame()}
          >
            Start
          </Button>
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
            <div style={{ fontSize: "30px", marginBottom: "30px" }}>Current Player: {currentTurn}</div>
            <div className='gameGrid'>
              {board.map((row, rowIndex) => (
                row.map((cell, cellIndex) => (
                  <div
                    key={`${rowIndex}-${cellIndex}`}
                    className={`gridItem 
                          ${cell && cell[0] === 'A' ? ' A' : cell && cell[0] === 'B' ? ' B' : ''}
                          ${cell && cell[0] === currentTurn ? ' selectedd' : ''}`}
                    onClick={() => { (cell !== null) && pickHandler(cell, rowIndex, cellIndex) }}>
                    {cell !== null && cell}
                  </div>
                ))
              ))}
            </div>
            <div style={{ fontSize: "30px", marginTop: "30px" }}>Selected: {currentPawn}</div>
          </div>
          <div className="button-group"
            style={{ marginTop: "10px", display: 'flex', flexWrap: 'nowrap', gap: '5px', justifyContent: "center" }}>
            {(pawnList.length !== 0) ?
              pawnList.map((ele, index) => (
                <Button variant='contained'
                  key={index}
                  size="large"
                  style={{ minWidth: '80px', padding: '10px 10px' }}
                  onClick={() => updateMove(ele)}
                >{ele}</Button>
              )) : ''
            }</div>
          <Divider sx={{ mt: 3, mb: 3 }} style={{ backgroundColor: "blue" }} />
          <div style={{ display: "inline-flex", gap: "20px" }}>
            <Button onClick={() => restartGame()} size='large' style={{ border: 'solid' }} varient='contained' color='error' >Quit Game </Button>
            <Button onClick={() => restartGame()} size='large' style={{ border: 'solid' }} varient='contained' color='primary' >Restart Game </Button>
          </div>
          <Divider sx={{ mt: 3, mb: 3 }} style={{ backgroundColor: "blue" }} />
          <div style={{ fontSize: "20px" }}>Move History</div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            fontSize: "20px",
            padding: "10px",
          }} className='history'>
            <div className="HistoryPlayerA" style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontWeight: "bold", marginBottom: "10px" }}>Player A</div>
              <ul style={{ listStyleType: "none", padding: 0 }}>
                {p1History.map((ele, index) => (
                  <li key={index}>{ele}</li>
                ))}
              </ul>
            </div>
            <div className="HistoryPlayerB" style={{ flex: 1,marginRight:"-100px", textAlign: "left" }}>
              <div style={{ fontWeight: "bold", marginBottom: "10px" }}>Player B</div>
              <ul style={{ listStyleType: "none", padding: 0 }}>
                {p2History.map((ele, index) => (
                  <li key={index}>{ele}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }



  }

  export default App;
