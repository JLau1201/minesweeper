import React, {useState} from 'react';
function Square({value, handleMouseDown}){
    const handleContextMenu = (e) => {
        e.preventDefault(); 
    };

    return (
        <button className="square" onContextMenu={handleContextMenu} onMouseDown={handleMouseDown}>
            {value}
        </button>
    );
}

function generateBoard(){
    const board = [...Array(8)].map(e => Array(10).fill(0));

    for (let i = 0; i < 10; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * 8);
            y = Math.floor(Math.random() * 10);
        } while (board[x][y] === -1); 
        board[x][y] = -1;
    }

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
  
    for (let i = 0; i < 8; i++){
        for(let j = 0; j < 10; j++){
            let tileValue = 0;
            if(board[i][j] !== -1){
                for (let k = 0; k < offsets.length; k++){
                    const newRow = i + offsets[k].row;
                    const newCol = j + offsets[k].col;
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 10) {
                        if (board[newRow][newCol] === -1) {
                            tileValue++;
                        }
                    }
                }
                board[i][j] = tileValue;
            }
        }
    }
    return board;
}

function Board({squares, setSquares, gameBoard}){
    function flood(x, y, visited, nextSquares){
        const offsets = [
            {row: 0, col: 0},   // center
            {row: -1, col: -1}, // top-left
            {row: -1, col: 0},  // top
            {row: -1, col: 1},  // top-right
            {row: 0, col: -1},  // left
            {row: 0, col: 1},   // right
            {row: 1, col: -1},  // bottom-left
            {row: 1, col: 0},   // bottom
            {row: 1, col: 1}    // bottom-right
        ];

        visited.add(`${x},${y}`);
    

        for(let i = 0; i < offsets.length; i++){
            const newX = x + offsets[i].row;
            const newY = y + offsets[i].col;
            const key = `${newX},${newY}`;

            if(newX >= 0 && newX < 8 && newY >= 0 && newY < 10 && !visited.has(key)){
                if(gameBoard.gameBoard[newX][newY] === 0){
                    flood(newX, newY, visited, nextSquares);
                }
                nextSquares[newX][newY] = gameBoard.gameBoard[newX][newY];
            }
        }
        return;
    }

    function handleMouseDown(x, y, e){
        const nextSquares = squares.slice();
        switch(e.button){
            case 0:
                if(gameBoard.gameBoard[x][y] === -1){
                    console.log("You Lose!");
                    nextSquares[x][y] = gameBoard.gameBoard[x][y];
                }else if(nextSquares[x][y] !== 'F'){
                    if(gameBoard.gameBoard[x][y] === 0){
                        const visited = new Set();
                        flood(x, y, visited, nextSquares);
                    }
                    nextSquares[x][y] = gameBoard.gameBoard[x][y];
                }
            break;
            case 1:

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
        
        setSquares(nextSquares);
    }

    function renderBoard(){
        const board = [];
        for(let i = 0; i < 8; i++){
            const boardRow = [];
            for (let j = 0; j < 10; j++){
                const index = i * 8 + j;
                boardRow.push(<Square key={index} value={squares[i][j]} handleMouseDown={(e) => handleMouseDown(i, j, e)}/>);
            }
            board.push(
                <div className="board-row" key={i}>
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

function Game(gameBoard){
    const [squares, setSquares] = useState([...Array(8)].map(e => Array(10).fill(null)));
    return (
        <div className="game">
            <div className="game-board">
                <Board squares={squares} setSquares={setSquares} gameBoard={gameBoard}/>
            </div>
        </div>
    );
}

function Main(){
    const gameBoard = generateBoard();

    return (<Game gameBoard={gameBoard}/>)
}

export default Main;