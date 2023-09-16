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
image.src = './img/PokemonMap.png';

const waterImage = new Image();
waterImage.src = './img/WaterMap.png';

const playerDownImage = new Image();
playerDownImage.src = './img/playerDown.png';

const playerUpImage = new Image();
playerUpImage.src = './img/playerUp.png';

const playerLeftImage = new Image();
playerLeftImage.src = './img/playerLeft.png';

const playerRightImage = new Image();
playerRightImage.src = './img/playerRight.png';

class Sprite {
    constructor({ position, image, isEnemy = false,
        frames = { max: 1 }, sprites = [], animate = false, rotation = 0, name }) {
        this.position = position;
        this.image = new Image();
        this.frames = { ...frames, val: 0, elapsed: 0 };

        this.image.onload = () => {
            this.width = this.image.width / this.frames.max;
            this.height = this.image.height;
        }

        this.image.src = image.src;
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

        const image = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            width: this.image.width / this.frames.max,
            height: this.image.height
        }

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
}

class Monster extends Sprite {
    constructor({ position, image, frames = { max: 1 }, sprites, animate = false,
        rotation = 0, isEnemy = false, name, attacks
    }) {
        super({
            position,
            image,
            frames,
            sprites,
            animate,
            rotation
        })
        this.health = 100
        this.isEnemy = isEnemy
        this.name = name
        this.attacks = attacks
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
                })
                    .to(this.position, {
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
                    })
                    .to(this.position, {
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

                renderedSprites.splice(1, 0, fireball);

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
                            duration: 0.08
                        });
                        renderedSprites.splice(1, 1);
                    }
                })
                break;
        }
    }

    faint() {
        document.querySelector('#dialogue').innerHTML = this.name + ' fainted!';
        gsap.to(this.position, {
            y: this.position.y + 20
        })
        gsap.to(this, {
            opacity: 0
        })
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

    c.clearRect(0, 0, canvas.width, canvas.height);

    c.drawImage(waterImage, 0, 0, canvas.width * 2.5, canvas.height * 2.5);

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
                                initBattle();
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

const battleBackgroundImg = new Image();
battleBackgroundImg.src = './img/battleBackground.png';

const battleBackground = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    image: battleBackgroundImg
});

let pikachu;
let bulbasaur;
let squirtle;
let charmander;

let currentCharacter;
let renderedSprites;
let battleAnimationId;
let queue;

function initBattle() {

    document.querySelector('#battlebuttons').style.display = 'block';
    document.querySelector('#dialogue').style.display = 'none';
    document.querySelector('#enemyhealth').style.width = '100%';
    document.querySelector('#pikachuhealth').style.width = '100%';
    document.querySelector('#attack').replaceChildren();

    pikachu = new Monster(monsters.Pikachu);
    bulbasaur = new Monster(monsters.Bulbasaur);
    squirtle = new Monster(monsters.Squirtle);
    charmander = new Monster(monsters.Charmander);

    const characters = [bulbasaur, squirtle, charmander];

    const randomIndex = Math.floor(Math.random() * characters.length);
    currentCharacter = characters[randomIndex];

    const characterNameElement = document.getElementById("enemy");
    characterNameElement.textContent = currentCharacter.name;

    renderedSprites = [currentCharacter, pikachu];
    queue = [];

    pikachu.attacks.forEach((attack) => {
        const button = document.createElement('button')
        button.innerHTML = attack.name
        document.querySelector('#attack').append(button)
    })

    document.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML];

            pikachu.attack({
                attack: selectedAttack,
                recipient: currentCharacter,
                renderedSprites
            });

            if (currentCharacter.health <= 0) {
                queue.push(() => {
                    currentCharacter.faint();
                });

                queue.push(() => {
                    gsap.to('#overlap', {
                        opacity: 1,
                        onComplete: () => {
                            cancelAnimationFrame(battleAnimationId);
                            animate();
                            document.querySelector('#battlebuttons').style.display = 'none';

                            gsap.to('#overlap', {
                                opacity: 0
                            })
                            battle.initiated = false;
                        }
                    })
                })
            }

            const randomAttack = pikachu.attacks[Math.floor(Math.random() * pikachu.attacks.length)];

            queue.push(() => {
                currentCharacter.attack({
                    attack: randomAttack,
                    recipient: pikachu,
                    renderedSprites
                });

                if (pikachu.health <= 0) {
                    queue.push(() => {
                        pikachu.faint();
                    });

                    queue.push(() => {
                        gsap.to('#overlap', {
                            opacity: 1,
                            onComplete: () => {
                                cancelAnimationFrame(battleAnimationId);
                                animate();
                                document.querySelector('#battlebuttons').style.display = 'none';

                                gsap.to('#overlap', {
                                    opacity: 0
                                })
                                battle.initiated = false;
                            }
                        })
                    })
                }
            })
        })

        button.addEventListener('mouseenter', (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML];
            document.querySelector('#attacktype').innerHTML = selectedAttack.type;
            document.querySelector('#type').style.background = selectedAttack.color;
        })
    })
}

function animateBattle() {
    battleAnimationId = window.requestAnimationFrame(animateBattle);
    battleBackground.draw();

    renderedSprites.forEach((sprite) => {
        sprite.draw();
    })
}

animate();

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