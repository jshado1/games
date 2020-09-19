import Sidebar from './Sidebar.mjs';
import sounds from './sounds.mjs';


class Game {
    _tries = Game.DIFFICULTIES.medium;

    static DIFFICULTIES = Object.create(null, {
        easy:   { value: 45 },
        medium: { value: 38 },
        hard:   { value: 34 },
        expert: { value: 30 },
    });

    get isWon() {
        const { ships } = this.board;
        for (const name in ships) {
            if (ships[name].afloat) return false;
        }

        this.end(true);
    }

    get tries() {
        return this._tries;
    }
    set tries(newVal) {
        this._tries = newVal;
        let message = '';
        let style = '';

        switch (this._tries) {
            case 0:
                this.end(false);
                break;
            case 10:
                message = Sidebar.MESSAGES.low;
                style = Sidebar.MESSAGE_STYLES.warning;
                sounds.tickClock.play();
                break;
            default: break;
        }

        this.board.sidebar.remainingAttemps = this._tries;
        message && this.board.sidebar.displayMessage(message, style);
    }

    constructor(difficulty) {
        difficulty && (this._tries = Game.DIFFICULTIES[difficulty]);
    }

    end(isWon) {
        let message = '';
        let msgStyle = '';

        sounds.tickClock.pause();
        this.board.disable(this.circles);

        if (isWon) {
            sounds.wonGame.play()
            message = Sidebar.MESSAGES.won;
            msgStyle = Sidebar.MESSAGE_STYLES.success;
        } else {
            sounds.lostGame.play();
            message = Sidebar.MESSAGES.lost;
            msgStyle = Sidebar.MESSAGE_STYLES.failure;
        }

        this.board.sidebar.displayMessage(
            message,
            msgStyle,
        );
    }
}

export default Game;
