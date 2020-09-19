import Ship, { baseShips } from './Ship.mjs';
import Sidebar from './Sidebar.mjs';
import sounds from './sounds.mjs';
import concatPoints from './concatPoints.mjs';


class Board {
	dimensions = Object.create(null, {
		cols: { value: 8 },
		rows: { value: 8 },
	});

	/**
	 * A mapping of coordinates to DOM nodes
	 * @type {Hashmap}
	 * @example
		{
		  '0.0': <div>,
		  '0.1': <div>,
		}
	 */
	circles = Object.create(null);
    /**
     * A hashmap of ship details, keyed by ship name.
     * @type {Hashmap}
     * @example
        {
            'battleship': Ship,
            'carrier': Ship,
            'cruiser': Ship,
            'destroyer': Ship,
            'submarine': Ship,
            'tanker': Ship,
        }
     */
    ships = Object.create(null);
	/**
	 * A mapping of ship references keyed by x,y coordinates
	 * @type {Hashmap}
	 * @example
		{
		  '0.0': ships.destroyer,
		  '0.1': ships.destroyer,
		  '3.2': ships.submarine,
		  '4.2': ships.submarine,
		}
	 */
	shipLocations = Object.create(null);

	constructor({
		board,
		message,
		sidebarShips,
		tries,
	}, game) {
		this.elm = board;
		this.game = game;

		this.circleCount = this.dimensions.cols * this.dimensions.rows;
        this.circlesKeyList = new Array(this.circleCount);

		this.handleClick = this.handleClick.bind(this);

		this.reset({
			message,
			sidebarShips,
			tries,
		});
	}

	genCoords(direction, edge, ship) {
		const {
			circleCount,
			circlesKeyList,
			shipLocations,
		} = this;

		// pick a random circle (coordinate) to start from
		const startPoint = Math.floor(Math.random() * circleCount - 1) + 1;
		const startingCoord = circlesKeyList[startPoint];
		const [col, row] = startingCoord.split('.');

		let point = 0;
		let staticPoint = 0;

		if (direction === 'vertical') {
			point = +col;
			staticPoint = +row;
		} else {
			point = +row;
			staticPoint = +col;
		}

		const endPoint = point + ship.size;

		if (
			shipLocations[startingCoord] // ensure start coord doesn't already have a ship
			|| endPoint + 1 > edge // ensure ship won't hang over the edge
		) {
			return;
		}

		const coordList = new Array(ship.size);

		for (let c = ship.size - 1; c > -1; c--) {
			const coord = concatPoints(direction, point++, staticPoint);

			if (shipLocations[coord]) return; // abort! intersection detected

			coordList[c] = coord;
		}

		return coordList;
	}

	disable(circles) {
		this.elm.removeEventListener('click', this.handleClick);

		for (const coord in circles) {
			const circle = circles[coord];
			circle.classList.add('noMove');
			circle.removeEventListener('mouseover', this.handleHover);
		}
	}

	handleClick({ target }) {
		if (!target.classList.contains('circle')) return;

		target.disabled = true;

		if (target.bombed) return this.sidebar.displayMessage(
			Sidebar.MESSAGES.repeated,
			Sidebar.MESSAGE_STYLES.neutral,
		);

		target.bombed = true;

		const { shipLocations } = this;
		const { id } = target;
		const ship = shipLocations[id];

		if (ship) { // hit!
			const remainingHits = this.hitShip(id, shipLocations);
			const { hitShip } = sounds;

			target.style.setProperty('--circle-color', ship.color);

			hitShip.currentTime = 0;
			hitShip.play();

			if (!remainingHits) this.sinkShip(ship);
		} else this.missShip(target);

		--this.game.tries;
	}

	handleHover() {
		const { mouseOver } = sounds;

		mouseOver.currentTime = 0;
		mouseOver.play()
			.catch(() => {}); // silence useless "user hasn't interacted with document"
	}

	hitShip(coord, shipLocations) {
		const ship = shipLocations[coord];
		const coordList = ship.coords;
		const coordIdx = coordList.indexOf(coord);

		coordList.splice(coordIdx, 1);

		delete shipLocations[coord];

		this.sidebar.displayMessage(
			Sidebar.MESSAGES.hit(ship.name),
			Sidebar.MESSAGE_STYLES.warning,
		);
		this.sidebar.hitShip(ship.name, false);

		return coordList.length;
	}

	missShip(circle) {
		const { missShip } = sounds;

		circle.classList.add('miss');

		this.sidebar.displayMessage(
			Sidebar.MESSAGES.missed,
			Sidebar.MESSAGE_STYLES.failure,
		);

		missShip.currentTime = 0;
		missShip.play();
	}

	reset({
        message,
        sidebarShips,
        tries,
    }) {
        let board = this.elm;

        if (board.children.length) { // clear existing
            const parent = this.elm.parentElement;
            const id = this.elm.id;
            const classNames = [...this.elm.classList];

            parent.removeChild(this.elm);

            board = document.createElement('div');

            board.id = id;
            board.classList.add(classNames);

            this.elm = parent.appendChild(board);
        }

		const {
			circles,
			circleCount,
			circlesKeyList,
			dimensions: {
				cols,
			},
			ships,
		} = this;
		const frag = document.createDocumentFragment();
		let col = 0;
		let row = 0;

		for (let i = 0; i < circleCount; i++) {
			const circle = document.createElement('button');
			const isEndOfRow = (
				i !== 0
				&& !((i + 1) % cols)
			); // end=7
			const coords = `${col}.${row}`; // x.y

			circle.className = 'circle';
			circle.addEventListener('mouseover', this.handleHover);

			circlesKeyList[i] = circle.id = coords;
			circles[coords] = circle;

			if (isEndOfRow) {
				row++;
				col = 0;
			} else {
				col++;
			}

			frag.appendChild(circle);
		}

		this.elm.appendChild(frag);

        for (const shipName in baseShips) {
            const baseShip = baseShips[shipName];

            const ship = ships[shipName] = new Ship({
                ...baseShip,
                name: shipName,
            });

            this.setShipCoords(ship);
        }

        this.sidebar = new Sidebar(
			ships,
			this.game.tries,
			{
				message,
				sidebarShips,
				tries,
			},
		);

		this.elm.addEventListener('click', this.handleClick);
	}

	setShipCoords(ship) {
		const {
			cols,
			rows,
		} = this.dimensions;
		let coordList = [];
		let invalidPlace = true;
		let placementAttemps = 0;

		while (invalidPlace) {
			let direction = '';
			let edge = 0;

			if (Math.round(Math.random()) === 0) {
				direction = 'vertical';
				edge = cols;
			} else {
				direction = 'horizontal';
				edge = rows;
			}

			coordList = this.genCoords(direction, edge, ship);

			if (coordList) {
				for (let c = coordList.length - 1; c > -1; c--) {
					const coord = coordList[c];
					this.shipLocations[coord] = ship;
					ship.coords[c] = coord;
				}
				// this.board.sidebar.addShip(ship);
				invalidPlace = false;
			}
			if (++placementAttemps === 99) {
				console.error(`Can't place ${ship.name}!`);
				invalidPlace = false;
			}
		}
	}

	sinkShip(ship) {
		const { name } = ship;

		this.sidebar.displayMessage(
		  Sidebar.MESSAGES.sank(ship.name),
		  Sidebar.MESSAGE_STYLES.success,
		);

		this.sidebar.hitShip(name, true);
		sounds.sunkShip.play();
		this.game.isWon;
	}
}

export default Board;
