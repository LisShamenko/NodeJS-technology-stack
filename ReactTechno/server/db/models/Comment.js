module.exports = class Comment {
    constructor(options) {
        this.id = options.id;
        this.postId = options.postId;
        this.userId = options.userId;
        // 
        this.content = options.content || null;
        this.date = options.date || null;
    }
}