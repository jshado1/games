import Board from './Board.mjs';
import Game from './Game.mjs';
import sounds from './sounds.mjs';

export default function init(
    {
        boardId,
        messageId,
        newGameId,
        sidebarShipsId,
        soundToggleId,
        triesId,
    },
    {
        debug = false,
        difficulty,
    }
) {
    const newGame = document.getElementById(newGameId);
    const soundToggle = document.getElementById(soundToggleId);
    let game;

    const buildGame = () => {
        // these refs must be refreshed each time because the elements get destroyed each time
        const board = document.getElementById(boardId);
        const message = document.getElementById(messageId);
        const sidebarShips = document.getElementById(sidebarShipsId);
        const tries = document.getElementById(triesId);

        game = new Game(difficulty);
        game.board = new Board({
            board,
            message,
            sidebarShips,
            tries,
        }, game);
    };

    newGame.addEventListener('click', buildGame);
    soundToggle.addEventListener('click', () => {
        for (const key in sounds) {
            const sound = sounds[key];
            sound.muted = !sound.muted;
        }
    });

    buildGame();

    if (debug) console.log(game.board.shipLocations);
}
