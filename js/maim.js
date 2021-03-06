'use strict'

const MINE = '<img class="img" src="imgs/mine.jpg">';
const FLAG = '<img class="img" src="imgs/flag.png">';
const HINT = '<img class="img light"  onclick="toggleHintClassToAllCells(this)" src="imgs/light.png">';
const LIFE = '<img class="img" src="imgs/heart.png">';
const blk_LIFE = '<img class="imgHeart" src="imgs/b-heart.png">';
const EMPTY = '';


var gStartTime = null;
var gIntervalId = null;
var gBoard;
var gHighScore = {
    beginer: Infinity,
    medium: Infinity,
    expert: Infinity
}
var gLevel = {}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    safeClicks: 3,
    hints: 3,
    lives: 3
    // lastPlayBoard: null,
}

// from the radio btn
function getLevel(boardSize, numOfMines) {
    gLevel.SIZE = boardSize;
    gLevel.MINES = numOfMines;

    // get the right high-score
    switch (boardSize) {
        case 4:
            gLevel.level = 'beginer';
            gLevel.highScore = gHighScore.beginer;
            break;
        case 8:
            gLevel.level = 'medium';
            gLevel.highScore = gHighScore.medium;
            break;
        case 12:
            gLevel.highScore = gHighScore.expert;
            gLevel.level = 'expert';
            break;
        default:
            return;
    }
    // update the DOM
    var textScore = (gLevel.highScore === Infinity) ? '00' : textScore = gLevel.highScore;
    document.querySelector('.score').innerText = textScore;

    // creat an empty board to the undo function
    // gGame.lastPlayBoard = createMat(gLevel.SIZE);
    // console.log(gGame.lastPlayBoard);

    initGame();
}

// activated after we pick a level
function initGame() {
    gBoard = buildBoard();
    renderBoard(gBoard);
    renderLives();
    renderHints();

}
// activated after the first click
function startGame(elCell) {
    gGame.isOn = true
    placeRandomMines(gBoard, elCell)
    startTimer()
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isHintOn: false
            }
        }
    }
    return board
}

function renderBoard(board) {
   
    var strHtml = ''
    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = { i, j };
            var currCell = board[i][j];
            var className = '';
            className += currCell.isMine ? 'mine ' : '';
            className += currCell.isMarked ? 'marked ' : '';
            className += currCell.isShown ? 'show ' : 'hide';
            var onClick = currCell.isHintOn ? 'onClick="lightUpOnClick(this)" ' : 'onmousedown="WhichButton(event,this)"';


            if (currCell.isMarked) strHtml += `<td data-i="${i}" data-j="${j}" ${onClick}  class=" cell ${className}">${FLAG}</td>`;
            else if (!currCell.isShown) strHtml += `<td data-i="${i}" data-j="${j}" ${onClick}  class=" cell ${className}"></td>`;
            else strHtml += `<td data-i="${i}" data-j="${j}"  ${onClick}  class=" cell ${className}">${currCell.isMine ? MINE : mineNegsCount(cell, gBoard)}</td>` 


        }
        strHtml += '</tr>'
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHtml

    // hide the context menu on the right click
    hideContextMenu()
}

// place the mines randomly on the board
function placeRandomMines(board, elCell) {
    var emptyCells = findEmptyCells(board, elCell);

    for (var i = 0; i < gLevel.MINES; i++) {
        var randIdx = getRandomInt(0, emptyCells.length)
        var target = emptyCells[randIdx] //* we got en object
        board[target.i][target.j].isMine = true; //*update the model
        emptyCells.splice(randIdx, 1);
        renderBoard(board);
    }

    // duplicate the old array for undo btn
    // duplicate(gGame.lastPlayBoard)
}
// empty cell array for the bombs
function findEmptyCells(board, elCell) {
    var emptyCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (i === +elCell.dataset.i && j === +elCell.dataset.j) continue;
            var emptyCell = { i, j }
            emptyCells.push(emptyCell);
        }
    }
    return emptyCells;
}

