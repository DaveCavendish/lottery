import * as PIXI from 'pixi.js';
import { Game } from './Game';
const load = (app: PIXI.Application) => {
    return new Promise<void>((resolve) => {
        app.loader.add([
            'assets/polly-background-1631651.jpg'
        ]).load(() => {
            resolve();
        });
    });
};

const main = async () => {
    // Actual app
    let app = new PIXI.Application({ width: 1920, height: 1080 });
    // Display application properly
    document.body.style.margin = '0';
    document.title = "Lottery"
    app.renderer.resize(1920, 1080);

    window.addEventListener('resize', resize);

    var ratio = 1920 / 1080;
    // Load assets
    await load(app);

    let game = new Game(app.stage, app.renderer);
    game.init();
    resize();

    app.ticker.add((delta) => {
        update(game, delta)
    });

    document.body.appendChild(app.view);

    function resize() {
        if (window.innerWidth / window.innerHeight >= ratio) {
            var w = window.innerHeight * ratio;
            var h = window.innerHeight;
        }
        else {
            var w = window.innerWidth;
            var h = window.innerWidth / ratio;
        }
        app.renderer.view.style.width = w + 'px';
        app.renderer.view.style.height = h + 'px';
    }
};

function update(game: Game, delta: number): void {
    game.render();
    // renderer.render(game.getRenderer());
};

main();
