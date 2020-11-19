'use strict'

function undo() {
    console.log(gGame.lastPlayBoard);
    console.log(gBoard);
    gBoard = gGame.lastPlayBoard.slice()
    renderBoard(gBoard)
    console.log('undo');
}

function checkHighScore() {
    var elTime = document.querySelector('.timer')
    var time = elTime.innerText;
    console.log(time);
    var realTimeArr = time.split(':')
    var realTime = realTimeArr[0] + '.' + realTimeArr[1]
    console.log(realTimeArr);
    console.log(realTime);
    var timeIsANum = false
    while (!timeIsANum) {
        if (realTime[0] === '0') realTime = realTime.slice(1, realTime.length)
        if (realTime[realTime.length - 1] === '0') realTime = realTime.slice(0, realTime.length - 1)

        if (realTime[0] !== '0' && realTime[realTime.length - 1] !== '0') timeIsANum = true;
    }
    console.log(realTime);
    console.log(gLevel.highScore);
    console.log(realTime < gLevel.highScore);
    if (realTime < gLevel.highScore) {
        var currLevel = gLevel.level;
        switch (currLevel) {
            case 'beginer':
                gHighScore.beginer = +realTime
                break;
            case 'medium':
                gHighScore.expert = +realTime
                break;
            case 'expert':
                gHighScore.expert = +realTime
                break;

            default:
                return;
        }
        gHighScore.beginer = +realTime
        gLevel.highScore = +realTime
        document.querySelector('.score').innerText = time
    }
}