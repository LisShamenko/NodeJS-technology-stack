import { Component, ViewChild } from "@angular/core";
import { TestDirective } from "../directives/test.directive";
import { FourthComponent } from "./fourth.component";

@Component({
    template: `
        <fourth-component [input-string]="inputString"></fourth-component>
        <span [test-directive]="className">Test Content</span>`
})
export class TestComponent {

    // 
    inputString: string = "";
    @ViewChild(FourthComponent)
    fourthComponent?: FourthComponent;

    // 
    className = "initialClass";
    @ViewChild(TestDirective)
    testDirective?: TestDirective;
}