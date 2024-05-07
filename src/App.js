import React, {useEffect, useState} from 'react';
import flagIcon from './icons/flag.png';
import clockIcon from './icons/clock.png';

const difficulties = [
    {key: 'Easy', size: { rows: 8, cols: 8 }, bombs: 10},
    {key: 'Medium', size: { rows: 16, cols: 16 }, bombs: 40},
    {key: 'Hard', size: { rows: 16, cols: 30 }, bombs: 99}
];

const offsets = [
    {row: -1, col: -1}, // top-left
    {row: -1, col: 0},  // top
    {row: -1, col: 1},  // top-right
    {row: 0, col: -1},  // left
    {row: 0, col: 1},   // right
    {row: 1, col: -1},  // bottom-left
    {row: 1, col: 0},   // bottom
    {row: 1, col: 1}    // bottom-right
];

function Square({value, handleMouseDown, i, j, clickedSquares}){
    const handleContextMenu = (e) => {
        e.preventDefault(); 
    };

    const renderTextColor = () => {
        switch(value) {
            case -1:
                return "bomb";
            case 0:
                return "zero";
            case 1:
                return "one";
            case 2:
                return "two";
            case 3:
                return "three";
            case 4:
                return "four";
            case 5:
                return "five";
            case 6:
                return "six";
            case 7:
                return "seven";
            case 8:
                return "eight";
            default:
                return "";
        }
    }

    return (
        <button 
            className={`${
                clickedSquares[i][j] === 1 ? 'square' :
                clickedSquares[i][j] === 0 ? 'mask':
                'flag'}
                ${renderTextColor()}`}
            onContextMenu={handleContextMenu} 
            onMouseDown={handleMouseDown}
        >
            {value}
        </button>
    );
}

function generateBoard(diff, firstClickX, firstClickY){
    const {size, bombs} = difficulties[diff];
    const {rows, cols} = size;

    const board = [...Array(rows)].map(e => Array(cols).fill(0));

    function checkBombPlacement(x, y){
        if(x === firstClickX && y === firstClickY){
            return false;
        }
        for(let i = 0; i < offsets.length; i++){
            const newX = firstClickX + offsets[i].row;
            const newY = firstClickY + offsets[i].col; 
            if(newX >= 0 && newX < rows && newY >= 0 && newY < cols){
                if(x === newX && y === newY){
                    return false;
                }
            }
        }        
        return true;
    }

    let bombsPlaced = 0;
    while (bombsPlaced < bombs) {
        const x = Math.floor(Math.random() * rows);
        const y = Math.floor(Math.random() * cols);
        if (board[x][y] !== -1 && checkBombPlacement(x, y)){
            board[x][y] = -1;
            bombsPlaced++;
        }
    }
  
    for (let x = 0; x < rows; x++){
        for(let y = 0; y < cols; y++){
            let tileValue = 0;
            if(board[x][y] !== -1){
                for (let i = 0; i < offsets.length; i++){
                    const newRow = x + offsets[i].row;
                    const newCol = y + offsets[i].col;
                    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                        if (board[newRow][newCol] === -1) {
                            tileValue++;
                        }
                    }
                }
                board[x][y] = tileValue;
            }
        }
    }
    return board;
}

