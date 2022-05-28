const ENDPOINT = "https://jsonplaceholder.typicode.com/posts/1";

export function getPosts() {
    console.log('Call ES-module.');
    return fetch(ENDPOINT)
        .then(response => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        })
        .then(json => json);
}