// hide the context menu on the right click
function hideContextMenu() {
    var cells = document.querySelectorAll(".cell")
    cells.forEach(el => el.addEventListener('contextmenu', e => e.preventDefault()));
}
// count mines around
function mineNegsCount(cell, board) {
    var rowIdx = cell.i;
    var colIdx = cell.j;
    var count = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board.length) continue;
            if (rowIdx === i && colIdx === j) continue;
            if (board[i][j].isMine) count++;
        }
    }
    gBoard[cell.i][cell.j].minesAroundCount = count;
    return (count === 0) ? EMPTY : count;

}
// detect a left or right click and activate the right fctn
function WhichButton(event, elCell) {
    switch (event.button) {
        case 0:
            // left click
            cellClicked(elCell);
            break;
        case 2:
            // right click
            cellMarked(elCell);
            break;
        default: return;

    }
}
// left click 
function cellClicked(elCell) {
    if (!gGame.isOn) startGame(elCell);

    // duplicate the old array for undo btn
    // duplicate(gGame.lastPlayBoard)

    var cellClasses = elCell.classList
    if (cellClasses.contains('show')) return;
    if (cellClasses.contains('marked')) return;
    if (cellClasses.contains('hide')) {
        // update the model
        var cellPos = {
            i: +elCell.dataset.i,
            j: +elCell.dataset.j
        }
        gBoard[cellPos.i][cellPos.j].isShown = true;
        gGame.shownCount++;

        // update the DOM
        elCell.classList.replace('hide', 'show');

        renderBoard(gBoard);

        if (cellClasses.contains('mine')) {
            --gGame.lives;
            clickAMine(elCell, cellPos);
            renderLives();
            if (gGame.lives === 0) gameOver();
            return
        }

        if (gBoard[cellPos.i][cellPos.j].minesAroundCount === 0) {
            expandShown(gBoard, cellPos.i, cellPos.j)
        }

        if (checkGameOver()) gameWon();
    }
}
// right click
function cellMarked(elCell) {
    if (!gGame.isOn) startGame(elCell);

    if (elCell.classList.contains('show')) return;

    // duplicate the old array for undo btn
    // duplicate(gGame.lastPlayBoard)

    //    update the model 
    var cellPos = {
        i: +elCell.dataset.i,
        j: +elCell.dataset.j
    }
    var cell = gBoard[cellPos.i][cellPos.j];
    gBoard[cellPos.i][cellPos.j].isMarked = cell.isMarked ? false : true;

    gBoard[cellPos.i][cellPos.j].isMarked ? gGame.markedCount++ : gGame.markedCount--

    // update the DOM
    var value = elCell.innerText
    if (value === EMPTY) elCell.innerText = FLAG;
    else elCell.innerText = EMPTY;

    renderBoard(gBoard);

    if (checkGameOver()) gameWon();
}

// expention 
function expandShown(board, i, j) {

    var rowIdx = i;
    var colIdx = j;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board.length) continue;
            if (rowIdx === i && colIdx === j) continue;
            var currCell = board[i][j];
            if (currCell.isShown || currCell.isMine || currCell.isMarked) continue;

            // update the model 
            board[i][j].isShown = true;
            // update the DOM
            var elNegCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            elNegCell.classList.replace('hide', 'show')
            gGame.shownCount++

            // // duplicate the old array for undo btn
            // gGame.lastPlayBoard = gBoard.slice()

            renderBoard(gBoard)

            if (currCell.minesAroundCount === 0) {
                expandShown(board, i, j)
            }
        }
    }
}

function gameOver() {
    // change the css
    document.querySelector('table').classList.add('losing');
    document.querySelector('body').classList.add('losing');
    document.querySelector('.header').classList.add('losing');
    var elEmoji = document.querySelector('.emoji');
    elEmoji.innerText = '😖';

    var elMines = document.querySelectorAll('.mine');
    for (var i = 0; i < elMines.length; i++) {
        var elMine = elMines[i];
        // update the model
        var minePos = {
            i: +elMine.dataset.i,
            j: +elMine.dataset.j
        }
        gBoard[minePos.i][minePos.j].isShown = true;
        // update the DOM
        elMines[i].classList.replace('hide', 'show');
        renderBoard(gBoard);

        clearInterval(gIntervalId);

    }

}

function checkGameOver() {
    var shouldBeShown = gLevel.SIZE ** 2 - gLevel.MINES
    if (gGame.markedCount == gLevel.MINES && gGame.shownCount === shouldBeShown) return true
}
// when clicking the smiley
function restart() {
    clearInterval(gIntervalId);
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        lastPlayBoard: null,
        safeClicks: 3,
        lives: 3,
        hints: 3
    }
    gBoard;
    gStartTime = null
    document.querySelector('.emoji').innerText = '😃'
    document.querySelector('.timer').innerText = '00:00'
    document.querySelector('body').classList.remove('losing')
    document.querySelector('.header').classList.remove('losing')
    document.querySelector('table').classList.remove('losing')
    document.querySelector('.modal').style.display = 'none';
    document.querySelector('.safeBtn').classList.remove('btnOff')
    document.querySelector('.light').classList.remove('btnOff')
    document.querySelector('.numOfSafeClicks').innerText = '3'

    initGame()
}
// timer
function startTimer() {
    if (!gStartTime) gStartTime = Date.now();
    gIntervalId = setInterval(updateTime, 100);
}

function updateTime() {
    var diff = Date.now() - gStartTime;
    var seconds = diff / 1000;
    var secondsArr = (seconds + '').split('.');
    var elTime = document.querySelector('.timer');
    var time = seconds < 10 ? '0' + parseInt(seconds) : parseInt(seconds);
    time += ':'
    time += secondsArr[1] < 10 ? '0' + secondsArr[1] : parseInt(secondsArr[1] / 10) || '00';
    elTime.innerText = time;
}

function gameWon() {
    // pop up the modal
    document.querySelector('.modal').style.display = 'block';

    var audio = new Audio('./audio/bling.mp3');
    audio.play();
    checkHighScore();
    clearInterval(gIntervalId);
}
