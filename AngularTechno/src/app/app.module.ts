import { NgModule } from "@angular/core";
// модули
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// компоненты
import { ProductComponent } from "./../components/ProductComponent/product.component";

// @NdModule - корневой модуль, который отвечает за описание приложения для Angular:
//      используемые зависимости, компоненты, точки входа
// BrowserModule - обеспечивает встроенные функции шаблонов, такие как последовательности '{{' и '}}'

@NgModule({
    // задает зависимости, используемые приложением
    imports: [BrowserModule, BrowserAnimationsModule],
    // описывает функции, предоставляемые приложением для внешнего доступа, регистрирует компоненты
    declarations: [ProductComponent],
    // определяет точку входа приложения
    bootstrap: [ProductComponent]
})
export class AppModule { }
