"use strict";
console.log("hello!");
const cols = 8;
const rows = 8;
let currentPositionId = 0;
let adj = [];
let boxSize;
let ctx;
function coordToId(x, y) {
    return x * rows + y;
}
function idToCoord(id) {
    return [Math.floor(id / rows), id % rows];
}
function randomBoolean() {
    return Math.random() < 0.5;
}
function drawGridLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo((x1 + 1) * boxSize, (y1 + 1) * boxSize);
    ctx.lineTo((x2 + 1) * boxSize, (y2 + 1) * boxSize);
    ctx.stroke();
}
function paintCanvas() {
    let dpi = window.devicePixelRatio;
    let c = document.getElementById("maze-canvas");
    c.width *= dpi;
    c.height *= dpi;
    ctx = c.getContext("2d");
    console.log(`DPI=${dpi}`);
    ctx.scale(dpi, dpi);
    boxSize = c.width / (cols + 2);
    console.log(`boxSize=${boxSize}`);
    c.height = boxSize * (rows + 2);
    ctx.beginPath();
    ctx.rect(boxSize, boxSize, boxSize * cols, boxSize * rows);
    ctx.stroke();
    drawCharacter(false);
    let unionFind = [];
    let prev = [];
    for (let i = 0; i < cols * rows; ++i) {
        unionFind[i] = i;
        adj[i] = [];
    }
    let getParent = (u) => {
        if (unionFind[u] == u) {
            return u;
        }
        else {
            return (unionFind[u] = getParent(unionFind[u]));
        }
    };
    let joinSets = (u, v) => {
        u = getParent(u);
        v = getParent(v);
        unionFind[v] = u;
    };
    let walls = [];
    for (let x = 0; x < cols - 1; ++x) {
        for (let y = 0; y < rows; ++y) {
            walls.push({
                u: coordToId(x, y),
                v: coordToId(x + 1, y),
                type: "vertical",
            });
        }
    }
    for (let x = 0; x < cols; ++x) {
        for (let y = 0; y < rows - 1; ++y) {
            walls.push({
                u: coordToId(x, y),
                v: coordToId(x, y + 1),
                type: "horizontal",
            });
        }
    }
    for (let i = walls.length - 1; i > 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        [walls[i], walls[j]] = [walls[j], walls[i]];
    }
    let mazeWalls = [];
    let startCell = coordToId(0, 0);
    let endCell = coordToId(cols - 1, rows - 1);
    for (let wall of walls) {
        if (getParent(wall.u) == getParent(wall.v)) {
            mazeWalls.push(wall);
        }
        else {
            joinSets(wall.u, wall.v);
            adj[wall.u].push(wall.v);
            adj[wall.v].push(wall.u);
        }
    }
    let dfs = (u, parent) => {
        prev[u] = parent;
        for (let v of adj[u]) {
            if (v != parent) {
                dfs(v, u);
            }
        }
    };
    dfs(startCell, startCell);
    let path = [];
    let i = endCell;
    while (i != startCell) {
        path.push(i);
        i = prev[i];
    }
    let indexCut = Math.floor(path.length / 2);
    let uCutWall = path[indexCut];
    let vCutWall = path[indexCut + 1];
    adj[uCutWall].splice(adj[uCutWall].indexOf(vCutWall), 1);
    adj[vCutWall].splice(adj[vCutWall].indexOf(uCutWall), 1);
    let [ux, uy] = idToCoord(uCutWall);
    let [vx, vy] = idToCoord(vCutWall);
    ctx.strokeStyle = "red";
    if (ux == vx) {
        drawGridLine(ux, (uy + vy + 1) / 2, ux + 1, (uy + vy + 1) / 2);
    }
    else if (uy == vy) {
        drawGridLine((ux + vx + 1) / 2, uy, (ux + vx + 1) / 2, uy + 1);
    }
    ctx.strokeStyle = "black";
    for (let wall of mazeWalls) {
        let [ux, uy] = idToCoord(wall.u);
        let [vx, vy] = idToCoord(wall.v);
        if (wall.type == "horizontal") {
            drawGridLine(ux, (uy + vy + 1) / 2, ux + 1, (uy + vy + 1) / 2);
        }
        else {
            drawGridLine((ux + vx + 1) / 2, uy, (ux + vx + 1) / 2, uy + 1);
        }
    }
}
function drawCharacter(erase) {
    let [current_x, current_y] = idToCoord(currentPositionId);
    ctx.beginPath();
    ctx.arc((current_x + 1.5) * boxSize, (current_y + 1.5) * boxSize, erase ? boxSize / 2.5 : boxSize / 3, 0, 2 * Math.PI);
    ctx.fillStyle = erase ? "white" : "green";
    ctx.fill();
}
window.addEventListener("keydown", (e) => {
    e.preventDefault();
    let delta_x = 0;
    let delta_y = 0;
    if (e.key == "ArrowLeft" || e.key == "a") {
        delta_x = -1;
    }
    else if (e.key == "ArrowRight" || e.key == "d") {
        delta_x = 1;
    }
    else if (e.key == "ArrowUp" || e.key == "w") {
        delta_y = -1;
    }
    else if (e.key == "ArrowDown" || e.key == "s") {
        delta_y = 1;
    }
    console.log(delta_x, delta_y);
    let [current_x, current_y] = idToCoord(currentPositionId);
    let [new_x, new_y] = [current_x + delta_x, current_y + delta_y];
    let newPositionId = coordToId(new_x, new_y);
    if (adj[currentPositionId].includes(newPositionId)) {
        drawCharacter(true);
        currentPositionId = newPositionId;
        drawCharacter(false);
    }
});
window.onload = paintCanvas;
