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

export default Ship;
