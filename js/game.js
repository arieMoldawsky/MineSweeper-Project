'use strict';

const MINE = '🎇';
const FLAG = '🚩';

var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gGame = {
    isOn: true, //remember to refactor every new game
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};
var timerInterval;
var gIsFirstClick = true; //remember to refactor every new game
var gBoard;
var gHint;
var gScore = gLevel.MINES;
var gLives = 3;
var gLife = '💛';
var gHints = 3;
var gHintLogo = '💡';

function init() {
    resetGame();
    gBoard = buildBoard();
    renderBoard(gBoard);
    score()
}

function resetGame() {
    clearInterval(timerInterval);
    gGame.isOn = true;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    gHint = false;
    gScore = gLevel.MINES;
    gLives = 3;
    gHints = 3;
    document.querySelector('.hints').innerText = '💡💡💡';
    document.querySelector('.lives').innerText = '💛💛💛';
    document.querySelector('.timer').innerText = gGame.secsPassed;
    var smiley = document.querySelector('.smiley');
    smiley.style = 'animation-iteration-count: 0';
    smiley.innerText = '😀';
    gIsFirstClick = true;
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell;
        }
    }

    // generateMines(board);
    // setMinesNegsCount(board);
    // console.table(board);
    return board;
}

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];

            var cellClass = getClassName({ i: i, j: j })

            if (currCell.isMine === true) cellClass += ' mine';
            else if (currCell.isShown === true) cellClass += ' shown';
            else if (currCell.isMarked === true) cellClass += ' marked';
            if (currCell.isShown === false) {
                strHTML += '\t<td class="' + cellClass + '"  onclick="cellClicked(this, ' + i + ', ' + j + ')" oncontextmenu="return false" onmousedown="rightClick(' + i + ', ' + j + ')">\n';
            } else {
                var colorStr = 'style="background-color: white;"';
                strHTML += '\t<td class="' + cellClass + '"  onclick="cellClicked(this, ' + i + ', ' + j + ')" oncontextmenu="return false" onmousedown="rightClick(' + i + ', ' + j + ')"' + colorStr + '>\n';
            }

            if (currCell.isMine === true && currCell.isShown === true) {
                strHTML += MINE;
            } else if (currCell.isShown === true && currCell.minesAroundCount !== 0) {
                strHTML += currCell.minesAroundCount;
            } else if (currCell.isShown === true && currCell.minesAroundCount === 0) {
                strHTML += ' ';
            } else if (currCell.isMarked === true) {
                strHTML += FLAG;
            }

            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }

    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}

function levelSwitching(level) {
    switch (level) {
        case 'Beginner':
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            // gLives = 2;
            break;
        case 'Medium':
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            // gLives = 3;
            break;
        case 'Expert':
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            // gLives = 3;
            break;
    }
    gScore = gLevel.MINES;
    init();
}

function cellClicked(thisCell, i, j) {
    if (!gGame.isOn) return;

    if (gHints !== 0 && thisCell.classList[0] === 'hints') {
        document.querySelector('.hints').style += '; background-color: rgb(231, 227, 227); box-shadow: 0 0 10px gold;';  
        hintsCount(gHints);
        gHint = true;
        return;
    }

    if (gHint) {
        document.querySelector('.hints').style += '; background-color: rgb(218, 216, 216); box-shadow: 0 0 10px #9ecaed;';
        hint({ i: i, j: j });
        setTimeout(function () { renderBoard(gBoard) }, 700);
        gHint = false;
        return;
    }

    if (thisCell.classList[0] === 'hints' && gHints === 0) {
        alert('No more hints..')
    }

    var currCell = gBoard[i][j];
    if (currCell.isMine === true) {
        gIsFirstClick = false;
        gGame.markedCount += 1;
        currCell.isShown = true;
        lives(gLives);
    }
    if (!currCell.isMine && currCell.minesAroundCount !== 0) {
        currCell.isShown = true;
        gGame.shownCount += 1;
        victorious()
    }
    if (gIsFirstClick === true) {
        expandShown(gBoard, { i: i, j: j })
        generateMines(gBoard);
        setMinesNegsCount(gBoard);
        timerInterval = setInterval(timer, 1000);
        var smiley = document.querySelector('.smiley');
        smiley.style = 'animation-iteration-count: infinite';
    }
    if (!currCell.isMine && currCell.minesAroundCount === 0 && !gIsFirstClick) {
        expandShown(gBoard, { i: i, j: j })
        victorious()
    }
    gIsFirstClick = false;
    renderBoard(gBoard); //to check later if can change to rendering the specific cell instead
    // console.table(gBoard);
}

