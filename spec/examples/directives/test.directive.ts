import { Directive, ElementRef, Attribute, Input, SimpleChange } from "@angular/core";
@Directive({
    selector: "[test-directive]"
})
export class TestDirective {

    @Input("test-directive")
    bgClass: string = "initialClass";

    constructor(private element: ElementRef) { }

    ngOnInit() {
        this.element.nativeElement.classList.add(this.bgClass);
    }

    ngOnChanges(changes: { [property: string]: SimpleChange }) {

        console.log(`--- TestDirective --- ngOnChanges`);

        let change = changes["bgClass"];
        
        console.log(`--- --- change = `, change);

        let classList = this.element.nativeElement.classList;

        console.log(`--- --- classList = `, classList);

        if (!change.isFirstChange() && classList.contains(change.previousValue)) {
            classList.remove(change.previousValue);
            //this.element.nativeElement.className = '';
        }
        if (!classList.contains(change.currentValue)) {
            classList.add(change.currentValue);
            //this.element.nativeElement.className = change.currentValue;
        }
    }
}