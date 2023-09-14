const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1366;
canvas.height = 725;

const collisionsMap = []
for (let i = 0; i < collisions.length; i += 50) {
    collisionsMap.push(collisions.slice(i, 50 + i))
}

const battleZonesMap = []
for (let i = 0; i < battleZonesData.length; i += 50) {
    battleZonesMap.push(battleZonesData.slice(i, 50 + i))
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
        c.fillStyle = 'rgba(255,0,0,0)';
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

const battleZones = []

battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 400)
            battleZones.push(new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y
                }
            })
            )
    })
})

const image = new Image();
image.src = './img/PokeMap.png';

const playerDownImage = new Image();
playerDownImage.src = './img/playerDown.png';

const playerUpImage = new Image();
playerUpImage.src = './img/playerUp.png';

const playerLeftImage = new Image();
playerLeftImage.src = './img/playerLeft.png';

const playerRightImage = new Image();
playerRightImage.src = './img/playerRight.png';

class Sprite {
    constructor({ position, velocity, image, isEnemy = false,
        frames = { max: 1 }, sprites = [], animate = false, rotation = 0, name }) {
        this.position = position;
        this.image = image;
        this.frames = { ...frames, val: 0, elapsed: 0 };
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max;
            this.height = this.image.height;
        }
        this.animate = animate;
        this.sprites = sprites;
        this.opacity = 1;
        this.health = 100;
        this.isEnemy = isEnemy;
        this.rotation = rotation;
        this.name = name;
    }

    draw() {

        c.save();
        c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
        c.rotate(this.rotation);
        c.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2);

        c.globalAlpha = this.opacity;

        c.drawImage(
            this.image,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height)

        c.restore();

        if (this.animate) {
            if (this.frames.max > 1)
                this.frames.elapsed++;

            if (this.frames.elapsed % 10 == 0) {

                if (this.frames.val < this.frames.max - 1)
                    this.frames.val++;
                else
                    this.frames.val = 0;
            }
        }
    }

    attack({ attack, recipient, renderedSprites }) {

        document.querySelector('#dialogue').style.display = 'block';
        document.querySelector('#dialogue').innerHTML = this.name + ' used ' + attack.name;

        let healthBar = '#enemyhealth';
        if (this.isEnemy)
            healthBar = '#pikachuhealth';

        let rotation = 1;
        if (this.isEnemy)
            rotation = -2.2;

        recipient.health -= attack.damage;

        switch (attack.name) {
            case 'Tackle':
                const tl = gsap.timeline();

                let movementDistance = 20;
                if (this.isEnemy) movementDistance = -20;

                tl.to(this.position, {
                    x: this.position.x - movementDistance
                }).to(this.position, {
                    x: this.position.x + movementDistance * 2,
                    duration: 0.1,
                    onComplete: () => {

                        gsap.to(healthBar, {
                            width: recipient.health + '%'
                        });

                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08,
                        });

                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08
                        });
                    }
                }).to(this.position, {
                    x: this.position.x
                })
                break;

            case 'Fireball':
                const fireballImage = new Image();
                fireballImage.src = './img/fireball.png';

                const fireball = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y
                    },
                    image: fireballImage,
                    frames: {
                        max: 4
                    },
                    animate: true,
                    rotation
                });

                gsap.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () => {

                        gsap.to(healthBar, {
                            width: recipient.health + '%'
                        });

                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08,
                        });

                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08,
                            onComplete: () => {
                                renderedSprites.pop();
                            }
                        });
                    }
                })
                break;
        }
    }
};

