import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { AsyncHttpModule } from "../AsyncHttpModule/async_http.module";
import { TriggerComponent } from "./components/trigger.component";

// --------------- 

@NgModule({
    imports: [FormsModule, BrowserModule, AsyncHttpModule],
    declarations: [TriggerComponent],
    exports: [TriggerComponent],
})
export class TriggerModule { }