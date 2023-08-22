const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = 1366;
canvas.height = 725;

c.fillRect(0, 0, canvas.width, canvas.height);

const image = new Image();
image.src = './img/ThirdMap.png';

const playerImage = new Image();
playerImage.src = './img/PlayerDown.png';

const playerWidth = 700;
const playerHeight = (playerWidth / playerImage.width) * playerImage.height;

let width = playerImage.width;
let height = playerImage.height;


class Sprite {
    constructor({ position, velocity, image }) {
        this.position = position;
        this.image = image
    }
    draw() {
        c.drawImage(this.image, this.position.x, this.position.y);
    }
};

const background = new Sprite({
    position: {
        x: -820,
        y: -840
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

image.onload = function() {
    animate();
};

function animate() {
    window.requestAnimationFrame(animate);

    background.draw()

    c.drawImage(playerImage,
        0,
        0,
        playerImage.width / 4,
        playerImage.height,
        canvas.width / 2 - playerImage.width / 2,
        canvas.height / 2 - playerHeight / 2,
        playerWidth / 4,
        playerHeight);

        if (keys.w.pressed) {
            background.position.y += 3;
        }
        if (keys.s.pressed) {
            background.position.y -= 3;
        }
        if (keys.a.pressed) {
            background.position.x += 3;
        }
        if (keys.d.pressed) {
            background.position.x -= 3;
        }
}

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = true
            break
        case 'a':
            keys.a.pressed = true
            break
        case 's':
            keys.s.pressed = true
            break
        case 'd':
            keys.d.pressed = true
            break
    }
})

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
    }
})


