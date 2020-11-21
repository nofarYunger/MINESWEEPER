'use strict'


function checkHighScore() {
    var time = document.querySelector('.timer').innerText;
    var realTimeArr = time.split(':')
    var realTime = realTimeArr[0] + '.' + realTimeArr[1] /*makes a str like : '07.12' */

    // take down all the useless zeros(not sure if necessary yet)
    var timeIsANum = false;
    while (!timeIsANum) {
        if (realTime[0] === '0') realTime = realTime.slice(1, realTime.length);
        if (realTime[realTime.length - 1] === '0') realTime = realTime.slice(0, realTime.length - 1);

        if (realTime[0] !== '0' && realTime[realTime.length - 1] !== '0') timeIsANum = true;
    }
    // save the high score in the right level
    if (realTime < gLevel.highScore) {
        var currLevel = gLevel.level;
        switch (currLevel) {
            case 'beginer':
                gHighScore.beginer = +realTime;
                break;
            case 'medium':
                gHighScore.medium = +realTime;
                break;
            case 'expert':
                gHighScore.expert = +realTime;
                break;

            default:
                return;
        }
        // update the model
        gLevel.highScore = +realTime;
        // update the DOM
        document.querySelector('.score').innerText = time;
    }
}
// when undo is clicked
function undo() {
    console.table(gPlayedMoves);
    var lastBoard = gPlayedMoves[0]
    console.log(lastBoard);
    gPlayedMoves.slice(0, 1)
    console.log(gPlayedMoves.slice(0, 1));
    renderBoard(lastBoard)
    gGame.turnCount--

}
// copy the current gBoard and save it in the gPlayedMoves
function duplicate() {
    var dupBoard = []
    for (var i = 0; i < gBoard.length; i++) {
        dupBoard[i] = gBoard[i].slice()

    }
    return dupBoard;
}

// takes a life every time the user clicks on a mine
function clickAMine(elCell, cellPos) {
    if (gGame.lives !== 0) var audio = new Audio('./audio/error.mp3');
    else var audio = new Audio('./audio/gameOver.mp3');

    audio.play();

    setTimeout(changeMineBackToHide, 500, elCell, cellPos)
}

// hide mine after a click 
function changeMineBackToHide(elCell, cellPos) {
    if (gGame.lives !== 0) {

        // update the model
        gBoard[cellPos.i][cellPos.j].isShown = false;
        // update the DOM
        elCell.classList.replace('show', 'hide');
        renderBoard(gBoard);
    }
}

// render the hearts 
function renderLives() {
    var elLives = document.querySelector('.lives');
    switch (gGame.lives) {
        case 3:
            elLives.innerHTML = `${LIFE}${LIFE}${LIFE}`
            break;
        case 2:
            elLives.innerHTML = `${LIFE}${LIFE}${blk_LIFE}`
            break;
        case 1:
            elLives.innerHTML = `${LIFE}${blk_LIFE}${blk_LIFE}`
            break;
        case 0:
            elLives.innerHTML = `${blk_LIFE}${blk_LIFE}${blk_LIFE}`
            break;
        default:
            break;
    }
}

// on safe click
function safeClick() {
    var safeCells = getSafeCells(gBoard)
    var randIdx = getRandomInt(0, safeCells.length)
    var safeCell = safeCells[randIdx]
    // update the DOM
    var elSafeCell = document.querySelector(`[data-i="${safeCell.i}"][data-j="${safeCell.j}"]`)
    elSafeCell.classList.add('safe')
    setTimeout(function () {
        elSafeCell.classList.remove('safe')
    }, 500)
    --gGame.safeClicks
    document.querySelector('.numOfSafeClicks').innerText = gGame.safeClicks
    if (gGame.safeClicks === 0) {
        document.querySelector('.safeBtn').classList.add('btnOff')
    }

}

// find all the cells that arent a mine
function getSafeCells(board) {
    var safeCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (!board[i][j].isMine && !board[i][j].isShown && !board[i][j].isMarked) {
                var safeCellPos = { i, j }
                safeCells.push(safeCellPos)
            }
        }
    }
    return safeCells;
}

// prints the hints at the start of the game
function renderHints() {
    var elHints = document.querySelector('.hints')
    elHints.innerHTML = `${HINT}${HINT}${HINT}`
}

// go over the board and place a class that activate the hint function
function toggleHintClassToAllCells(elLight) {
    if (elLight) {
        elLight.src = 'imgs/lightOff.png'
        elLight.classList.add('btnOff')
    }
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j].isHintOn = (!gBoard[i][j].isHintOn) ? true : false
        }
    }
    renderBoard(gBoard)
}

// go over all the negs and make them show up
function lightUpOnClick(elCell) {
    var cellPos = {
        i: +elCell.dataset.i,
        j: +elCell.dataset.j
    }
    var cellsAlreadyShown = []
    for (var i = cellPos.i - 1; i <= cellPos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellPos.j - 1; j <= cellPos.j + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue

            if (gBoard[i][j].isShown) cellsAlreadyShown.push(gBoard[i][j]);

            gBoard[i][j].isShown = true
        }
    }
    renderBoard(gBoard)


    toggleHintClassToAllCells()
    setTimeout(lightsOff, 500, cellsAlreadyShown, cellPos)
}

// after .5 sec make the hint dissappear
function lightsOff(cellsAlreadyShown, cellPos) {

    for (var i = cellPos.i - 1; i <= cellPos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellPos.j - 1; j <= cellPos.j + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue

            gBoard[i][j].isShown = false
        }
    }

    for (var i = 0; i < cellsAlreadyShown.length; i++) {
        cellsAlreadyShown[i].isShown = true
    }

    renderBoard(gBoard)
}

