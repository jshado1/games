class Sidebar {
    static MESSAGE_STYLES = Object.create(null, {
        failure: { value: 'failure-text' },
        neutral: { value: 'neutral-text' },
        success: { value: 'success-text' },
        warning: { value: 'warning-text' },
    });

    static MESSAGES = Object.create(null, {
        lost:     { value: '☠️ Game over! You lost :(' },
        hit:      { value: (name) => `☄️ You hit the ${name}` },
        low:      { value: 'Almost out!' },
        missed:   { value: '💨 You missed…' },
        repeated: { value: 'You have already bombed that location…' },
        sank:     { value: (name) => `💥 You sank ${name}!` },
        start:    { value: 'Fire at will' },
        won:      { value: '🎉 Congratulations! You sank all ships!' },
    });

    counters = Object.create(null);

    elms = Object.create(null);

    set remainingAttemps(count) {
        this.elms.tries.textContent = count;
    }

    constructor(ships, shots, { message, sidebarShips, tries }) {
        this.elms.message = message;
        this.elms.sidebarShips = sidebarShips;
        this.elms.tries = tries;

        this.remainingAttemps = shots;
        this.ships = ships;

        this.reset(ships);
    }

    addShip({
        color,
        coords,
        name
    }) {
        const row = this.counters[name] = document.createElement('div');

        row.classList.add('circles', `${name}-row`);

        for (let i = 0; i <= coords.length - 1; i++) {
            const circle = document.createElement('div');

            circle.classList.add('circle', name);
            circle.style.setProperty('--sidebar-circle-color', color);

            row.appendChild(circle);
        }

        this.elms.sidebarShips.appendChild(row);
    }

    displayMessage(text = '', style = Sidebar.MESSAGE_STYLES.neutral) {
        const { message } = this.elms;

        message.textContent = text;

        while (message.classList.length) message.classList.remove(message.classList.item(0));

        style && message.classList.add(style);
    }

    hitShip(name, full) {
        const shipCircles = this.counters[name].children;;
        const ship = this.ships[name];
        const { size, coords } = ship;
        const remainingIdx = coords.length - 1;

        for (let c = size - 1; c > remainingIdx; c--) shipCircles[c].classList.add('hit');
    }

    reset(ships) {
        let { sidebarShips } = this.elms;

        if (sidebarShips.children.length) { // clear existing
            const parent = sidebarShips.parentElement;
            const id = sidebarShips.id;
            const classNames = [...sidebarShips.classList];

            parent.removeChild(sidebarShips);

            sidebarShips = document.createElement('div');

            sidebarShips.id = id;
            classNames.length && sidebarShips.classList.add(classNames);

            this.elms.sidebarShips = parent.appendChild(sidebarShips);
        }

        for (const shipName in ships) this.addShip(ships[shipName]);

        this.displayMessage(Sidebar.MESSAGES.start);
    }
}

export default Sidebar;
