class Ship {
  get afloat() {
    return !!this.coords.length;
  }

  constructor({
    color,
    name,
    size,
  }) {
    this.color = color;
    this.coords = new Array(size);
    this.name = name;
    this.size = size;
  }
}

const baseShips = Object.create(null);

baseShips.destroyer = {
  color: '#95B544',
  size: 2,
};
baseShips.submarine = {
  color: '#654321',
  size: 3,
};
baseShips.cruiser = {
  color: '#D8B400',
  size: 3,
};
baseShips.battleship = {
  color: '#DD8418',
  size: 4,
};
baseShips.carrier = {
  color: '#CC4D2A',
  size: 5,
};
baseShips.tanker = {
  color: '#700353',
  size: 6,
};

export {
    Ship as default,
    baseShips,
};
