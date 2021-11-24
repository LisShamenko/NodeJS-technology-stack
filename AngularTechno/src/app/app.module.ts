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
import { RootComponent } from "src/components/Components/root.component";
import { ProductFormComponent } from "src/components/Components/product_form.component";
import { NgcontentComponent } from "src/components/Components/ngcontent.component";
import { ProductTableComponent } from "src/components/Components/product_table.component";
// директивы
import { DirectiveSimple } from "../directives/directive.simple";
import { DirectiveTwowayBinding } from "../directives/directive.twoway_binding";
import { DirectiveStructure } from "../directives/directive.structure";
import { DirectiveIterator } from "../directives/directive.iterator";
import { DirectiveDiffer } from "../directives/directive.differ";
import { DirectiveParent } from "../directives/directive.parent";
import { DirectiveChild } from "../directives/directive.child";
// локаль
import { LOCALE_ID } from "@angular/core";

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
        RootComponent, ProductFormComponent, NgcontentComponent, ProductTableComponent,
        DirectiveSimple, DirectiveTwowayBinding, DirectiveStructure, DirectiveIterator, DirectiveDiffer, DirectiveParent, DirectiveChild
    ],
    // определяет точку входа приложения
    bootstrap: [
        ProductComponent, AppComponent, FormComponent, DirectiveComponent, StructuralDirectiveComponent,
        RootComponent
    ],
    // настройка локали
    providers: [{ provide: LOCALE_ID, useValue: "en-US" }],
})
export class AppModule { }