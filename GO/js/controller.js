let canvas = document.querySelector('#myCanvas');
let width = canvas.width;
let height = canvas.height;
let ctx = canvas.getContext('2d');
let grid = 30;

let note = '<p>请黑棋先行。</p>';
function controller() {
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(0, 0, width, height);
    //棋盘背景
    let img = new Image;
    img.src = 'wood.jpg';
    ctx.drawImage(img, 0, 0);

    // 19*19
    // 分割成 20 * 20
    //绘制棋盘网格
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.strokeRect(0, 0, width, height);
    for (let i = 1; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(grid, grid * i);
        ctx.lineTo(grid*19, grid * i);
        ctx.closePath();
        ctx.stroke();
    }

    for (let i = 1; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(grid * i, grid);
        ctx.lineTo(grid * i, grid*19);
        ctx.closePath();
        ctx.stroke();
    }

    //绘制星位
    let pos = [[3, 3], [3, 9], [3, 15],
        [9, 3], [9, 9], [9, 15],
        [15, 3], [15, 9], [15, 15]];

    for(let i = 0; i < 9; i++) {
        ctx.beginPath();
        ctx.arc(pos[i][0]*grid + grid, pos[i][1]*grid + grid, 5, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fill();
    }

    //绘制坐标
    ctx.fillStyle = 'black';
    ctx.font = '18px consolas';
    for(let i = 1; i < 20; i++) {
        ctx.fillText(i.toString(), grid * i-5,25);
    }
    for(let i = 1; i < 20; i++) {
        ctx.fillText(String.fromCharCode(64 + i), 15,grid * i+5);
    }

    updateText();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(19.5 * grid, 19.5 * grid, 12, 0, 2*Math.PI);
    ctx.closePath();
    ctx.fill();
}

controller();

//二维数组存储棋盘内容
// 0 空 1 黑 2 白
//bd[i][j] 表示 第 i 行， 第 j 列的状态
let broad = [], tmp = [];
let lastbroad = [];
for(let i = 0; i <= 20; i++) {
    broad[i] = []; tmp[i] = [];
    lastbroad[i] = [];
    for(let j = 0; j <= 20; j++) {
        broad[i][j] = tmp[i][j] = 0;
        lastbroad[i][j] = 0;
    }
}

//绘制当前落子情况
function drawAll() {
    //绘制棋盘
    controller();

    //bfs 消除没有“气”的子
    bfs();
    console.log("bfs finished.");
    //绘制新棋子位置
    for(let i = 1; i < 20; i++) {
        for(let j = 1; j < 20; j++) {
            if(broad[i][j] === 0) {
                continue;
            }
            if(broad[i][j] === 1) {
                ctx.fillStyle = 'black';
            } else {
                ctx.fillStyle = 'white';
            }
            ctx.beginPath();
            ctx.arc(i * grid, j * grid, 12, 0, 2*Math.PI);
            ctx.closePath();
            ctx.fill();
        }
    }
}

let dx = [1, -1, 0, 0];
let dy = [0, 0, 1, -1];

let visit = [];
for(let i = 0; i <= 20; i++) {
    visit[i] = [];
    for(let j = 0; j <= 20; j++) {
        visit[i][j] = 0;
    }
}

function bfs() {
    for(let i = 0; i <= 20; i++) {
        for(let j = 0; j <= 20; j++) {
            tmp[i][j] = broad[i][j];
        }
    }
    for(let i = 1; i < 20; i++) {
        for(let j = 1; j < 20; j++) {
            clear();
            if(broad[i][j] === 0)    continue;
            let goal = go(i, j, broad[i][j]);
            console.log(i, j, goal);
            //无气死子
            if(goal === 0) {
                tmp[i][j] = 0;
            }
        }
    }
    for(let i = 0; i <= 20; i++) {
        for (let j = 0; j <= 20; j++) {
            broad[i][j] = tmp[i][j];
        }
    }

    function clear() {
        for(let i = 0; i <= 20; i++) {
            for(let j = 0; j <= 20; j++) {
                visit[i][j] = 0;
            }
        }
    }
    function  go(x, y, col) {
        console.log("go: ", x, y);
        visit[x][y] = 1;
        let res = 0;
        for(let i = 0; i < 4; i++) {
            let xx = x + dx[i];
            let yy = y + dy[i];
            if(!check(xx, yy) || visit[xx][yy])  continue;
            if(broad[xx][yy] === 0) {
                res++;
            } else if(broad[xx][yy] === col) {
                res += go(xx, yy, col);
            }
        }
        return res;
    }
    function check(x, y) {
        if(x === 0 || x === 20 ||
        y === 0 || y === 20) {
            return 0;
        }
        return 1;
    }
}

function restart() {
    controller();
    for(let i = 0; i <= 20; i++) {
        for(let j = 0; j <= 20; j++) {
            broad[i][j] = 0;
            tmp[i][j] = 0;
            lastbroad[i][j] = 0;
        }
    }
    note = '<p>棋盘已重置，请黑棋先行。</p>';
    updateText();
}

//(370, 70) -> (910, 610)
let color = 'black';

function locate(event) {
    //备份棋盘，悔棋使用
    for(let i = 0; i <= 20; i++) {
        for(let j = 0; j <= 20; j++) {
            lastbroad[i][j] = broad[i][j];
        }
    }

    let x = event.clientX - 370;
    let y = event.clientY - 70;
    // console.log(x, y);
    //x%30 判断
    let posX = Math.floor(x/30) + 1, posY = Math.floor(y/30) + 1;
    if(x%30 >= 15) {
        posX++;
    }
    if(y%30 >= 15) {
        posY++;
    }
    console.log(posX, posY);
    //检查越界
    if (posX === 0 || posX === 20
        || posY === 0 || posY === 20) {
        return;
    }
    //检查是否已经有子
    if(broad[posX][posY] !== 0) {
        // alert("请在其他地方落子。");
        note = '<p>请在其他地方落子。</p>' + note;
        updateText();
        return;
    }
    if(color === 'black') {
        broad[posX][posY] = 1;
    } else {
        broad[posX][posY] = 2;
    }
    console.log(broad[posX][posY]);

    //先移除此次落子之后无气的子
    drawAll();
    //因为在“打劫”的时候，棋子落下去时也是没有气的因此会被移除
    //再次落子，然后绘图可以避免这种情况
    if(color === 'black') {
        broad[posX][posY] = 1;
    } else {
        broad[posX][posY] = 2;
    }
    drawAll();
    if(color === 'black') {
        color = 'white';
    } else {
        color = 'black';
    }
    //提示此时哪方回合
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(19.5 * grid, 19.5 * grid, 12, 0, 2*Math.PI);
    ctx.closePath();
    ctx.fill();

    if(color === 'black') {
        note = '<p>[白棋]->' + '(' + String.fromCharCode(64 + posY) + ', ' + posX.toString() + ')</p>' + note;
    } else {
        note = '<p>[黑棋]->' + '(' + String.fromCharCode(64 + posY) + ', ' + posX.toString() + ')</p>' + note;
    }
    updateText();
}

function huiqi() {
    //恢复棋盘
    for(let i = 0; i <= 20; i++) {
        for(let j = 0; j <= 20; j++) {
            broad[i][j] = lastbroad[i][j];
        }
    }
    //更换回合
    if(color === 'black') {
        color = 'white';
    } else {
        color = 'black';
    }
    drawAll();
    //提示此时哪方回合
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(19.5 * grid, 19.5 * grid, 12, 0, 2*Math.PI);
    ctx.closePath();
    ctx.fill();

    if(color === 'black') {
        note = '<p>请黑棋重新落子。</p>' + note;
    } else {
        note = '<p>请白棋重新落子。</p>' + note;
    }
    updateText();
}

function updateText() {
    let noteText = document.getElementById('text');
    noteText.innerHTML = note;
}