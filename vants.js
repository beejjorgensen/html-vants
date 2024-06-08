(() => {

const VANTS_COUNT = 8;
const SIM_STEPS_PER_SECOND = 500;

const dirs = [[0,1],[-1,0],[0,-1],[1,0]]; // down, left, up, right

class Vant {
    constructor(x, y, dir) {
        this.x = x;
        this.y = y;
        this.dir = dir;

        this.prev_color = null;
    }
}

function qs(s) {
    return document.querySelector(s);
}

function getPixel(idata, x, y) {
    const index = (x + y * idata.width) * 4;
    const d = idata.data;

    return [ d[index+0], d[index+1], d[index+2], d[index+3] ];
}

function drawPixel(idata, x, y, rgba) {
    let index = (x + y * idata.width) * 4;
    const d = idata.data;

    d[index++] = rgba[0];
    d[index++] = rgba[1];
    d[index++] = rgba[2];
    d[index]   = rgba[3];
}

function animate(c, vants) {
    let prevTimeStamp = null;

    function onFrame(timeStamp) {
        if (prevTimeStamp === null)
            prevTimeStamp = timeStamp - 30;

        const elapsed = timeStamp - prevTimeStamp;
        prevTimeStamp = timeStamp;

        const ctx = c.getContext('2d');
        const idata = ctx.getImageData(0, 0, c.width, c.height);
        const whitePixel = [255,255,255,255];
        const redPixel = [255,0,0,255];
        const bluePixel = [0,0,255,255];

        function hideVants() {
            for (let v of vants)
                if (v.prev_color !== null)
                    drawPixel(idata, v.x, v.y, v.prev_color);
        }

        function moveVants() {
            for (let v of vants) {
                const dx = dirs[v.dir][0];
                const dy = dirs[v.dir][1];

                v.x += dx;
                v.y += dy;

                if (v.x < 0) v.x = c.width - 1;
                if (v.x > c.width - 1) v.x = 0;
                if (v.y < 0) v.y = c.height - 1;
                if (v.y > c.height - 1) v.y = 0;

                const new_color = getPixel(idata, v.x, v.y);

                if (new_color[0] > 127) {  // is red, turn right, change to blue
                    v.dir = (v.dir + 1) % 4;
                    drawPixel(idata, v.x, v.y, bluePixel);
                } else {  // is blue, turn left, change to red
                    v.dir = v.dir == 0? 3: v.dir - 1;
                    drawPixel(idata, v.x, v.y, redPixel);
                }
            }
        }

        function showVants() {
            for (let v of vants) {
                v.prev_color = getPixel(idata, v.x, v.y);
                drawPixel(idata, v.x, v.y, whitePixel);
            }
        }

        hideVants();

        let steps = SIM_STEPS_PER_SECOND * elapsed / 1000;
        steps = Math.max(1, steps); // Don't step less than 1 per frame
        for (let i = 0; i < steps; i++)
            moveVants();

        showVants();

        ctx.putImageData(idata, 0, 0);
        
        requestAnimationFrame(onFrame);
    }

    requestAnimationFrame(onFrame);
}

function randInt(b) {
    return (Math.random() * b) | 0;
}

function onLoad() {
    const vants = [];

    const c = qs('#vants');
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, c.width, c.height);

    for (let i = 0; i < VANTS_COUNT; i++) {
        const v = new Vant(randInt(c.width), randInt(c.height),
            randInt(4));
        vants.push(v);
    }

    animate(c, vants);
}

window.addEventListener('DOMContentLoaded', onLoad);

})();

