import { NgModule } from "@angular/core";

// модули
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

// компоненты
import { AppComponent } from "./../components/AppComponent/app.component";
import { ProductComponent } from "./../components/ProductComponent/product.component";
import { FormComponent } from "./../components/FormComponent/form.component";
import { DirectiveComponent } from "./../components/DirectiveComponent/directive.component";
import { StructuralDirectiveComponent } from "./../components/StructuralDirectiveComponent/structural_directive.component";
import { RootComponent } from "./../components/Components/root.component";
import { ProductFormComponent } from "./../components/Components/product_form.component";
import { NgcontentComponent } from "./../components/Components/ngcontent.component";
import { ProductTableComponent } from "./../components/Components/product_table.component";
import { PipeFormComponent } from "./../components/Pipes/pipe_form.component";
import { ServiceComponent } from "./../components/ServiceComponent/service.component";
import { FirstDisplayComponent } from "./../components/ServiceComponent/firstDisplay.component";
import { SecondDisplayComponent } from "./../components/ServiceComponent/secondDisplay.component";
import { FirstEditComponent } from "./../components/ServiceComponent/firstEdit.component";
import { SecondEditComponent } from "./../components/ServiceComponent/secondEdit.component";
import { LocalProviderComponent } from "./../components/ProviderComponent/local_provider.component";
import { ModuleRootComponent } from "./ComponentsModule/components/root/module_root.component";
import { ReactiveExtensionsComponent } from "./ReactiveExtensionsModule/components/reactive_extensions.component";

// директивы
import { DirectiveSimple } from "../directives/directive.simple";
import { DirectiveTwowayBinding } from "../directives/directive.twoway_binding";
import { DirectiveStructure } from "../directives/directive.structure";
import { DirectiveIterator } from "../directives/directive.iterator";
import { DirectiveDiffer } from "../directives/directive.differ";
import { DirectiveParent } from "../directives/directive.parent";
import { DirectiveChild } from "../directives/directive.child";
import { ServiceDirective } from "./../directives/directive.serviceDirective";
import { ProviderValueDirective } from "./../directives/ProviderDirectives/provider_value.directive";
import { ProviderChildDirective } from "./../directives/ProviderDirectives/provider_child.directive";
import { ProviderParentDirective } from "./../directives/ProviderDirectives/provider_parent.directive";

// каналы
import { AddNumberPipe } from "../pipes/addNumber.pipe";
import { CategoryFilterPipe } from "../pipes/categoryFilter.pipe";
import { PipeService } from "./../pipes/pipeService.pipe";
import { ProviderPipe } from "./../pipes/provider_pipe.pipe";

// провайдеры
import { LOCALE_ID } from "@angular/core";
import { FirstService } from "./../services/first.service";
import { SecondService } from "./../services/second.service";
import { ProductRepository } from "./../models/Product/product.repository";
import { ProductsSource } from "./../models/Product/product.datasource";
import { ThirdService } from "./../services/third.service";
import { ProviderBaseService } from "./../services/provider_base.service";
import { PROVIDER_ALIAS, PROVIDER_BASE_SERVICE, PROVIDER_BOTH_SERVICES, PROVIDER_DEPENDENCY, PROVIDER_INSTANCE, PROVIDER_MULTI, PROVIDER_SUB_SERVICE, PROVIDER_VALUE, PROVIDER_VALUE_PROVIDERS, PROVIDER_VALUE_VIEW_PROVIDERS } from "./../Tokens/provider_tokens";
import { ProviderSubclassService } from "./../services/provider_subclass.service";
import { FourthService } from "./../services/fourth.service";

// модули
import { ModulesModule } from "./modules.module";
import { ReactiveExtensionsModule } from "./ReactiveExtensionsModule/re.module";


// --------------- @NdModule

