import { ErrorHandler, NgModule } from "@angular/core";
import { HttpClientJsonpModule, HttpClientModule } from "@angular/common/http"
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { MESSAGE_SERVICE, REST_URL, REST_URL_PRODUCTS, SUBJECT_INSTANCE } from "./tokens";
import { MessageErrorHandler } from "./service/errorHandler";
import { Subject } from "rxjs";
import { MessageService } from "../ReactiveExtensionsModule/services/message.service";
import { Message } from "../ReactiveExtensionsModule/models/message.model";
import { AsyncHTTPComponent } from "./components/async_http.component";
import { ReactiveExtensionsModule } from "../ReactiveExtensionsModule/re.module";
import { RestProductRepository } from "./models/rest.repository";
import { RestProductsSource } from "./models/rest.datasource";

// --------------- 

@NgModule({
    imports: [BrowserModule, FormsModule, HttpClientModule, HttpClientJsonpModule, ReactiveExtensionsModule],
    declarations: [AsyncHTTPComponent],
    exports: [AsyncHTTPComponent],
    providers: [
        RestProductRepository,
        RestProductsSource,
        // маркер REST_URL_PRODUCTS для настройки URL веб-службы
        {
            provide: REST_URL_PRODUCTS,
            useValue: `http://${location.hostname}:3000/products`
        },
        {
            provide: REST_URL,
            useValue: `http://${location.hostname}:3000`
        },
        // заменяет ErrorHandler (обработчик ошибок по умолчанию)
        {
            provide: ErrorHandler,
            useClass: MessageErrorHandler
        },
        {
            provide: SUBJECT_INSTANCE,
            useValue: new Subject<Message>()
        },
        {
            provide: MESSAGE_SERVICE,
            deps: [SUBJECT_INSTANCE],
            useFactory: (subject: Subject<Message>) => {
                return new MessageService(subject);
            },
        },

    ]
})
export class AsyncHttpModule { }