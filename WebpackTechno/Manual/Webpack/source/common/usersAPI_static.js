const ENDPOINT = "https://jsonplaceholder.typicode.com/users/1";

export function getUsers() {
    console.log('Call ES-module.');
    return fetch(ENDPOINT)
        .then(response => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        })
        .then(json => json);
}