import { HttpClient } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule, Routes } from "@angular/router";
import { Subject } from "rxjs/internal/Subject";
import { AsyncHttpModule } from "../AsyncHttpModule/async_http.module";
import { RestProductsSource } from "../AsyncHttpModule/models/rest.datasource";
import { RestProductRepository } from "../AsyncHttpModule/models/rest.repository";
import { Message } from "../ReactiveExtensionsModule/models/message.model";
import { MessageService } from "../ReactiveExtensionsModule/services/message.service";
import { RoutingComponent } from "./components/routing.component";
import { RoutingFormComponent } from "./components/routing_form.component";
import { RoutingMessagePanelComponent } from "./components/routing_message_panel.component";
import { RoutingTableComponent } from "./components/routing_table.component";
import { TestRouterOutletComponent } from "./components/test_router_outlet.component";
import { ROUTING_MESSAGE_SERVICE, ROUTING_PRODUCT_REPOSITORY, ROUTING_PRODUCT_SOURCE, ROUTING_REST_URL, ROUTING_SUBJECT_INSTANCE } from "./tokens/routing.tokens";

// --------------- маршрутизация

// - механизм маршрутизации (routing) позволяет отображать компоненты в соответствии с URL-адресом в браузере, 
//      позволяет вносить изменения в структуру приложения не затрагивая при этом сами компоненты, позволяет
//      упростить приложение за счет исключения привязок событий и их обработчиков

// - механизм маршрутизации зависит от системы JavaScript History API, в качестве полифила для старых браузеров
//      можно использовать пакет html5-historyapi, следует разместить в корневом шаблоне:
//      <script src="node_modules/html5-history-api/history.min.js"></script>

// - элемент base в корневом шаблоне задает URL, с которым будут сравниваться пути маршрутизации:
//      <base href="/">

// - корневой компонент обеспечивает навигацию в приложении и должен содержать элемент router-outlet,
//      который определяет где будут отображаться компоненты навигации
//      <router-outlet></router-outlet>

// --------------- как работает

// - система маршрутизации заменяет URL-адрес в браузере 
// - при этом сервер, обрабатывающий запросы приложения Angular не получает запросы, то есть 
//      изменения происходят внутри приложения Angular
// - URL-адрес сопоставляется с маршрутом, при этом учитывается элемент base в файле index.html,
//      <base href="/">
// - маршрут определяет отображаемый компонент, система маршрутизации создает новый экземпляр этого 
//      компонента, а его шаблон используется как контент элемента router-outlet

// --------------- навигационные ссылки

// - атрибут routerLink применяет директиву, которая выполняет навигацию, чаще всего применяется к 
//      к элементам button и anchor

//      <button (click)="editProduct(item.id)" 
//          routerLink="/form/edit">Edit</button>
//      <button (click)="editProduct(item.id)" 
//          [routerLink]="['/form', 'edit', item.id]">Edit</button>
//      <button (click)="editProduct(item.id)" 
//          [routerLink]="['/form', 'edit', item.id, 
//              {
//                  name: item.name, 
//                  category: item.category, 
//                  price: item.price
//              }
//          ]">Edit</button>
//      <button 
//          [routerLink]="['/form', 'edit', item.id,
//              {
//                  name: item.name, 
//                  category: item.category, 
//                  price: item.price
//              }
//          ]">Edit</button>
//      <button (click)="createProduct()" 
//          routerLink="/form/create">

// --------------- Routes

