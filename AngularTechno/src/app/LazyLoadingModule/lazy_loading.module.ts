import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FirstComponent } from "./components/first.component";
import { SecondComponent } from "./components/second.component";
import { ThirdComponent } from "./components/third.component";
import { LazyLoadingComponent } from "./components/lazy_loading.component";

// --------------- защитники маршрутов

// - защитники (guards) используются для управления навигацией к разным частям приложения, 
//      защитники задаются в настройках маршрута:
//      - resolve               защитник откладывающий активацию маршрута до завершения 
//                              некоторых действий
//      - canActivate           защитник проверяющий возможность активации маршрута
//      - canActivateChild      защитник проверяющий возможность активации дочернего маршрута
//      - canDeactivate         защитник проверяющий возможность деактивизации маршрута
//      - canLoad               отвечает за динамическую загрузку модулей

// --------------- динамическая загрузка функциональных модулей

// - динамическая (отложенная) загрузка позволяет загружать модули по требованию, 
//      модули должны содержать только необходимую функциональность для части 
//      приложения

// - благодаря динамической загрузке приложение становится меньше и загружается быстрее, 
//      но увеличивается время ожидания при доступе к функционалу запокованному в модуль

// - важно не создавать зависимостей с динамически загружаемыми модулями, чтобы загрузчик 
//      модулей не пытался заранее загружать эти модули

// --------------- динамическая загрузка модулей

// - метод forRoot предназначен для определения маршрутов в корневом модуле приложения
// - метод forChild следует использовать в динамически загружаемых модулях, этот метод 
//      создает конфигурацию маршрутизации, которая подключается к общей системе 
//      маршрутизации

// - альтернативный метод регистрации маршрутов с именованными элементами router-outlet, 
//      основная часть URL-адреса выбирает первичный элемент router-outlet, а части в
//      скобках — элементы left и right:
//      http://localhost:3000/lazy_loading/primarypath(left:leftpath//right:rightpath)

// конфигурация маршрутов
let routing = RouterModule.forChild([
    {
        path: "",
        component: LazyLoadingComponent,
        children: [
            {
                path: "third",
                children: [
                    {
                        outlet: "primary",
                        path: "",
                        component: ThirdComponent
                    },
                    {
                        outlet: "left",
                        path: "",
                        component: ThirdComponent
                    },
                    {
                        outlet: "right",
                        path: "",
                        component: ThirdComponent
                    },
                ]
            },
            {
                path: "",
                children: [
                    {
                        // outlet назначает элемент router-outlet для маршрута, по умолчанию
                        //      маршрут относится к первому элементу router-outlet, primary
                        //      означает первичный элемент router-outlet, значения outlet
                        //      задаются в атрибуте name элемента router-outlet
                        outlet: "primary",
                        path: "",
                        component: FirstComponent,
                    },
                    {
                        outlet: "left",
                        path: "",
                        component: SecondComponent,
                    },
                    {
                        outlet: "right",
                        path: "",
                        component: SecondComponent,
                    },
                ]
            },
        ]
    }
]);

@NgModule({
    imports: [CommonModule, routing],
    declarations: [LazyLoadingComponent, FirstComponent, SecondComponent, ThirdComponent],
    exports: [LazyLoadingComponent]
})
export class LazyLoadingModule { }