import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CSSBaseComponent } from "./components/css_base.component";

@NgModule({
    imports: [
        BrowserModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule,
    ],
    declarations: [
        CSSBaseComponent,
    ],
    bootstrap: [
        CSSBaseComponent,
    ],

})
export class CSSModule { }