function hint(pos) {
    var negs = []
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            var negCellPos = { i: i, j: j };
            if (gBoard[negCellPos.i][negCellPos.j].isShown === true) continue
            negs.push(gBoard[negCellPos.i][negCellPos.j]);
        }
    }
    for (var x = 0; x < negs.length; x++) {
        negs[x].isShown = true;
    }
    renderBoard(gBoard);
    for (var x = 0; x < negs.length; x++) {
        negs[x].isShown = false;
    }
}

function hintsCount(hints) {
    switch (hints) {
        case 3:
            gHints -= 1;
            break;
        case 2:
            gHints -= 1;
            break;
        case 1:
            gHints -= 1;
            break;
    }
    var elHints = document.querySelector('.hints');
    var bulbs = '';
    for (var i = 0; i < gHints; i++) {
        bulbs += gHintLogo;
    }
    if (gHints === 0) bulbs = "///";
    elHints.innerText = bulbs;
}

function expandShown(board, pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board.length) continue;
            var negCellPos = { i: i, j: j };
            if (board[negCellPos.i][negCellPos.j].isMine || board[negCellPos.i][negCellPos.j].isShown === true || board[negCellPos.i][negCellPos.j].isMarked) continue;
            else {
                board[i][j].isShown = true;
                gGame.shownCount += 1;
            }
            if (gIsFirstClick === false && board[negCellPos.i][negCellPos.j].minesAroundCount === 0) {
                expandShown(board, { i: i, j: j });
            }
        }
    }
    return board;
}


function rightClick(i, j) {
    var rightclick;
    var e = window.event;
    if (e.which) rightclick = (e.which == 3);
    else if (e.button) rightclick = (e.button == 2);
    if (rightclick && gScore > 0 && gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false;
        renderBoard(gBoard);
        gGame.markedCount -= 1;
        gScore += 1;
        score();
    }
    else if (rightclick && gScore > 0) {
        if (gIsFirstClick === true) {
            gIsFirstClick = false;
            timerInterval = setInterval(timer, 1000);
            var smiley = document.querySelector('.smiley');
            smiley.style = 'animation-iteration-count: infinite';
        }
        gBoard[i][j].isMarked = true;
        renderBoard(gBoard);
        gGame.markedCount += 1;
        gScore -= 1;
        score();
        victorious()
    }
}

function gameOver() {
    clearInterval(timerInterval);
    var smiley = document.querySelector('.smiley');
    smiley.style = 'animation-iteration-count: 0';
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isMine) {
                currCell.isShown = true;
            }
        }
    }
    document.querySelector('.smiley').innerText = '🤕';
    gGame.isOn = false;
    alert('Game_Over');
}

function victorious() {
    if (isVictory()) {
        clearInterval(timerInterval);
        gGame.isOn = false;
        var smiley = document.querySelector('.smiley');
        smiley.style = 'animation-iteration-count: 0';
        smiley.innerText = '😎';
        renderBoard(gBoard);
        alert('You\'re the Winner!');
    }
}

function isVictory() {
    if (gGame.markedCount >= gLevel.MINES && gGame.shownCount >= (gLevel.SIZE * gLevel.SIZE - gLevel.MINES)) {
        return true;
    }
}

function lives(lives) {
    switch (lives) {
        case 3:
            gLives -= 1;
            break;
        case 2:
            gLives -= 1;
            break;
        case 1:
            gameOver();
            break;
    }
    var elLives = document.querySelector('.lives');
    var hearts = '';
    for (var i = 0; i < gLives; i++) {
        hearts += gLife;
    }
    elLives.innerText = hearts;
}



function timer() {
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = gGame.secsPassed;
    gGame.secsPassed++
}

function score() {
    var elScore = document.querySelector('.score');
    elScore.innerText = gScore;
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var currCell = board[i][j];
            var currCellPos = { i: i, j: j };
            countNegs(board, currCellPos, currCell)
        }
    }
    return board;
}

function countNegs(board, pos, currCell) {
    if (currCell.isMine) return;
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board.length) continue;
            var negCellPos = { i: i, j: j };
            if (board[negCellPos.i][negCellPos.j].isMine) {
                currCell.minesAroundCount += 1;
            }
        }
    }
    return board;
}

function generateMines(board) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var minePos = getRandPos(board);
        board[minePos.i][minePos.j].isMine = true;
    }
}

function getRandPos(board) {
    var availablePoses = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isShown || board[i][j].isMine) continue;
            var pos = { i: i, j: j };
            availablePoses.push(pos);
        }
    }
    var randIdx = Math.round(getRandomIntInclusive(0, availablePoses.length - 1));
    var randPos = availablePoses[randIdx];
    return randPos;
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}