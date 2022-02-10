// Библиотека isomorphic-fetch используется для выполнения сетевых запросов. 
//      Но API Fetch является стандартным. Следует задействовать API или 
//      библиотеки платформы Web, соответствующие тем же спецификациям.
import fetch from 'isomorphic-fetch';



// 
function getOptions(method, body = null) {
    const upCasedMethod = method.toUpperCase();
    const config = {
        method: upCasedMethod,
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'same-origin'
    };
    if (['POST', 'PUT'].includes(upCasedMethod)) {
        config.body = JSON.stringify(body);
    }
    return config;
}