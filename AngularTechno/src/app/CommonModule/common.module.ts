import { NgModule } from "@angular/core";

// канал
import { ModulePlusPipe } from "./pipes/module_plus.pipe";
import { ModuleFilterPipe } from "./pipes/module_filter.pipe";

// директивы
import { ModuleChildDirective } from "./directives/module_child.directive";
import { ModuleParentDirective } from "./directives/module_parent.directive";
import { ModuleIfDirective } from "./directives/module_if.directive";
import { ModelForDirective } from "./directives/module_for.directive";
import { ModuleDifferDirective } from "./directives/module_differ_for.directive";

// сервисы
import { LoggingLevel, ModuleLoggingService } from "./services/module_logging.service";

// токены
import { LOGGING_LEVEL, MODULE_LOGGING } from "./tokens/module_tokens";

// модули
import { ModelsModule } from "../ModelsModule/models.module";

// --------------- Функциональные модули

// - функциональные модули группируют взаимосвязанный код в единый блок (модуль),
//      который можно подключить к приложению в свойстве imports, тогда содержимое модуля
//      станет доступным во всем приложении, целью функционального модуля является 
//      предоставление и контроль доступа к содержимому папки модуля в коде приложения

// - при создании модуля можно группировать некоторую функциональность приложения или
//      набор структурных блоков (компонентов, директив и тд.)

// - провайдеры функционального модуля регистрируются в корневом модуле, что делает доступными 
//      все службы модуля в приложении, локальные провайдеры функционального модуля доступны для 
//      их потомков представлений и контентных потомков, даже если они определяются в других модулях

// --------------- декоратор @NgModule для функционального модуля

// imports          перечисляет импортируемые модули

// providers        провайдеры модуля, набор провайдеров функционального модуля объединяется с 
//                  провайдерами корневого модуля, из чего следует что службы модуля будут 
//                  доступны во всем приложении

// declarations     объявляемые классы модуля, так же должно содержать классы приложения 
//                  используемые в модуле

// exports          экспортируемые объекты модуля, может содержать объявляемые классы из 
//                  свойства declarations и модули из свойства imports

// --------------- вспомогательный функциональный модуль

// - вспомогательный модуль группирует всю общую функциональность приложения

@NgModule({
    // некоторые классы модуля зависят от служб, определенных в модуле модели
    imports: [ModelsModule],
    // обеспечивает доступ классам функционального модуля к необходимым им службам, будут доступны 
    //      во всем приложении
    providers: [
        {
            provide: LOGGING_LEVEL,
            useValue: LoggingLevel.DEBUG
        },
        {
            provide: MODULE_LOGGING,
            deps: [LOGGING_LEVEL],
            useFactory: (level: LoggingLevel) => {
                return new ModuleLoggingService(level);
            }
        },
    ],
    // список директив, каналов и компонентов в модуле, это свойство дает возможность использовать 
    //      объявляемые классы в шаблонах модуля и открывает к ним доступ за пределами модуля
    declarations: [ModulePlusPipe, ModuleFilterPipe, ModuleChildDirective, ModuleParentDirective, ModuleIfDirective, ModelForDirective, ModuleDifferDirective],
    // определяет объявляемые классы, предоставляемые модулем при его импортировании в других модулях 
    //      приложения, это эквивалентно добавлению перечисленных классов в свойство declarations 
    //      импортирующего модуля
    exports: [ModulePlusPipe, ModuleFilterPipe, ModuleChildDirective, ModuleParentDirective, ModuleIfDirective, ModelForDirective, ModuleDifferDirective]
})
export class CommonModule { }