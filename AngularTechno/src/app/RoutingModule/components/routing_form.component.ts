import { Component, Inject } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { RestProduct } from "src/app/AsyncHttpModule/models/rest.model";
import { RestProductRepository } from "src/app/AsyncHttpModule/models/rest.repository";
import { ROUTING_PRODUCT_REPOSITORY } from "../tokens/routing.tokens";



@Component({
    selector: "routing-form",
    templateUrl: "./routing_form.component.html",
    styleUrls: ["./routing_form.style.css"]
})
export class RoutingFormComponent {

    currentProduct: RestProduct = new RestProduct();
    isEditing: boolean = false;
    isNavigateByUrl: boolean = false;

    constructor(
        //@Inject(ROUTING_PRODUCT_REPOSITORY) 
        private productRepository: RestProductRepository,
        activatedRoute: ActivatedRoute,
        private router: Router) {

        // --------------- обработка маршрутов

        // - совместное использование систем маршрутизации и Reactive Extensions может создать проблемы
        //      временной последовательности событий, так как система маршрутизации создает новые экземпляры
        //      компонентов только при необходимости, то есть компонент будет создаваться после генерации
        //      событий, одно из решений это использовать объект BehaviorSubject вместо Subject, второе полная
        //      замена системы Reactive Extensions на маршрутизацию с параметрами

        // - класс ActivatedRoute позволяет получать подробную информацию о текущем маршруте

        // свойство snapshot класса ActivatedRoutes возвращает экземпляр ActivatedRouteSnapshot, 
        //      который описывает текущий маршрут

        // свойства ActivatedRouteSnapshot
        //      - url           массив сегментов типа UrlSegment
        //      - params        параметры URL
        //      - queryParams   параметры запроса URL
        //      - fragment      фрагмент URL

        // свойства URLSegment
        //      - Path          строка со значением сегмента
        //      - parameters    индексированная коллекция параметров

        // --------------- 

        console.log('------------------------- RoutingFormComponent = ');
        console.log(activatedRoute.snapshot);

        // проверка 2-ого сегмента URL-адреса активного маршрута
        this.isEditing = (activatedRoute.snapshot.url[1].path == "edit");

        // свойство params позволяет обращаться к параметрам URL (строки запроса)
        this.isEditing = (activatedRoute.snapshot.params["mode"] == "edit");

        // необязательные параметры
        let id = activatedRoute.snapshot.params["id"];
        if (id != null && id > -1) {
            // репозиторий загружает данные асинхронно, и если данные не будут загружены к моменту отображения формы,
            //      то возникнет ошибка, поэтому следует проверять загружаемые данные из репозитория
            let product = productRepository.getProduct(id);
            Object.assign(this.currentProduct, product || new RestProduct());
            this.currentProduct.id = id;
        }

        // получение необязательных параметров маршрута
        let name = activatedRoute.snapshot.params["name"];
        let category = activatedRoute.snapshot.params["category"];
        let price = activatedRoute.snapshot.params["price"];

        // отличие необязательных параметров от обязательных в том, что 
        //      необходимо выполнять проверку их наличия
        if (name != null) {
            this.currentProduct.name = name;
        }
        if (category != null) {
            this.currentProduct.category = category;
        }
        if (price != null) {
            this.currentProduct.price = Number.parseFloat(price);
        }

        // --------------- навигация по коллекции

        // - кнопки Previous и Next содержат привязку директивы routerLink для перехода
        //      к предыдущему и следующему продукту

        // - URL-адреса кнопок Previous и Next обрабатываются тем же маршрутом, что и 
        //      маршрут содержащего их компонента, поэтому Angular не создает новый экземпляр 
        //      компонента, а сообщает существующему компоненту, что маршрут изменился 

        // - при внутренней навигации не имеет смысла использовать свойство snapshot
        //      объекта ActivatedRoute, так как компонент не будет создаваться заново и 
        //      конструктор выполнится только один раз, вместо этого следует использовать
        //      свойства возвращающие объекты Observable (Reactive Extension) на которые
        //      можно подписаться и получать уведомления об изменениях:
        //      - url               Observable<UrlSegment[]>    набор сегментов URL
        //      - params            Observable<Params>          параметры URL
        //      - queryParams       Observable<Params>          параметры запроса
        //      - fragment          Observable<string>          фрагмент

        console.log('--- --- навигация конструктор');

        // свойство 'params: Observable<Params>' объекта ActivatedRoute позволяет отслеживать
        //      изменения маршрута, благодаря этому конструктор не пропустит начальную навигацию,
        //      которая привела к отображению компонента
        activatedRoute.params.subscribe((params: Params) => {

            console.log(`--- --- навигация наблюдатель`);
            console.log(`--- --- --- параметры этого маршрута: ${JSON.stringify(params)}`)

            // чтобы получить доступ к другим данным следует использовать свойство snapshot
            console.log(`--- --- --- сегменты URL: ${activatedRoute.snapshot.url}`)
            console.log(`--- --- --- параметры всех маршрутов: ${activatedRoute.snapshot.queryParams}`)
            console.log(`--- --- --- фрагмент: ${activatedRoute.snapshot.fragment}`)

            // функция-наблюдатель принимает объект Params при каждом изменении маршрута
            this.isEditing = (params["mode"] == "edit");
            let id = params["id"];
            if (id != null) {
                let product = this.productRepository.getProduct(id);
                Object.assign(this.currentProduct, product || new RestProduct());
            }
        });
    }

    submitForm(form: NgForm) {

        if (this.isEditing) {

            // проверка
            this.isEditing = false;
            if (this.currentProduct.id == undefined) {
                return;
            }

            // обновить продукт
            this.productRepository.updateProduct(this.currentProduct);

            // выполнить навигацию
            if (this.isNavigateByUrl) {

                // навигация в коде выполняется через класс Router, свойства этого класса:
                //      - navigated                     true - говорит о наличии хотя бы одного события навигации
                //      - url                           активный URL-адрес
                //      - isActive(url, exact)          true - указанный URL совпадает с URL маршрута, 'exact:true' если
                //                                      должны совпадать все сегменты URL
                //      - events                        объект Observable<Event> прослушивает навигационные события
                //      - navigateByUrl(url, extras)    переход к указанному URL, результатом является Promise, который 
                //                                      возвращает true в resolve, если навигация прошла успешно
                //      - navigate(commands, extras)    навигация по массиву сегментов, 'extras:true' адрес задается относительно
                //                                      текущего маршрута, результатом является Promise, который возвращает
                //                                      true в resolve, если навигация прошла успешно

                // возврат к корневому URL-адресу приложения
                this.router.navigateByUrl("/");
            }
            else {
                // сброс формы не нужен если выполняется переход на другой URL-адрес, так как 
                //      система маршрутизации уничтожит компонент формы 
                this.currentProduct = new RestProduct();
                form.reset();
            }
        }
        else {
            this.productRepository.addProduct(this.currentProduct);
        }
    }

    resetForm() {
        this.currentProduct = new RestProduct();
        this.isEditing = false;
    }

    getPrevious(): number {
        if (this.currentProduct.id != undefined) {
            let id = this.productRepository.getPreviousProductId(this.currentProduct.id);
            if (id != undefined) {
                return id;
            }
        }
        return -1;
    }

    getNext(): number {
        if (this.currentProduct.id != undefined) {
            let id = this.productRepository.getNextProductId(this.currentProduct.id);
            if (id != undefined) {
                return id;
            }
        }
        return -1;
    }
}