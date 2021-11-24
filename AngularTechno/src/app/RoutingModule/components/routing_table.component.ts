import { Component, Inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observer } from "rxjs";
import { RestProduct } from "src/app/AsyncHttpModule/models/rest.model";
import { RestProductRepository } from "src/app/AsyncHttpModule/models/rest.repository";
import { Message } from "src/app/ReactiveExtensionsModule/models/message.model";
import { MessageService } from "src/app/ReactiveExtensionsModule/services/message.service";
import { ROUTING_MESSAGE_SERVICE, ROUTING_PRODUCT_REPOSITORY } from "../tokens/routing.tokens";

@Component({
    selector: "routing-table",
    templateUrl: "./routing_table.component.html"
})
export class RoutingTableComponent {

    observer: Observer<Message>;
    category: string = '';

    // компоненты таблицы и формы взаимодейтсвуют через систему маршрутизации
    constructor(
        //@Inject(ROUTING_PRODUCT_REPOSITORY) 
        private productRepository: RestProductRepository,
        @Inject(ROUTING_MESSAGE_SERVICE) messageService: MessageService,
        private activatedRoute: ActivatedRoute) {

        this.observer = messageService.getObserver();

        // --------------- стили ссылок активных маршрутов

        // - атрибут routerLinkActive задает класс CSS, который будет назначен элементу, 
        //      если routerLink совпадает с активным маршрутом, по умолчанию совпадение 
        //      может быть не полным

        // - атрибут routerLinkActiveOptions отвечает за конфигурацию: 
        //      exact - определяет как сопоставляется URL-адрес активного маршрута,
        //      true потребует полного совпадения URL-адреса, в результате чего элементу 
        //      будет присвоен класс заданный атрибутом routerLinkActive

        this.activatedRoute.params.subscribe(params => {
            console.log(`--- RoutingTableComponent --- constructor --- category = ${params["category"]}`);
            this.category = params["category"] || '';
        });
    }

    getProduct(key: number): RestProduct | undefined {
        return this.productRepository.getProduct(key);
    }

    getProducts(): RestProduct[] {
        return this.productRepository.getProducts();
    }

    getProductsByFilter(): RestProduct[] {
        return this.productRepository.getProducts()
            .filter(p => this.category == '' || p.category == this.category);
    }

    getCategories(): string[] {
        return this.productRepository.getCategories();
    }

    deleteProduct(id: number | undefined) {
        if (id) {
            this.productRepository.deleteProduct(id);
        }
    }

    // методы не успевают выполняться при переходе
    sendMessage() {
        this.observer.next(new Message('Метод sendMessage()'))
    }
    editProduct(id: number | undefined) {
        this.observer.next(new Message('Метод editProduct()'))
    }
    createProduct() {
        this.observer.next(new Message('Метод createProduct()'))
    }
}
