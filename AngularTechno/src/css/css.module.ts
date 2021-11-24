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
import { BackgroundComponent } from "./components/background/background.component";
import { ColorsComponent } from "./components/colors/colors.component";
import { FontsComponent } from "./components/fonts/fonts.component";
import { TransitionsComponent } from "./components/transitions/transitions.component";
import { TransformationsComponent } from "./components/transformations/transformations.component";
import { AnimationsComponent } from "./components/animations/animations.component";

@NgModule({
    imports: [
        BrowserModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule
    ],
    declarations: [
        CSSBaseComponent, RelativeUnitsComponent,
        FloatElementsComponent,
        FlexboxLayoutsComponent,
        CSSGridComponent,
        PositionOverlayComponent,
        AdaptiveDesignComponent,
        ModularCSSComponent,
        BackgroundComponent,
        ColorsComponent,
        FontsComponent,
        TransitionsComponent,
        TransformationsComponent,
        AnimationsComponent
    ],
    bootstrap: [
        CSSBaseComponent, RelativeUnitsComponent,
        FloatElementsComponent,
        FlexboxLayoutsComponent,
        CSSGridComponent,
        PositionOverlayComponent,
        AdaptiveDesignComponent,
        ModularCSSComponent,
        BackgroundComponent,
        ColorsComponent,
        FontsComponent,
        TransitionsComponent,
        TransformationsComponent,
        AnimationsComponent
    ],

})
export class CSSModule { }