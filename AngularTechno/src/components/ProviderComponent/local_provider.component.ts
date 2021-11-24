import { Component, Inject, SkipSelf } from "@angular/core";
import { FourthService } from "src/services/fourth.service";
import { ProviderBaseService } from "src/services/provider_base.service";
import { ProviderSubclassService } from "src/services/provider_subclass.service";
import { ThirdService } from "src/services/third.service";
import { PROVIDER_BASE_SERVICE, PROVIDER_BOTH_SERVICES, PROVIDER_INSTANCE, PROVIDER_MULTI, PROVIDER_SUB_SERVICE, PROVIDER_VALUE, PROVIDER_VALUE_PROVIDERS, PROVIDER_VALUE_VIEW_PROVIDERS } from "src/Tokens/provider_tokens";

// --------------- локальные провайдеры в директивах

// - Angular использует инжектор, чтобы разрешать зависимости при создании экземпляров классов, 
//      инжектор анализарует конструктор на зависимости и использует провайдеры для их разрешения

// - существует иерархия инжекторов, соответствующая дереву компонентов и директив в приложении, 
//      каждый инжектор может объявлять свои провайдеры, которые называются локальными провайдерами

// - при разрешении зависимостей Angular использует сначала локальные инжекторы, двигаясь по иерархии
//      компонентов и директив от дочерних к родительским элементам, корневой модуль содержит последний 
//      инжектор в этой цепочке

// - все зависимости маркера на уровне корневого модуля разрешаются с использованием одного объекта

// - локальные провайдеры будут использованы если потребуется разрешить зависимости директивы или ее
//      контентных потомков (директивы или канала)

@Component({
    selector: 'local-provider',
    templateUrl: './local_provider.template.html',

    // --------------- локальные провайдеры в компонентах

    // - для одной и той же зависимости можно определять провайдеры только в одной из настроек: providers или viewProviders

    // в providers определяются провайдеры для потомков представления, определяемых в шаблоне и 
    //      контентных потомков из управляющего элемента
    providers: [
        {
            provide: PROVIDER_VALUE,
            useValue: "LocalProviderComponent -> value (опция providers!)"
        },
        {
            provide: PROVIDER_VALUE_PROVIDERS,
            useValue: "LocalProviderComponent -> providers (опция providers!)"
        }
    ],

    // viewProviders определяет провайдеры только для потомков представлений
    //      - потомок представления получит службу от провайдера компонента
    //      - контентный потомок получит службу от провайдера модуля
    viewProviders: [
        // это определение PROVIDER_VALUE используется каналом и директивами
        {
            provide: PROVIDER_VALUE,
            useValue: "LocalProviderComponent -> value (опция viewProviders!)"
        },
        {
            provide: PROVIDER_VALUE_VIEW_PROVIDERS,
            useValue: "LocalProviderComponent -> viewProviders (опция viewProviders!)"
        }
    ]

    // --------------- декораторы разрешения зависимостей

    // @Host        ограничивает поиск провайдера ближайшим компонентом, применяется вместе с @Optional
    //              аргумент службы будет равен undefined
    // @Optional    игнорирует ошибку при разрешении зависимости
    // @SkipSelf    игнорирует провайдеры, определенные компонентом или директивой, для разрешения 
    //              собственых зависимостей, то есть провайдеры будут использованы только для разрешения 
    //              зависимостей потомков

    // ограничение поиска:
    //      constructor(@Inject(PROVIDER_VALUE) @Host() @Optional() providerValue: string)

    // игнорирование собственных провайдеров
    //      constructor(@Inject(PROVIDER_VALUE) @SkipSelf() private providerValue: string)

})
export class LocalProviderComponent {

    providerValue: string;

    constructor(
        public thirdService: ThirdService,
        public providerBase_1: ProviderBaseService,
        @Inject("base-provider") public providerBase_2: ProviderBaseService,
        @Inject(PROVIDER_BASE_SERVICE) public providerBase_3: ProviderBaseService,
        @Inject(PROVIDER_SUB_SERVICE) public providerSubclass: ProviderSubclassService,
        @Inject(PROVIDER_BOTH_SERVICES) public providerServices: ProviderBaseService[],
        @Inject(PROVIDER_INSTANCE) public fourthService: FourthService,
        @Inject(PROVIDER_MULTI) public fourthServices: FourthService[],
        @Inject(PROVIDER_VALUE) @SkipSelf() providerValue: string) {

        // 
        this.providerValue = (providerValue) ? providerValue : 'undefined';

        //
        providerServices.forEach(element => {
            element.sendMessage(`6. конструктор - разрешение 'multi: true'`)
        });

        // 
        fourthServices.forEach(element => element.sendMessage());
    }

    useThirdService() {
        return this.getProviderBaseServicesString(this.thirdService.providerServices);
    }
    useProviderServices() {
        return this.getProviderBaseServicesString(this.providerServices);
    }
    getProviderBaseServicesString(providerServices: ProviderBaseService[]) {
        let results: string[] = [];
        providerServices.forEach(element => {
            results.push(element.getMessage());
        });
        return results.join(', ');
    }

    useFourthServices(): string {
        let results: string[] = [];
        this.fourthServices.forEach(element => {
            results.push(element.message);
        });
        return results.join(', ');

    }
}