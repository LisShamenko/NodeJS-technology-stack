import { Inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { RestProductsSource } from "src/app/AsyncHttpModule/models/rest.datasource";
import { RestProduct } from "src/app/AsyncHttpModule/models/rest.model";
import { RestProductRepository } from "src/app/AsyncHttpModule/models/rest.repository";
import { Message } from "src/app/ReactiveExtensionsModule/models/message.model";
import { MessageService } from "src/app/ReactiveExtensionsModule/services/message.service";
import { ROUTING_MESSAGE_SERVICE, ROUTING_REFRESH } from "../tokens/routing.tokens";

// --------------- отложенная навигация

// - резольверы это классы с обязательным методом resolve:
//      resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<RestProduct[]> | null

// - аргументы:
//      - ActivatedRouteSnapshot описание маршрута по которому происходит переход
//      - RouterStateSnapshot описание текущего маршрута через свойство url

// - возвращаемые значения:
//      - Observable<any>   браузер активирует маршрут при получении события
//      - Promise<any>      браузер активирует маршрут при обработке Promise
//      - Любой другой      браузер активирует маршрут после возврата результата

// - Observable и Promise следует использовать для ожидания завершения асинхронных 
//      операций перед активацией маршрутов, любой другой результат интерпретируется 
//      как синхронная операция и маршрут активируется немедленно

// - возврат синхронного результата означает, что резольвер отложит навигацию только
//      первый раз для заполнения модели данных, это важно так как метод resolve 
//      вызывается при каждой попытке перехода по защищенному маршруту

@Injectable()
export class DelayNavigationResolver {

    constructor(
        @Inject(ROUTING_REFRESH) private isRefresh: boolean,
        @Inject(ROUTING_MESSAGE_SERVICE) private messageService: MessageService,
        private productRepository: RestProductRepository,
        private dataSource: RestProductsSource) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<RestProduct[]> | null {

        console.log(`--- отложенная навигация`);

        // - компонент RoutingMessagePanelComponent очищает свое содержимое при получении
        //      события NavigationEnd, а перед этим он будет отображать сообщение о том
        //      что выполняется загрузка данных
        this.messageService.sendMessage(new Message("Идет загрузка данных."));

        // - защитник маршрута применяется чтобы гарантировать получение данных от 
        //      асинхронной службы перед активацией маршрута
        let products = this.productRepository.getProducts();
        if (this.isRefresh || products.length == 0) {
            // асинхронная операция заполняет модель данными
            return this.dataSource.getData();
        }
        else {
            // синхронная операция 
            return null;
        }
    }
}
