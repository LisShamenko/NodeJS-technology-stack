import { Component, Inject } from "@angular/core";
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

    // компоненты таблицы и формы взаимодейтсвуют через систему маршрутизации
    constructor(
        //@Inject(ROUTING_PRODUCT_REPOSITORY) 
        private productRepository: RestProductRepository,
        @Inject(ROUTING_MESSAGE_SERVICE) messageService: MessageService) {

        this.observer = messageService.getObserver();
    }

    getProduct(key: number): RestProduct | undefined {
        return this.productRepository.getProduct(key);
    }

    getProducts(): RestProduct[] {
        return this.productRepository.getProducts();
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
