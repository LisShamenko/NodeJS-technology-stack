module.exports = class Post {
    constructor(options) {
        this.id = options.id;
        this.userId = options.userId;
        // 
        this.comments = options.comments || [];
        this.content = options.content || null;
        this.date = options.date || null;
        this.image = options.image || null;
        this.likes = options.likes || [];
    }
}