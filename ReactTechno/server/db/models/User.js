module.exports = class User {
    constructor(options) {
        this.id = options.id;
        //
        this.name = options.name || null;
        this.image = options.image || null;
    }
}