import React, {useState} from 'react';

const difficulties = [
    {size: { rows: 8, cols: 8 }, bombs: 10},
    {size: { rows: 16, cols: 16 }, bombs: 40},
    {size: { rows: 16, cols: 30 }, bombs: 99}
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
            case 'F':
                return "flag";
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
            className={`${clickedSquares[i][j] ? 'square' : 'mask'} ${renderTextColor()}`}
            onContextMenu={handleContextMenu} 
            onMouseDown={handleMouseDown}
        >
            {value}
        </button>
    );
}

function generateBoard(diff){
    const {size, bombs} = difficulties[diff];
    const {rows, cols} = size;

    const board = [...Array(rows)].map(e => Array(cols).fill(0));

    let bombsPlaced = 0;
    while (bombsPlaced < bombs) {
        const x = Math.floor(Math.random() * rows);
        const y = Math.floor(Math.random() * cols);
        if (board[x][y] !== -1) {
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

function Board({squares, setSquares, gameBoard, diff}){
    const {size, bombs} = difficulties[diff];
    const {rows, cols} = size;

    const [clickedSquares, setClickedSquares] = useState([...Array(rows)].map(e => Array(cols).fill(false)));
    const [gameOver, setGameOver] = useState(false);

    function countClickedSquares() {
        let count = 0;
        for (let i = 0; i < rows; i++){
            for (let j = 0; j < cols; j++){
                if(clickedSquares[i][j] === true){
                    count++;
                }
            }
        }
        return count;
    }

    function flood(x, y, nextSquares, nextClickedSquares){
        
        nextClickedSquares[x][y] = true;

        for(let i = 0; i < offsets.length; i++){
            const newX = x + offsets[i].row;
            const newY = y + offsets[i].col;

            if(newX >= 0 && newX < rows && newY >= 0 && newY < cols && nextClickedSquares[newX][newY] === false && nextSquares[newX][newY] !== 'F'){
                nextSquares[newX][newY] = gameBoard[newX][newY];
                nextClickedSquares[newX][newY] = true;

                if(gameBoard[newX][newY] === 0){
                    flood(newX, newY, nextSquares, nextClickedSquares);
                }
            }
        }
        return;
    }

    function handleEndGame(state, nextSquares, nextClickedSquares){
        if(state === -1){
            for(let x = 0; x < rows; x++){
                for(let y = 0; y < cols; y++){
                    if(gameBoard[x][y] === -1){
                        nextSquares[x][y] = gameBoard[x][y];
                        nextClickedSquares[x][y] = true;
                    }
                }
            }

            setGameOver(true);
            console.log('You Lose!')
        }else if(countClickedSquares() === rows * cols - bombs){
            setGameOver(true);
            console.log("You Win!")
        }
    }

    function handleMouseDown(x, y, e){
        if(!gameOver){
            const nextSquares = squares.slice();
            const nextClickedSquares = clickedSquares.slice();

            switch(e.button){
                case 0:
                    if(nextSquares[x][y] === null){
                        if(gameBoard[x][y] === -1){
                            handleEndGame(-1, nextSquares, nextClickedSquares);
                            nextClickedSquares[x][y] = true;
                        }else if(gameBoard[x][y] === 0){
                            flood(x, y, nextSquares, nextClickedSquares);
                        }else{
                            nextClickedSquares[x][y] = true;
                        }
                        handleEndGame(0, nextSquares, nextClickedSquares);

                        nextSquares[x][y] = gameBoard[x][y];
                    }
                break;
                case 1:
                    if(nextClickedSquares[x][y] === true){
                        let numFlags = 0;
                        for (let i = 0; i < offsets.length; i++){
                            const newX = x + offsets[i].row;
                            const newY = y + offsets[i].col;
                            if(newX >= 0 && newX < rows && newY >= 0 && newY < cols){
                                if(nextSquares[newX][newY] === 'F'){
                                    numFlags++;
                                }
                            }
                        }
                        if(numFlags === nextSquares[x][y]){
                            for(let i = 0; i < offsets.length; i++){
                                const newX = x + offsets[i].row;
                                const newY = y + offsets[i].col;
                                if(newX >= 0 && newX < rows && newY >= 0 && newY < cols){
                                    if(nextSquares[newX][newY] === null){
                                        if(gameBoard[newX][newY] === -1){
                                            handleEndGame(-1, nextSquares, nextClickedSquares);
                                            nextClickedSquares[newX][newY] = true;
                                        }else if(gameBoard[newX][newY] === 0){
                                            flood(newX, newY, nextSquares, nextClickedSquares);
                                        }else{
                                            nextClickedSquares[newX][newY] = true;
                                        }
                                        handleEndGame(0, nextSquares, nextClickedSquares);
                
                                        nextSquares[newX][newY] = gameBoard[newX][newY];
                                    }
                                }
                            }
                        }
                    }
                break;
                case 2:
                    if(nextSquares[x][y] === null){
                        nextSquares[x][y] = 'F';
                    }else if(nextSquares[x][y] === 'F'){
                        nextSquares[x][y] = null;
                    }

                break;
                default:
                    console.log("Unknown mouse button clicked");
                break;
            }
            setClickedSquares(clickedSquares);
            setSquares(nextSquares);
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
        <>
            {renderBoard()}
        </>
    );
}

function Game({gameBoard, diff}){
    const [squares, setSquares] = useState([...Array(difficulties[diff].size.rows)].map(e => Array(difficulties[diff].size.cols).fill(null)));

    return (
        <div className="game">
            <div className="game-board">
                <Board squares={squares} setSquares={setSquares} gameBoard={gameBoard} diff={diff}/>
            </div>
        </div>
    );
}

function Main(){
    const diff = 2;
    const gameBoard = generateBoard(diff);
    return (<Game gameBoard={gameBoard} diff={diff}/>)
}

export default Main;