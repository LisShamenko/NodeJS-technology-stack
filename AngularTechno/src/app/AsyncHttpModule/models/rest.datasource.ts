import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import { RestProduct } from "./rest.model";
import { filter, map, distinctUntilChanged, skipWhile, takeWhile, catchError } from 'rxjs/operators';
import { REST_URL, REST_URL_PRODUCTS } from "../tokens";
import { PaginationData } from "src/app/RoutingModule/models/pagination_data.model";

// --------------- HTTP методы объекта HttpClient:

//      get (url)               запрос GET
//      post (url, body)        запрос POST, объект body определяет тело запроса
//      put (url, body)         запрос PUT, объект body определяет тело запроса
//      patch (url, body)       запрос PATCH, объект body определяет тело запроса
//      delete (url)            запрос DELETE
//      head (url)              запрос HEAD, возвращает заголовки без тела запроса
//      options (url)           запрос OPTIONS
//      request (request)       универсальный запрос

// --------------- методы и свойства объекта Response:

//      ok                true - успешный запрос, код статуса в диапазоне от 200 до 299
//      status            код статуса ответа
//      statusText        сообщение с описанием кода статуса
//      url               запрошенный URL-адрес
//      totalBytes        размер ответа
//      headers           объект Headers с заголовками ответа
//      json()            возвращает данные в JSON формате
//      text()            возвращает данные в виде строки
//      blob()            возвращает данные в виде двоичного объекта
//      arrayBuffer()     возвращает данные в виде массива


@Injectable()
export class RestProductsSource {

    constructor(
        // HttpClient служба выполняет асинхронные запросы
        private _httpClient: HttpClient,
        // URL адрес поставляется через маркер REST_URL_PRODUCTS
        @Inject(REST_URL_PRODUCTS) private _url: string,
        @Inject(REST_URL) private _baseURL: string) { }



    getData(): Observable<RestProduct[]> {

        // параметры в запросе:
        //      const params = new HttpParams({ fromString: 'name=term' });
        // передача объекта HttpParams в конфигурацию запроса:
        //      { 
        //          responseType: 'json', 
        //          params: params
        //      }

        // метод get возвращает объект типа Observable<Response[]>, который отправляет событие 
        //      при получении ответа от сервера
        return this._httpClient
            // HttpClient выполняет запрос HTTP GET
            .get(this._url, { responseType: 'json' })
            //
            .pipe(
                map((response: any) => {
                    console.log(`--- getData --- ${JSON.stringify(response)}`);
                    return response.products;
                })
            );
        // Observable<Response> конвертируется в Observable<RestProduct[]>
        //      .pipe(
        //          map((response: Object) => {
        //              console.log(`--- 4 ---`);
        //              // REST-совместимый веб-сервер возвращает данные в формате JSON
        //              let result: RestProduct[] = [];
        //              return result;
        //          })
        //      );
    }

    // request версия метода getData 
    getDataRequest(): Observable<RestProduct[]> {
        return this._httpClient
            .request("GET", this._url, { responseType: "json" })
            .pipe(
                map((response: any) => response.json())
            );
    }

    // --------------- save / edit / delete

    // - все методы строятся по одной схеме: отправляется запрос HTTP, получаемый ответ разбирается в формате JSON
    // - методы [post, put, delete] возвращают объект Observable<Product>

    saveProduct(product: RestProduct): Observable<RestProduct> {
        return this._httpClient
            .post(this._url, product, { responseType: "json" })
            .pipe(
                map((response: any) => {
                    console.log(`--- saveProduct --- ${JSON.stringify(response)}`);
                    return response;
                })
            );
    }

    updateProduct(product: RestProduct): Observable<RestProduct> {
        return this._httpClient
            .put(`${this._url}/${product.id}`, product, { responseType: "json" })
            .pipe(
                map((response: any) => {
                    console.log(`--- updateProduct --- ${JSON.stringify(response)}`);
                    return response;
                })
            );
    }

    deleteProduct(id: number): Observable<RestProduct> {
        return this._httpClient
            .delete(`${this._url}/${id}`);
    }

    // --------------- request версии методов saveProduct, updateProduct, deleteProduct

    saveProductRequest(product: RestProduct): Observable<string | RestProduct> {
        return this.sendRequest('POST', this._url, product);
    }

    updateProductRequest(product: RestProduct): Observable<string | RestProduct> {
        return this.sendRequest('PUT', `${this._url}/${product.id}`, product);
    }

    deleteProductRequest(id: number): Observable<string | RestProduct> {
        return this.sendRequest('DELETE', `${this._url}/${id}`);
    }

    // --------------- метод request

