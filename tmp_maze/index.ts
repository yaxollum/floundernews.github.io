console.log("hello!");

const cols = 10;
const rows = 10;

let boxSize: number;
let ctx: CanvasRenderingContext2D;

interface Wall {
  u: number;
  v: number;
  type: "horizontal" | "vertical";
}

function coordToId(x: number, y: number): number {
  return x * rows + y;
}

function idToCoord(id: number): [number, number] {
  return [Math.floor(id / rows), id % rows];
}

function randomBoolean(): boolean {
  return Math.random() < 0.5;
}

function drawGridLine(x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo((x1 + 1) * boxSize, (y1 + 1) * boxSize);
  ctx.lineTo((x2 + 1) * boxSize, (y2 + 1) * boxSize);
  ctx.stroke();
}
function paintCanvas() {
  let dpi = window.devicePixelRatio;
  let c = document.getElementById("maze-canvas") as HTMLCanvasElement;
  c.width *= dpi;
  c.height *= dpi;
  ctx = c.getContext("2d")!;

  console.log(`DPI=${dpi}`);
  ctx.scale(dpi, dpi);

  boxSize = c.width / (cols + 2);
  console.log(`boxSize=${boxSize}`);

  c.height = boxSize * (rows + 2);
  ctx.beginPath();

  ctx.rect(boxSize, boxSize, boxSize * cols, boxSize * rows);
  ctx.stroke();

  let unionFind: number[] = [];
  for (let i = 0; i < cols * rows; ++i) {
    unionFind[i] = i;
  }
  let getParent: (u: number) => number = (u) => {
    if (unionFind[u] == u) {
      return u;
    } else {
      return (unionFind[u] = getParent(unionFind[u]));
    }
  };
  let joinSets = (u: number, v: number) => {
    u = getParent(u);
    v = getParent(v);
    unionFind[v] = u;
  };

  let walls: Wall[] = [];
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

  let mazeWalls: Wall[] = [];
  for (let wall of walls) {
    if (getParent(wall.u) == getParent(wall.v)) {
      mazeWalls.push(wall);
    } else {
      joinSets(wall.u, wall.v);
    }
  }

  for (let wall of mazeWalls) {
    let [ux, uy] = idToCoord(wall.u);
    let [vx, vy] = idToCoord(wall.v);
    console.log(ux, uy, vx, vy, wall.type);
    if (wall.type == "horizontal") {
      drawGridLine(ux, uy + 1, ux + 1, uy + 1);
    } else {
      drawGridLine(ux + 1, uy, ux + 1, uy + 1);
    }
  }
}

window.onload = paintCanvas;
