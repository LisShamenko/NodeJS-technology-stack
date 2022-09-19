const { GraphQLScalarType } = require('graphql');

module.exports = {
    Query: {
        totalPhotos: (parent, args, context, info) => {
            return context.photos.length;
        },
        allPhotos: (parent, args, context, info) => {
            return context.photos;
        },
    },
    Mutation: {
        postPhoto(parent, args, context, info) {
            let newPhoto = {
                id: context.autoID++,
                ...args
            }
            context.photos.push(newPhoto);
            return newPhoto;
        }
    },
    Photo: {
        url: (parent) => `http://site.com/img/${parent.id}.jpg`
    }
}