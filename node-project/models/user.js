class User {
    constructor(id, name, email, locations) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.locations = locations;
    }

    toString() {
        return JSON.stringify(this);
    }
}

module.exports = User;