    private sendRequest(verb: string, url: string, body?: RestProduct): Observable<string | RestProduct> {

        // --- старое

        // - старая версия метода request использует интерфейс RequestArgs для задания конфигурации
        //      verb: RequestMethod
        //      request(new Request({ method: verb, url: url, body: body }))

        // - свойства ResponseArgs:
        //      method                  метод HTTP
        //      url                     URL-адрес
        //      headers                 объект Headers для задания заголовков запроса
        //      body                    объект тела запроса, сериализуется в формат JSON при отправке
        //      withCredentials         true - для междоменных запросов включается cookie аутентификация,
        //                              используется если сервер включает в ответ заголовок Access-ControlAllow-Credentials 
        //                              в соответствии со спецификацией CORS (Cross-Origin Resource Sharing)

        // --- новое

        // - методы HttpHeaders (https://angular.io/api/common/http/HttpHeaders)
        //      has(name)               true - если содержит заголовок
        //      get(name)               вернет первое значение заголовка
        //      keys()                  все заголовки
        //      getAll(name)            вернет все значения заголовка
        //      append(name, value)     добавляет значения к заголовку
        //      set(header, values)     присваивает заголовку список значений
        //      delete(name)            Удаляет заголовок

        // заголовки
        const headers = new HttpHeaders({
            "Access-Key": "<secret>",
            "Application-Name": "exampleApp",
            'Content-Type': 'application/json',
            Authorization: 'my-auth-token'
        });

        // параметры
        //      const params = new HttpParams({
        //          fromString: 'orderBy="$key"&limitToFirst=1'
        //      });

        // новая версия
        return this._httpClient
            .request("GET", url, {
                responseType: "json",
                //params: params,
                headers: headers,
            })
            .pipe(
                map((response: any) => response.json())
            )

            // --------------- обработка ошибок

            .pipe(
                catchError(val => of(`I caught: ${val}`))
            );

        // сигнатура метода request:
        //
        //      HttpClient.request(
        //          method: string, 
        //          url: string, 
        //          options?: {
        //              body?: any,
        //              headers?: HttpHeaders | { [header: string]: string | string[] } | undefined,
        //              observe?: "body" | undefined,
        //              params?: HttpParams | { ... } | undefined,
        //              responseType?: "json" | undefined,
        //              reportProgress?: boolean | undefined,
        //              withCredentials?: boolean | undefined
        //          } | undefined
        //      )
    }

    // --------------- CORS (Cross-Origin Resource Sharing)

    //      http://en.wikipedia.org/wiki/Cross-site_scripting

    // - CORS политика безопасности браузера, которая снижает риск межсайтовых сценарных атак, CORS не позволяет
    //      выполнять запросы по адресам отличающихся от адреса документа, браузеры включают в асинхронные запросы 
    //      дополнительные HTTP заголовки, которые сообщают серверу источник кода, сервер добавляет ответные 
    //      заголовки, которые сообщают браузера принмается запрос или нет

    // - поддержка CORS в Angular обеспечивается автоматически, сервер при этом должен поддерживать CORS

    // --------------- JSONP 

    // - поддерживается в модуле HttpClientJsonpModule через службу Jsonp, которая отвечает за HTTP-запросы JSONP и 
    //      обработку ответов, класс Jsonp содержит все методы из класса HttpClient, но подерживает только запросы GET

    // - CORS должен поддерживаться сервером

    // - JSONP работает следующим образом: добавляется элемент script в котором задается междоменный сервер, браузер 
    //      по этому адресу отправляет запрос GET на получение кода, выполнение которого возвращает требуемые данные

    // - JSONP поддерживает только GET запросы и обходит политику безопасности браузера, чего не делает CORS, 
    //      поэтому JSONP следует использовать только при недоступности CORS

    getDataJSONP(): Observable<RestProduct[]> {

        // - URL должен включать параметр callback: "?callback=JSONP_CALLBACK", значение JSONP_CALLBACK 
        //      будет заменяться на имя динамически сгенерированной функции
        //      this._url + "?callback=JSONP_CALLBACK"

        return this._httpClient
            .jsonp(this._url, 'callback')
            .pipe(
                map((response: any) => response.json())
            );
    }

    // --------------- 

    getPagination(): Observable<PaginationData> {
        return this._httpClient
            .get(`${this._baseURL}/pagination`, { responseType: 'json' })
            .pipe(
                map((response: any) => {
                    return (response as PaginationData);
                })
            );
    }
}

/*
 * ### Map and flatten numbers to the sequence 'a', 'b', 'c', but throw an error for 2
 * ```ts
 * import { throwError, interval, of } from 'rxjs';
 * import { mergeMap } from 'rxjs/operators';
 *
 * interval(1000).pipe(
 *   mergeMap(x => x === 2
 *     ? throwError('Twos are bad')
 *     : of('a', 'b', 'c')
 *   ),
 * ).subscribe(x => console.log(x), e => console.error(e));
 *
 * // Logs:
 * // a
 * // b
 * // c
 * // a
 * // b
 * // c
 * // Twos are bad
 * ```
 */