function Board({squares, setSquares, diff, setStartTimer, setFlagCount}){
    const {size, bombs} = difficulties[diff];
    const {rows, cols} = size;

    const [clickedSquares, setClickedSquares] = useState([...Array(rows)].map(e => Array(cols).fill(0)));
    const [gameOver, setGameOver] = useState(0);

    if(countClickedSquares() === 1){
        const nextClickedSquares = [...Array(rows)].map(e => Array(cols).fill(0));
        let x;
        let y;
        for (let i = 0; i < rows; i++){
            for (let j = 0; j < cols; j++){
                if(clickedSquares[i][j] === 1){
                    x = i;
                    y = j;
                }
            }
        }
        flood(x, y, nextClickedSquares);
        setClickedSquares(nextClickedSquares);
    }

    function countClickedSquares() {
        let count = 0;
        for (let i = 0; i < rows; i++){
            for (let j = 0; j < cols; j++){
                if(clickedSquares[i][j] === 1){
                    count++;
                }
            }
        }
        return count;
    }

    function flood(x, y, nextClickedSquares){ 
        nextClickedSquares[x][y] = 1;

        for(let i = 0; i < offsets.length; i++){
            const newX = x + offsets[i].row;
            const newY = y + offsets[i].col;

            if(newX >= 0 && newX < rows && newY >= 0 && newY < cols && nextClickedSquares[newX][newY] === 0){
                nextClickedSquares[newX][newY] = 1;

                if(squares[newX][newY] === 0){
                    flood(newX, newY, nextClickedSquares);
                }
            }
        }
        return;
    }

    function handleEndGame(state, nextClickedSquares){
        if(state === -1){
            for(let x = 0; x < rows; x++){
                for(let y = 0; y < cols; y++){
                    if(squares[x][y] === -1){
                        nextClickedSquares[x][y] = 1;
                    }
                }
            }
            setStartTimer(false);
            setGameOver(1);
        }else if(countClickedSquares() === rows * cols - bombs){
            setStartTimer(false);
            setGameOver(2);
        }
    }

    function handleTileClick(nextClickedSquares, x, y){
        if(nextClickedSquares[x][y] === 0){
            if(squares[x][y] === -1){
                handleEndGame(-1, nextClickedSquares);
                nextClickedSquares[x][y] = 1;
            }else if(squares[x][y] === 0){
                flood(x, y, nextClickedSquares);
            }else{
                nextClickedSquares[x][y] = 1;
            }
            handleEndGame(0, nextClickedSquares);
        }
    }

    function handleMouseDown(x, y, e){
        e.preventDefault();
        if(gameOver === 0){
            const nextClickedSquares = clickedSquares.slice();

            switch(e.button){
                case 0:
                    if(squares[0][0] === null && nextClickedSquares[x][y] !== 2){
                        setStartTimer(true);
                        setFlagCount(prevFlagCount => difficulties[diff].bombs);

                        setSquares(generateBoard(diff, x, y));
                    }
                    handleTileClick(nextClickedSquares, x, y);
                break;
                case 1:
                    if(nextClickedSquares[x][y] === 1){
                        let numFlags = 0;
                        for (let i = 0; i < offsets.length; i++){
                            const newX = x + offsets[i].row;
                            const newY = y + offsets[i].col;
                            if(newX >= 0 && newX < rows && newY >= 0 && newY < cols){
                                if(nextClickedSquares[newX][newY] === 2){
                                    numFlags++;
                                }
                            }
                        }
                        if(numFlags === squares[x][y]){
                            for(let i = 0; i < offsets.length; i++){
                                const newX = x + offsets[i].row;
                                const newY = y + offsets[i].col;
                                if(newX >= 0 && newX < rows && newY >= 0 && newY < cols){
                                    handleTileClick(nextClickedSquares, newX, newY);
                                }
                            }
                        }
                    }
                break;
                case 2:
                    if(nextClickedSquares[x][y] === 0){
                        nextClickedSquares[x][y] = 2;
                        setFlagCount(prevFlagCount => prevFlagCount - 1);
                    }else if(nextClickedSquares[x][y] === 2){
                        nextClickedSquares[x][y] = 0;
                        setFlagCount(prevFlagCount => prevFlagCount + 1);
                    }
                break;
                default:
                    console.log("Unknown mouse button clicked");
                break;
            }
            setClickedSquares(nextClickedSquares);
        }
    }

    function renderBoard(){
        const board = [];
        for(let x = 0; x < rows; x++){
            const boardRow = [];
            for (let y = 0; y < cols; y++){
                const index = x * rows + y;
                boardRow.push(
                    <Square 
                        key={index} 
                        value={squares[x][y]} 
                        handleMouseDown={(e) => handleMouseDown(x, y, e)}
                        i={x}
                        j={y}
                        clickedSquares={clickedSquares}
                    />
                );
            }
            board.push(
                <div className="board-row" key={x}>
                    {boardRow}
                </div>);
        }

        return board;
    }

    return (
        <div className='game-wrapper'>
            {renderBoard()}
            <p className='game-over-message' style={{fontWeight: 'bold'}}>
                {gameOver === 0 ? "" :
                gameOver === 1 ? "Game Over! You Lose LMAOOOO" :
                "Game Over! You Win!"}
            </p>
        </div>
    );
}

function Game({diff, setStartTimer, setFlagCount, squares, setSquares}){
    
    return (
        <div className="game">
            <div className="game-board">
                <Board squares={squares} setSquares={setSquares} diff={diff} setStartTimer={setStartTimer} setFlagCount={setFlagCount}/>
            </div>
        </div>
    );
}

function Menu({diff, startTimer, flagCount, setSquares}){
    const [time, setTime] = useState(0);

    useEffect(() => {
        let interval;
        if (startTimer) {
            interval = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [startTimer]);

    const menuWidth = `${34 * difficulties[diff].size.cols + .3}px`;

    const handleDifficultyChange = (e) => {
        let newDiff;
        switch(e.target.value){
            case "Easy":
                newDiff = 0;
                break;
            case "Medium":
                newDiff = 1;
                break;
            case "Hard":
                newDiff = 2;
                break;
            default:
                console.log("Unknown option chosen");
        }
        localStorage.setItem('difficulty', newDiff);
        window.location.reload(); 
    };

    return (
        <div className="menu" style={{width: menuWidth}}>
            <select value={difficulties[diff].key} onChange={handleDifficultyChange} style={{marginRight: '10px'}}>
                    {difficulties.map(difficulty => (
                        <option key={difficulty.key} value={difficulty.key}>{difficulty.key}</option>
                    ))}
            </select>

            <img src={flagIcon} alt='Flag Icon' style={{width: '34px', height: '34px'}}/>
            <div className='flag-count' style={{marginRight: '20px'}}>
                {(flagCount)}
            </div>

            <img src={clockIcon} alt='Clock Icon' style={{width: '34px', height: '34px', marginRight: '3px'}}/>
            <div className="timer">
                {(time)}
            </div>
        </div>
    );
}

function Main(){
    const storedDiff = localStorage.getItem('difficulty');
    const initialDiff = storedDiff !== null ? parseInt(storedDiff) : 0;

    const diff = initialDiff;
    const [startTimer, setStartTimer] = useState(false);
    const [flagCount, setFlagCount] = useState(difficulties[diff].bombs);
    const [squares, setSquares] = useState([...Array(difficulties[diff].size.rows)].map(e => Array(difficulties[diff].size.cols).fill(null)));

    const onRestart = () => {
        window.location.reload();
    }
    
    return (
        <div className='game-area'>
            <Menu diff={diff} startTimer={startTimer} flagCount={flagCount} setSquares={setSquares}/>
            <Game diff={diff} setStartTimer={setStartTimer} setFlagCount={setFlagCount} squares={squares} setSquares={setSquares}/>
            <button className='restart' onClick={onRestart}>Restart</button>            
        </div>
    );
}

export default Main;