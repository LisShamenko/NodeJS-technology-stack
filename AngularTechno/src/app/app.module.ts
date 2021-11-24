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
// директивы
import { DirectiveSimple } from "../directives/directive.simple";
import { DirectiveTwowayBinding } from "../directives/directive.twoway_binding";
import { DirectiveStructure } from "../directives/directive.structure";
import { DirectiveIterator } from "../directives/directive.iterator";
import { DirectiveDiffer } from "../directives/directive.differ";
import { DirectiveParent } from "../directives/directive.parent";
import { DirectiveChild } from "../directives/directive.child";

// @NdModule - корневой модуль, который отвечает за описание приложения для Angular:
//      используемые зависимости, компоненты, точки входа
// BrowserModule - обеспечивает встроенные функции шаблонов, такие как последовательности '{{' и '}}'
// FormsModule - позволяет использовать формы
// ReactiveFormsModule - поддержка форм на базе моделей, критерии валидации форм задаются в коде,
//      а не в шаблоне, что дает лучшую масштабируемость

@NgModule({
    // задает зависимости, используемые приложением
    imports: [BrowserModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule],
    // описывает функции, предоставляемые приложением для внешнего доступа, регистрирует компоненты и директивы
    declarations: [
        ProductComponent, AppComponent, FormComponent, DirectiveComponent, StructuralDirectiveComponent,
        DirectiveSimple, DirectiveTwowayBinding, DirectiveStructure, DirectiveIterator, DirectiveDiffer, DirectiveParent, DirectiveChild
    ],
    // определяет точку входа приложения
    bootstrap: [ProductComponent, AppComponent, FormComponent, DirectiveComponent, StructuralDirectiveComponent]
})
export class AppModule { }
