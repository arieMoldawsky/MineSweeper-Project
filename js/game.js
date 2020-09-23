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

function init() {
    resetGame();
    gBoard = buildBoard();
    renderBoard(gBoard);
}

function resetGame() {
    clearInterval(timerInterval);
    gGame.isOn = true;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    document.querySelector('.timer').innerText = gGame.secsPassed;
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

    generateMines(board);
    setMinesNegsCount(board);
    console.table(board);
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
            break;
        case 'Medium':
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            break;
        case 'Expert':
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            break;
    }
    init();
}

function cellClicked(thisCell, i, j) {
    if (!gGame.isOn) return;

    var currCell = gBoard[i][j];
    if (currCell.isMine === true) {
        gIsFirstClick = false;
        gameOver();
    }
    if (!currCell.isMine && currCell.minesAroundCount === 0) {
        findNegs(gBoard, { i: i, j: j })
        victory();
    }
    if (!currCell.isMine && currCell.minesAroundCount !== 0) { 
        currCell.isShown = true;
        gGame.shownCount += 1;
        victory();
    }
    if (gIsFirstClick === true) {
        timerInterval = setInterval(timer, 1000);
    }
    gIsFirstClick = false;
    renderBoard(gBoard); //to check later if can change to rendering the specific cell instead
    console.log(gGame.shownCount);
    console.table(gBoard);
}

function findNegs(board, pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board.length) continue;
            var negCellPos = { i: i, j: j };
            if (board[negCellPos.i][negCellPos.j].isMine) continue;
            else {
                board[i][j].isShown = true;
                gGame.shownCount += 1;
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
    if (rightclick) {
        gBoard[i][j].isMarked = true;
        renderBoard(gBoard);
        gGame.markedCount += 1;
        victory();
    }
    // return rightclick;
    // alert(rightclick); 
}

// function renderCell(location, value) {
// 	var cellSelector = '.' + getClassName(location)
// 	var elCell = document.querySelector(cellSelector);
// 	elCell.innerHTML = value;
// }

function gameOver() {
    clearInterval(timerInterval);
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isMine) {
                currCell.isShown = true;
            }
        }
    }
    gGame.isOn = false;
}

function victory() {
    if (gGame.markedCount === gLevel.MINES && gGame.shownCount === (gLevel.SIZE * gLevel.SIZE - gLevel.MINES)) {
        clearInterval(timerInterval);
        alert('You\'re the Winner!')
        return true;
    }
}


function timer() {
    var timeDisplay = document.querySelector('.timer');
    timeDisplay.innerText = gGame.secsPassed;
    gGame.secsPassed++
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
    var positions = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var pos = { i: i, j: j };
            positions.push(pos);
        }
    }
    var randPos = positions[Math.round(getRandomIntInclusive(0, positions.length - 1))];
    return randPos;
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}