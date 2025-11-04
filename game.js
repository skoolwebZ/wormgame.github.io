const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let mouse = {x: WIDTH/2, y: HEIGHT/2};

document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

function randomColor() {
    return `hsl(${Math.floor(Math.random()*360)}, 80%, 50%)`;
}

// ---- Snake ----
class Snake {
    constructor() {
        this.x = WIDTH / 2;
        this.y = HEIGHT / 2;
        this.dir = 0;
        this.speed = 2.2;
        this.segments = [];
        this.length = 20;
        this.color = randomColor();
    }
    update() {
        // Calculate direction towards mouse
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        this.dir = Math.atan2(dy, dx);

        // Move head
        this.x += Math.cos(this.dir) * this.speed;
        this.y += Math.sin(this.dir) * this.speed;

        // Add current position to segments
        this.segments.unshift({x: this.x, y: this.y});

        // Limit segments to current length
        while (this.segments.length > this.length) this.segments.pop();
    }
    eatOrb() {
        this.length += 10;
    }
    draw(ctx) {
        ctx.save();
        ctx.lineCap = 'round';
        // Draw snake body
        ctx.beginPath();
        for (let i = 0; i < this.segments.length; i++) {
            const seg = this.segments[i];
            if(i===0) ctx.moveTo(seg.x, seg.y);
            else ctx.lineTo(seg.x, seg.y);
        }
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 15;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 25;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw head
        ctx.beginPath();
        ctx.arc(this.x, this.y, 12, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
    collideSelf() {
        // Collide with own body
        for(let i=10; i<this.segments.length; i++) {
            let seg = this.segments[i];
            let dist = Math.hypot(this.x-seg.x, this.y-seg.y);
            if(dist < 14) return true;
        }
        return false;
    }
    outOfBounds() {
        return this.x<0 || this.x>WIDTH || this.y<0 || this.y>HEIGHT;
    }
}

// ---- Orbs ----
let orbs = [];
function spawnOrbs(n) {
    for(let i=0;i<n;i++) {
        orbs.push({
            x: Math.random()*WIDTH,
            y: Math.random()*HEIGHT,
            r: 7 + Math.random()*7,
            color: randomColor()
        });
    }
}

// ---- Game Loop ----
let snake = new Snake();
spawnOrbs(70);

let gameOver = false;

function drawOrbs(ctx) {
    for(const orb of orbs) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, 2*Math.PI);
        ctx.fillStyle = orb.color;
        ctx.globalAlpha = 0.8;
        ctx.shadowColor = orb.color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}

function checkEat() {
    for (let i = orbs.length-1; i >=0; i--) {
        let orb = orbs[i];
        let dist = Math.hypot(snake.x-orb.x, snake.y-orb.y);
        if(dist < orb.r+12) {
            snake.eatOrb();
            orbs.splice(i,1);
        }
    }
    // Replenish if low on orbs
    if(orbs.length < 30) spawnOrbs(15);
}

function drawScore(ctx) {
    ctx.save();
    ctx.font = "bold 23px monospace";
    ctx.fillStyle = '#fff';
    ctx.fillText(`Length: ${snake.length}`, 20, HEIGHT-20);
    ctx.restore();
}

function loop() {
    ctx.clearRect(0,0,WIDTH,HEIGHT);

    if(!gameOver) {
        snake.update();
        checkEat();

        if(snake.collideSelf() || snake.outOfBounds()) {
            gameOver = true;
        }
    }

    drawOrbs(ctx);
    snake.draw(ctx);
    drawScore(ctx);

    // Game Over Text
    if(gameOver) {
        ctx.save();
        ctx.font = "bold 48px monospace";
        ctx.fillStyle = "#f44";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", WIDTH/2, HEIGHT/2-20);
        ctx.font = "bold 25px monospace";
        ctx.fillStyle = "#fff";
        ctx.fillText("Reload page to try again", WIDTH/2, HEIGHT/2+30);
        ctx.restore();
    }

    requestAnimationFrame(loop);
}
loop();
