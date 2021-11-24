import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CSSBaseComponent } from "./components/css_base/css_base.component";
import { RelativeUnitsComponent } from "./components/relative_units/relative_units.component";
import { FloatElementsComponent } from "./components/float_elements/float_elements.component";
import { FlexboxLayoutsComponent } from "./components/flexbox_layouts/flexbox_layouts.component";

@NgModule({
    imports: [
        BrowserModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule,
    ],
    declarations: [
        CSSBaseComponent, RelativeUnitsComponent, 
        FloatElementsComponent,
        FlexboxLayoutsComponent
    ],
    bootstrap: [
        CSSBaseComponent, RelativeUnitsComponent, 
        FloatElementsComponent,
        FlexboxLayoutsComponent
    ],

})
export class CSSModule { }