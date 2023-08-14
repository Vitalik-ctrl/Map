
class Stream {
    constructor(id, type, bins) {
        this.id = id;
        this.type = type;
        this.bins = bins;
    }

    toString() {
        return JSON.stringify(this);
    }
}

module.exports = Stream;