import React from 'react'
import ReactDOM from 'react-dom';

// 
import { ApolloClient, InMemoryCache, gql, useSubscription, useMutation, useQuery, ApolloProvider } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { createUploadLink } from 'apollo-upload-client';



// 
const client = createClient({
    url: 'ws://localhost:4000/graphql',
    connectionParams: {
        authToken: "token"
    }
});

const wsLink = new GraphQLWsLink(client);

// функция createUploadLink создает ссылку, которая поддерживает запросы 
//      'multipart/form-data', содержащие файлы загрузки
const uploadLink = createUploadLink({ uri: 'http://localhost:4000/graphql' });

const httpLink = new HttpLink({ uri: 'http://localhost:4000/graphql' });

const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink,
    uploadLink, // httpLink,
);

// 
const apolloClient = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache()
});


// 
const SUBSCRIPTION_PHOTOS = gql`
    subscription {
        newPhoto {
            name
        }
    }
`;
function ShowNewPhoto() {
    const { data, loading } = useSubscription(SUBSCRIPTION_PHOTOS);
    if (loading) return 'subscription...';
    return (
        <div>
            <p>JSON: {JSON.stringify(data)}</p>
            <p>Name: {data.newPhoto.name}</p>
        </div>
    );
}


// 
const MUTATION_PHOTOS = gql`
    mutation postPhoto($input: PostPhotoInput!) {
        postPhoto(input:$input) {
            id
            name
            description
        }
    }
`;
function PhotoForm() {
    let name;
    let description;
    let file;
    const [newPhoto, { data, loading, error }] = useMutation(MUTATION_PHOTOS);

    if (loading) return 'Submitting...';
    if (error) return `Submission error! ${error.message}`;

    return (
        <div>
            <form onSubmit={
                (event) => {
                    event.preventDefault();
                    newPhoto({
                        variables: {
                            input: {
                                name: name.value,
                                description: description.value,
                                file: file.files[0],
                            }
                        }
                    });
                    name.value = '';
                    description.value = '';
                    file.value = '';
                }
            } >
                <input ref={(node) => { name = node }} />
                <input ref={(node) => { description = node }} />
                <input ref={(node) => { file = node }} type="file" accept="image/jpeg" />
                <button type="submit">Add Todo</button>
            </form>
        </div>
    );
}


// 
const QUERY_PHOTOS = gql`
    query {
        allPhotos {
            id
            name
            description
        }
    }
`;
function AllPhotos() {
    const { loading, error, data } = useQuery(QUERY_PHOTOS);

    if (loading) return 'Loading...';
    if (error) return `Error! ${error.message}`;

    return (
        <div>
            {
                data.allPhotos.map((photo) => (
                    <div key={photo.id}>
                        <p>{photo.name}: {photo.description}</p>
                    </div>
                ))
            }
        </div>
    );
}


// 
function App() {
    return (
        <div>
            <ShowNewPhoto />
            <hr />
            <PhotoForm />
            <hr />
            <AllPhotos />
        </div>
    );
}

ReactDOM.render(
    <ApolloProvider client={apolloClient}>
        <App />
    </ApolloProvider>,
    document.getElementById('root'),
);