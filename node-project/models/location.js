class Location {
    constructor(id, address, location, streams) {
        this.id = id;
        this.address = address;
        this.location = location;
        this.streams = streams;
    }

    toString() {
        return JSON.stringify(this);
    }
}

module.exports = Location;