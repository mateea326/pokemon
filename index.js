const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = 1366;
canvas.height = 725;

const collisionsMap = []
for (let i = 0; i < collisions.length; i += 50) {
    collisionsMap.push(collisions.slice(i, 50 + i))
}

class Boundary {
    static width = 64;
    static height = 64;
    constructor({ position }) {
        this.position = position;
        this.width = 64;
        this.height = 64;
    }

    draw() {
        c.fillStyle = 'red';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

const offset = {
    x: -820,
    y: -840
}

const boundaries = []

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 399)
            boundaries.push(new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y
                }
            })
            )
    })
})

const image = new Image();
image.src = './img/ForthMap.png';

const playerImage = new Image();
playerImage.src = './img/PlayerDown.png';

class Sprite {
    constructor({ position, velocity, image, frames = { max: 1 } }) {
        this.position = position;
        this.image = image;
        this.frames = frames;
        this.width= this.image.width / this.frames.max
    }
    draw() {
        c.drawImage(this.image,
            0,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height)
    }
};

const player = new Sprite({
    position: {
        x: canvas.width / 2 - 700 / 4 / 2,
        y: canvas.height / 2 - 168 / 2
    },
    image: playerImage,
    frames: {
        max: 4
    }
})

const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image
})

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

const testBoundary = new Boundary({
    position: {
        x: 400,
        y: 400
    }
})

function animate() {
    window.requestAnimationFrame(animate);

    background.draw();

    //boundaries.forEach((boundary) => {
    //  boundary.draw()
    //})

    testBoundary.draw();

    player.draw();

    if (player.position.x + player.width >= testBoundary.position.x) {
        console.log("colliding");
    }

    if (keys.w.pressed) {
        {
            background.position.y += 3;
            testBoundary.position.y += 3;
        }
    }
    if (keys.s.pressed) {
        {
            background.position.y -= 3;
            testBoundary.position.y -= 3;
        }
    }
    if (keys.a.pressed) {
        {
            background.position.x += 3;
            testBoundary.position.x += 3;
        }
    }
    if (keys.d.pressed) {
        {
            background.position.x -= 3;
            testBoundary.position.x -= 3;
        }
    }
}

animate();

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
        case 'ArrowUp':
            keys.w.pressed = true
            break
        case 'a':
        case 'ArrowLeft':
            keys.a.pressed = true
            break
        case 's':
        case 'ArrowDown':
            keys.s.pressed = true
            break
        case 'd':
        case 'ArrowRight':
            keys.d.pressed = true
            break
    }
})

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
        case 'ArrowUp':
            keys.w.pressed = false
            break
        case 'a':
        case 'ArrowLeft':
            keys.a.pressed = false
            break
        case 's':
        case 'ArrowDown':
            keys.s.pressed = false
            break
        case 'd':
        case 'ArrowRight':
            keys.d.pressed = false
            break
    }
})