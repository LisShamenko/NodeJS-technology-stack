import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CSSBaseComponent } from "./components/css_base/css_base.component";
import { RelativeUnitsComponent } from "./components/relative_units/relative_units.component";
import { FloatElementsComponent } from "./components/float_elements/float_elements.component";
import { FlexboxLayoutsComponent } from "./components/flexbox_layouts/flexbox_layouts.component";
import { CSSGridComponent } from "./components/css_grid/css_grid.component";
import { PositionOverlayComponent } from "./components/position_overlay/position_overlay.component";
import { AdaptiveDesignComponent } from "./components/adaptive_design/adaptive_design.component";
import { ModularCSSComponent } from "./components/modular_css/modular_css.component";

@NgModule({
    imports: [
        BrowserModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule,
    ],
    declarations: [
        CSSBaseComponent, RelativeUnitsComponent, 
        FloatElementsComponent,
        FlexboxLayoutsComponent,
        CSSGridComponent,
        PositionOverlayComponent,
        AdaptiveDesignComponent,
        ModularCSSComponent
    ],
    bootstrap: [
        CSSBaseComponent, RelativeUnitsComponent, 
        FloatElementsComponent,
        FlexboxLayoutsComponent,
        CSSGridComponent,
        PositionOverlayComponent,
        AdaptiveDesignComponent,
        ModularCSSComponent
    ],

})
export class CSSModule { }