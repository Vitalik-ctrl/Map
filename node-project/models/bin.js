class Bin {
  constructor(id, volume, type) {
    this.id = id;
    this.volume = volume;
    this.type = type;
  }

  toString() {
    return JSON.stringify(this);
  }
}

module.exports = Bin;