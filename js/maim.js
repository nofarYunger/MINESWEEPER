'use strict'

const MINE = '<img class="img" src="./imgs/mine.jpg">';
const FLAG = '<img class="img" src="./imgs/flag.png">';
const LIFE = '<img class="img" src="./imgs/heart.png">';
const EMPTY = '';


var gStartTime = null
var gIntervalId = null
var gBoard;
var gLevel = {}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

// from the radio btn
function getLevel(boardSize, numOfMines) {
    gLevel.SIZE = boardSize;
    gLevel.MINES = numOfMines;

    initGame()
}

// activated after we pick a level
function initGame() {
    gBoard = buildBoard()
    renderBoard(gBoard)
}
// activated after the first click
function startGame(elCell) {
    startTimer()
  
}

function buildBoard() {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

// place the mines randomly on the board
function placeRandomMines(board, elCell) {
    var emptyCells = findEmptyCells(board, elCell)
    for (var i = 0; i < gLevel.MINES; i++) {
        var randIdx = getRandomInt(0, emptyCells.length)
        var target = emptyCells[randIdx] //* we got en object
        board[target.i][target.j].isMine = true
        // emptyCells = emptyCells.splice(randIdx, 1)
        renderBoard(board)
    }
}
// empty cell array for the bombs
function findEmptyCells(board, elCell) {
    var emptyCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i] === +elCell.dataset.i && board[j] === +elCell.dataset.j) continue;
            var emptyCell = { i, j }
            emptyCells.push(emptyCell)
        }
    }
    return emptyCells;
}

function renderBoard(board) {
    var strHtml = ''
    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var cell = { i, j };
            var currCell = board[i][j]
            var className = '';
            className += currCell.isMine ? 'mine ' : ''
            className += currCell.isMarked ? 'marked ' : ''
            className += currCell.isShown ? 'show ' : 'hide'
            if (currCell.isMarked) strHtml += `<td data-i="${i}" data-j="${j}" onmousedown="WhichButton(event,this)"  class=" cell ${className}">${FLAG}</td>`
            else if (!currCell.isShown) strHtml += `<td data-i="${i}" data-j="${j}" onmousedown="WhichButton(event,this)"  class=" cell ${className}"></td>`
            else strHtml += `<td data-i="${i}" data-j="${j}"  onmousedown="WhichButton(event,this)"  class=" cell ${className}">${currCell.isMine ? MINE : mineNegsCount(cell, gBoard)}</td>`

        }
        strHtml += '</tr>'
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHtml

    // hide the context menu on the right click
    hideContextMenu()
}

// hide the context menu on the right click
function hideContextMenu() {
    var cells = document.querySelectorAll(".cell")
    cells.forEach(el => el.addEventListener('contextmenu', e => e.preventDefault()));
}
// count mines around
function mineNegsCount(cell, board) {
    var rowIdx = cell.i
    var colIdx = cell.j
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board.length) continue
            if (rowIdx === i && colIdx === j) continue
            if (board[i][j].isMine) count++
        }
    }
    gBoard[cell.i][cell.j].minesAroundCount = count
    return (count === 0) ? EMPTY : count

}
// detect a left or right click and activate the right fctn
function WhichButton(event, elCell) {
    switch (event.button) {
        case 0:
            cellClicked(elCell)
            break;
        case 2:
            cellMarked(elCell)
            break;
        default:
            return;

    }
}
// left click 
function cellClicked(elCell) {
    if (!gGame.isOn) {
        gGame.isOn = true
        placeRandomMines(gBoard, elCell)
        startGame(elCell)

    }
    var cellClasses = elCell.classList
    if (cellClasses.contains('show')) return
    if (cellClasses.contains('hide')) {
        // update the model
        var cellPos = {
            i: +elCell.dataset.i,
            j: +elCell.dataset.j
        }
        gBoard[cellPos.i][cellPos.j].isShown = true
        gGame.shownCount++

        // update the DOM
        elCell.classList.replace('hide', 'show')

        renderBoard(gBoard)
        if (cellClasses.contains('mine')) {
            elCell.innerText = MINE
            gameOver()
        }

        if (!cellClasses.innerText) {
            expandShown(gBoard, cellPos.i, cellPos.j)
        }

        if (checkGameOver()) {
            console.log('you won the game!! to play again click the emoji');
            clearInterval(gIntervalId);
        }
    }

}
// right click
function cellMarked(elCell) {
    if (!gGame.isOn) {
        gGame.isOn = true
        startGame(elCell)

    }
    if (elCell.classList.contains('show')) return

    //    update the model 
    var cellPos = {
        i: +elCell.dataset.i,
        j: +elCell.dataset.j
    }
    var cell = gBoard[cellPos.i][cellPos.j]
    gBoard[cellPos.i][cellPos.j].isMarked = cell.isMarked ? false : true

    // update the DOM
    var value = elCell.innerText
    if (value === EMPTY) {
        elCell.innerText = FLAG
        gGame.markedCount++

    } else if (value === FLAG) {
        elCell.innerText = EMPTY
        gGame.markedCount--
    }
    renderBoard(gBoard)
}
// expention 
function expandShown(board, i, j) {

    var rowIdx = i
    var colIdx = j
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board.length) continue
            if (rowIdx === i && colIdx === j) continue
            var currCell = board[i][j]
            if (currCell.isShown || currCell.isMine || currCell.isMarked) continue

            // update the model 
            board[i][j].isShown = true;
            // update the DOM
            var elNegCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            elNegCell.classList.replace('hide', 'show')
            gGame.shownCount++


            renderBoard(gBoard)
            if (currCell.minesAroundCount === 0) {
                expandShown(board, i, j)
            }
        }
    }
}

function gameOver() {
    document.querySelector('body').style.backgroundColor = 'rgb(58, 10, 10)'
    document.querySelector('.header').style.backgroundColor = 'darkRed'
    console.log('you lost!');
    var elMines = document.querySelectorAll('.mine')
    for (var i = 0; i < elMines.length; i++) {
        var elMine = elMines[i]
        // update the model
        var minePos = {
            i: +elMine.dataset.i,
            j: +elMine.dataset.j
        }
        gBoard[minePos.i][minePos.j].isShown = true
        // update the DOM
        elMines[i].classList.replace('hide', 'show')

        renderBoard(gBoard)

        var elEmoji = document.querySelector('.emoji')
        elEmoji.innerText = '😖'
        clearInterval(gIntervalId);
    }

}

function checkGameOver() {
    var shouldBeShown = gLevel.SIZE ** 2 - gLevel.MINES
    if (gGame.markedCount == gLevel.MINES && gGame.shownCount === shouldBeShown) return true

}
// when clicking the smiley
function restart() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gBoard;
    gStartTime = null
    clearInterval(gIntervalId);
    initGame()
    document.querySelector('.emoji').innerText = '😃'
    document.querySelector('.timer').innerText = '00:00'
    document.querySelector('body').style.backgroundColor = 'rgb(41, 39, 39)'
    document.querySelector('.header').style.backgroundColor = 'rgb(71, 62, 62)'

}
// timer
function startTimer() {
    if (!gStartTime) gStartTime = Date.now()
    gIntervalId = setInterval(updateTime, 100)
}

function updateTime() {
    var diff = Date.now() - gStartTime
    var seconds = diff / 1000
    var secondsArr = (seconds + '').split('.')
    var elTime = document.querySelector('.timer')
    var time = seconds < 10 ? '0' + parseInt(seconds) : parseInt(seconds)
    time += ':'
    time += secondsArr[1] < 10 ? '0' + secondsArr[1] : secondsArr[1] || '00'

    elTime.innerText = time
}