const player = new Sprite({
    position: {
        x: canvas.width / 2 - 192 / 4 / 2,
        y: canvas.height / 2 - 68 / 2
    },
    image: playerDownImage,
    frames: {
        max: 4
    },
    sprites: {
        up: playerUpImage,
        left: playerLeftImage,
        right: playerRightImage,
        down: playerDownImage
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

const movables = [background, ...boundaries, ...battleZones]

function rectangularCollision({ rectangle1, rectangle2 }) {
    return (rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y)
}

const battle = {
    initiated: false
};

function animate() {
    const animationId = window.requestAnimationFrame(animate);

    background.draw();

    boundaries.forEach(boundary => {
        boundary.draw();
    })

    battleZones.forEach(battleZone => {
        battleZone.draw();
    })

    player.draw();

    let moving = true;
    player.animate = false;

    if (battle.initiated) return;

    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i];
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: battleZone
                })
                && Math.random() < 0.01) {

                window.cancelAnimationFrame(animationId);

                battle.initiated = true;

                gsap.to('#overlap', {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete() {
                        gsap.to('#overlap', {
                            opacity: 1,
                            duration: 0.4,
                            onComplete() {
                                animateBattle();
                                gsap.to('#overlap', {
                                    opacity: 0,
                                    duration: 0.4
                                })
                            }
                        })
                    }
                })
                break;
            }
        }
    }

    if (keys.w.pressed) {

        player.animate = true;

        player.image = player.sprites.up;

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y + 3
                        }
                    }
                })
            ) {
                moving = false;
                break;
            }
        }

        if (moving)
            movables.forEach((movable) => {
                movable.position.y += 3
            })
    } else if (keys.a.pressed) {

        player.animate = true;

        player.image = player.sprites.left;

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x + 3,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                moving = false
                break
            }
        }

        if (moving)
            movables.forEach((movable) => {
                movable.position.x += 3
            })
    } else if (keys.s.pressed) {

        player.animate = true;

        player.image = player.sprites.down;

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y - 3
                        }
                    }
                })
            ) {
                moving = false
                break
            }
        }

        if (moving)
            movables.forEach((movable) => {
                movable.position.y -= 3
            })
    }
    else if (keys.d.pressed) {

        player.animate = true;

        player.image = player.sprites.right;

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x - 3,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                moving = false
                break
            }
        }

        if (moving)
            movables.forEach((movable) => {
                movable.position.x -= 3
            })
    }
}
animate();

const battleBackgroundImg = new Image();
battleBackgroundImg.src = './img/battleBackground.png';

const battleBackground = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    image: battleBackgroundImg
});

const pikachuImg = new Image();
pikachuImg.src = './img/pikachu.png';

const bulbasaurImg = new Image();
bulbasaurImg.src = './img/bulbasaur.png';

const squirtleImg = new Image();
squirtleImg.src = './img/squirtle.png';

const charmanderImg = new Image();
charmanderImg.src = './img/charmander.png';

const pikachu = new Sprite({
    position:
    {
        x: 250,
        y: 200
    },
    image: pikachuImg,
    name: 'Pikachu'
});

const bulbasaur = new Sprite({
    position:
    {
        x: 1000,
        y: 10
    },
    image: bulbasaurImg,
    isEnemy: true,
    name: 'Bulbasaur'
});

const squirtle = new Sprite({
    position:
    {
        x: 1000,
        y: 20
    },
    image: squirtleImg,
    isEnemy: true,
    name: 'Squirtle'
});

const charmander = new Sprite({
    position:
    {
        x: 1030,
        y: 10
    },
    image: charmanderImg,
    isEnemy: true,
    name: 'Charmander'
});

const characters = [bulbasaur, squirtle, charmander];

let currentCharacter = null;

const renderedSprites = [];

function animateBattle() {
    window.requestAnimationFrame(animateBattle);

    battleBackground.draw();
    pikachu.draw();

    if (!currentCharacter) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        currentCharacter = characters[randomIndex];

        const characterNameElement = document.getElementById("enemy");
        characterNameElement.textContent = currentCharacter.name;
    }

    currentCharacter.draw();

    renderedSprites.forEach((sprite) => {
        sprite.draw();
    })
}

animateBattle();

const queue = []

document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', (e) => {
        const selectedAttack = attacks[e.currentTarget.innerHTML];
        pikachu.attack({
            attack: selectedAttack,
            recipient: currentCharacter,
            renderedSprites
        });
        queue.push(() => {

            const attackNames = Object.keys(attacks); 
            const randomAttackName = attackNames[Math.floor(Math.random() * attackNames.length)];
            const randomAttack = attacks[randomAttackName];

            currentCharacter.attack({
                attack: randomAttack,
                recipient: pikachu,
                renderedSprites
            });
        });
    });
});

document.querySelector('#dialogue').addEventListener('click', (e) => {
    if (queue.length > 0) {
        queue[0]()
        queue.shift()
    }
    else
        e.currentTarget.style.display = 'none';
});

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