// @NdModule - корневой модуль, который отвечает за описание приложения для Angular:
//      используемые зависимости, компоненты, точки входа
// BrowserModule - обеспечивает встроенные функции шаблонов, такие как последовательности '{{' и '}}'
// FormsModule - позволяет использовать формы
// ReactiveFormsModule - поддержка форм на базе моделей, критерии валидации форм задаются в коде,
//      а не в шаблоне, что дает лучшую масштабируемость
@NgModule({
    // задает зависимости, используемые приложением
    imports: [
        BrowserModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule,
        // кастомный модуль, содержит несколько подходов по использованию модулей
        ModulesModule,
        // модуль Reactive Extensions
        ReactiveExtensionsModule
    ],
    // описывает функции, предоставляемые приложением для внешнего доступа, регистрирует компоненты и директивы
    declarations: [
        // компоненты
        ProductComponent, AppComponent, FormComponent, DirectiveComponent, StructuralDirectiveComponent,
        RootComponent, ProductFormComponent, NgcontentComponent, ProductTableComponent,
        PipeFormComponent,
        ServiceComponent, FirstDisplayComponent, FirstEditComponent, SecondDisplayComponent, SecondEditComponent,
        LocalProviderComponent,
        // директивы
        DirectiveSimple, DirectiveTwowayBinding, DirectiveStructure, DirectiveIterator, DirectiveDiffer,
        DirectiveParent, DirectiveChild,
        ServiceDirective,
        ProviderChildDirective, ProviderParentDirective, ProviderValueDirective,
        // каналы
        AddNumberPipe, CategoryFilterPipe,
        PipeService,
        ProviderPipe
    ],
    // определяет точку входа приложения
    bootstrap: [
        ProductComponent, AppComponent, FormComponent, DirectiveComponent, StructuralDirectiveComponent,
        RootComponent, PipeFormComponent, ServiceComponent,
        LocalProviderComponent,
        ModuleRootComponent,
        ReactiveExtensionsComponent
    ],
    // провайдеры
    providers: [
        // настройка локали
        { provide: LOCALE_ID, useValue: "en-US" },
        // сервисы
        FirstService, SecondService, ProductRepository, ProductsSource,

        // --------------- 

        // - провайдеры служб создают объекты (классы служб), используемые для разрешения зависимостей
        
        // - каждый провайдер управляет одним типом зависимости, если для разрешения заваисимости нет провайдера, 
        //      то Angualr не сможет создать объект

        // - провайдеры служб модуля используются для разрешения зависимостей всех корневых компонентов

        // 1. класса службы передается в массив providers
        ThirdService,
        // использовать:
        //      constructor(private thirdService: ThirdService)

        // --------------- типы провайдеров

        // Провайдер класса                 зависимости разрешаются с помощью экземпляра класса, который создается Angular
        // Провайдер значения               зависимости разрешаются при помощи объекта
        // Провайдер фабрики                в качестве фабрики используется функция, зависимости разрешаются с помощью 
        //                                  возвращаемого этой функцией объекта
        // Провайдер существующей службы    зависимости разрешаются с помощью другой службы, что эквивалентно псевдониму службы

        // ---------------  провайдер класса

        // 2. 
        {
            // provide - маркер (token)
            //      используется для идентификации зависимости, разрешаемой провайдером, в качестве маркера 
            //      может использоваться класс службы (в самом просто случае) или любой объект
            // useClass - задает класс, экземпляр которого будет создаваться для разрешения зависимостей
            // multi - провайдер будет передавать массив объектов служб для разрешения зависимости,
            //      используется для передачи набора взаимосвязанных служб с отличающейся конфигурацией
            provide: ProviderBaseService,
            useClass: ProviderBaseService
        },

        // 3. маркер задается строкой в свойстве provide и дополнительно указывается в директиве @Inject
        {
            provide: "base-provider",
            useClass: ProviderBaseService
        },
        // использовать: 
        //      constructor(@Inject("base-provider") providerBase: ProviderBaseService)

        // --------------- InjectionToken (в старых версиях OpaqueToken)

        // InjectionToken предоставляет объектную обертку строкового литерала для создания уникального значения
        //      const TOKEN = new InjectionToken("литерал");
        //      строковый литерал идентифицирует службу, но маркером становится объект InjectionToken

        // 4. объявление провайдера с токеном InjectionToken
        {
            provide: PROVIDER_BASE_SERVICE,
            useClass: ProviderBaseService
        },
        // использовать:
        //      constructor(@Inject(PROVIDER_BASE_SERVICE) providerBase: ProviderBaseService)

        // --------------- субклассирование

        // - при помощи свойства useClass провайдер может быть настроен на любой класс, что позволяет менять 
        //      реализацию через конфигурацию провайдеров

        // - получатели объекта службы будут ожидать конкретный тип, причем несоответствия не создадут проблем 
        //      вплоть до запуска приложения в браузере

        // 5. провайдер использует субкласс, зависимости PROVIDER_SUB_SERVICE будут разрешаться при помощи 
        //      субкласса ProviderSubclassService, передача субкласса является безопасным вариантом, так как 
        //      гарантирует ту же функциональность, что и у базового класса
        {
            provide: PROVIDER_SUB_SERVICE,
            useClass: ProviderSubclassService
        },

        // --------------- свойство multi

        // 6. свойство multi, чтобы резарешить зависимость по маркерам PROVIDER_BOTH_SERVICES, создаются объекты 
        //      ProviderBaseService и ProviderSubclassService, помещаются в массив и передаются в конструктор
        {
            provide: PROVIDER_BOTH_SERVICES,
            useClass: ProviderBaseService,
            multi: true
        },
        {
            provide: PROVIDER_BOTH_SERVICES,
            useClass: ProviderSubclassService,
            multi: true
        },
        // использовать:
        //      constructor(@Inject(PROVIDER_BOTH_SERVICES) providerServices: ProviderBaseService[])

        // --------------- провайдер значений

        // - используется если зависимости являются простыми типами или объектным литералом, для доступа к настройкам,
        //      если необходимо контролировать создание объектов

        // provide      маркер службы
        // useValue     объект используемый для разрешения зависимостей
        // multi        объединяет несколько провайдеров 

        // 7. зависимость разрешается с помощью экземпляра объекта
        {
            provide: 'fourth-default-message',
            useValue: 'default message'
        },
        {
            provide: PROVIDER_INSTANCE,
            // создать объект для передачи провайдеру
            useValue: new FourthService('7. зависимость разрешается с помощью экземпляра объекта')
        },
        // использовать:
        //      constructor(@Inject(PROVIDER_INSTANCE) fourthService: FourthService)

        // --------------- провайдер фабрики

        // использует функцию для создания объекта, необходимого для разрешения зависимости

        // provide         маркер службы
        // deps            массив маркеров определяет зависимости, которые будут переданы фабричной функции
        // useFactory      фабричная функция, получает зависимости из deps и возвращает объект службу
        // multi           объединяет несколько провайдеров 

        // 8. простая фабричная функция
        {
            multi: true,
            provide: PROVIDER_MULTI,
            useFactory: () => {
                return new FourthService('8. простая фабричная функция');
            }
        },

        // 9. фабричная функция и deps
        {
            // определяет значение в качестве службы
            provide: PROVIDER_DEPENDENCY,
            useValue: '9. фабричная функция и deps'
        },
        {
            multi: true,
            provide: PROVIDER_MULTI,
            // задает зависимость от провайдера PROVIDER_DEPENDENCY
            deps: [PROVIDER_DEPENDENCY],
            // передает зависимость от провайдера PROVIDER_DEPENDENCY в фабричную функцию
            useFactory: (message: string) => {
                return new FourthService(message);
            }
        },

        // --------------- провайдер существующей службы

        // - используется для создания псевдонимов служб, чтобы добавить новые провайдеры, но 
        //      оставить уже существующие маркеры 

        // provide      маркер службы
        // useExisting  маркер другого провайдера
        // multi        объединяет несколько провайдеров

        // 10. псевдоним, цепочка провайдеров: PROVIDER_ALIAS <- "alias" <- FourthService
        {
            // определяет значение в качестве службы
            provide: PROVIDER_ALIAS,
            useValue: '10. псевдоним'
        },
        {
            // псевдоним провайдера PROVIDER_ALIAS
            provide: "alias",
            useExisting: PROVIDER_ALIAS
        },
        {
            multi: true,
            provide: PROVIDER_MULTI,
            deps: ["alias"],
            useFactory: (message: string) => {
                return new FourthService(message);
            }
        },

        // --------------- локальные провайдеры

        {
            provide: PROVIDER_VALUE,
            useValue: "root - value"
        },

        {
            provide: PROVIDER_VALUE_PROVIDERS,
            useValue: "root - value providers"
        },

        {
            provide: PROVIDER_VALUE_VIEW_PROVIDERS,
            useValue: "root - valie view providers"
        }

    ],
})
export class AppModule { }