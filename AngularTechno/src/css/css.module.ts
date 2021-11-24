import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CSSBaseComponent } from "./components/css_base.component";
import { RelativeUnitsComponent } from "./components/relative_units.component";

@NgModule({
    imports: [
        BrowserModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule,
    ],
    declarations: [
        CSSBaseComponent, RelativeUnitsComponent,
    ],
    bootstrap: [
        CSSBaseComponent, RelativeUnitsComponent,
    ],

})
export class CSSModule { }