// класс Routes определяет коллекцию маршрутов
const routes: Routes = [
    // - маршруты (routes) определяют соответствия между URL и отображаемыми компонентами 
    // - важен порядок определения маршрутов, так как URL-адрес сравнивается последовательно 
    //      со свойством path всех маршрутов до первого соответствия, маршруты определяются от 
    //      более конкретных к более универсальным
    {
        // задает URL-адрес
        path: "form/edit",                      // http://localhost:3000/form/edit
        // задает компонент
        component: RoutingFormComponent

        // класс Routes:
        //      path                    путь для маршрута
        //      component               отображаемый компонент
        //      pathMatch               условия совпадения URL-адреса: 
        //                                  full - path должен полностью соответствовать URL,
        //                                  prefix - только левая часть URL-адреса должна полностью соответствовать path
        //      redirectTo              определяет маршрут перенаправления на другой URL
        //      children                задает дочерние маршруты для вложенных элементов router-outlet
        //      outlet                  для поддержки множественных элементов outlet
        //      resolve                 
        //      canActivate             определяет когда маршрут может активироваться
        //      canActivateChild        определяет когда дочерний маршрут может активироваться
        //      canDeactivate           определяет когда маршрут может деактивироваться
        //      loadChildren            модуль загружаемый только при необходимости
        //      canLoad                 загрузка модуля только по требованию
    },
    {
        path: "form/create",                    // http://localhost:3000/form/create
        component: RoutingFormComponent
    },

    // --------------- параметры маршрута

    // - при сопоставлении маршрута с URL-адресом сравнение выполняется для каждого сегмента,
    //      статические сегменты должны точно совпадать, но динамические сегменты маршрута могут 
    //      совпадать с любым значением из URL-адреса

    // - чтобы указать динамический сегмент в URL-адресе следует строить выражения routerLink 
    //      следующим образом: квадратные скобки [routerLink] говорят что используется привязка данных, 
    //      выражение задается как массив сегментов, которые объекдиняются директивой routerLink в URL: 
    //      два первых сегмента это литералы '/form' и 'edit', третий сегмент это динамическое значение 
    //      задается как идентификатор продукта:
    //      
    //      [routerLink]="['/form', 'edit', item.id]"

    // --------------- необязательные параметры маршрутов

    // - в routerLink необязательные параметры передаются в виде объектных литералов, свойства которых
    //      определяют параметры:
    //      [routerLink]="['/form', 'edit', item.id, { name: item.name, category: item.category, price: item.price }]"
    // 
    // routerLink построит следующий URL:
    //      http://localhost:3000/form/edit/1;name=продукт_1;category=category_1;price=10

    {
        // один динамический сегмент: ':mode'
        path: "form/:mode",                     // http://localhost:3000/form/[edit | create]
        component: RoutingFormComponent
    },
    {
        // два динамических сегмента: ':mode', ':id'
        path: "form/:mode/:id",                 // http://localhost:3000/form/[edit | create]/[id]
        component: RoutingFormComponent
    },
    {
        path: "table",                          // http://localhost:3000/table
        component: RoutingTableComponent
    },
    {
        path: "",                               // http://localhost:3000/
        component: TestRouterOutletComponent
    },
];

// --------------- 

@NgModule({
    imports: [
        BrowserModule, FormsModule, 
        // в модуле AsyncHttpModule объявлены сервисы: 
        //      RestProductRepository, RestProductsSource
        AsyncHttpModule,
        // - первый вариант, задать роутеры на прямую
        //      метод forRoot создает модуль, включающий службу маршрутизации, в приложении
        //      должен использоваться только один вызов метода forRoot, остальные модули 
        //      должны содержать вызовы метода forChild
        //      https://www.pluralsight.com/guides/forroot-and-forchild-static-methods-on-the-angular-router
        //      https://angular.io/api/router/RouterModule
        RouterModule.forRoot(routes)
        // - второй вариант, разместить роутеры в отдельном файле app.routing.ts
        //      RouterModuleRouting
    ],
    declarations: [RoutingFormComponent, RoutingTableComponent, RoutingMessagePanelComponent, RoutingComponent, TestRouterOutletComponent],
    exports: [RoutingComponent],
    providers: [
        /*
        // refactoring - почему это не работает?
        {
            provide: ROUTING_REST_URL,
            useValue: `http://${location.hostname}:3000/products`
        },
        {
            provide: ROUTING_PRODUCT_SOURCE,
            deps: [ROUTING_REST_URL],
            useFactory: (httpClient: HttpClient) => {
                // не передается значение ROUTING_REST_URL
                let url: string = `http://${location.hostname}:3000/products`;
                console.log(url);
                return new RestProductsSource(httpClient, url);
            }
        },
        {
            provide: ROUTING_PRODUCT_REPOSITORY,
            deps: [ROUTING_PRODUCT_SOURCE],
            useFactory: (dataSource: RestProductsSource) => {
                console.log(dataSource);
                return new RestProductRepository(dataSource);
            }
        },
        */
        {
            provide: ROUTING_SUBJECT_INSTANCE,
            useValue: new Subject<Message>()
        },
        {
            provide: ROUTING_MESSAGE_SERVICE,
            deps: [ROUTING_SUBJECT_INSTANCE],
            useFactory: (subject: Subject<Message>) => {
                return new MessageService(subject);
            },
        }
    ]
})
export class RoutingModule { }