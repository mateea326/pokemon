const monsters = {

    Pikachu: {
        position:
        {
            x: 250,
            y: 200
        },
        image: { src: './img/pikachu.png' },
        name: 'Pikachu',
        attacks: [attacks.Tackle, attacks.Fireball]
    },

    Bulbasaur: {
        position:
        {
            x: 1000,
            y: 10
        },
        image: { src: './img/bulbasaur.png' },
        isEnemy: true,
        name: 'Bulbasaur',
        attacks: [attacks.Tackle, attacks.Fireball]
    },

    Squirtle: {
        position:
        {
            x: 1000,
            y: 20
        },
        image: { src: './img/squirtle.png' },
        isEnemy: true,
        name: 'Squirtle',
        attacks: [attacks.Tackle, attacks.Fireball]
    },

    Charmander: {
        position:
        {
            x: 1030,
            y: 10
        },
        image: { src: './img/charmander.png' },
        isEnemy: true,
        name: 'Charmander',
        attacks: [attacks.Tackle, attacks.Fireball]
    }
};