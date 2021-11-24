import { Directive, ElementRef, HostBinding } from "@angular/core";

@Directive({
    // директива будет работать с элементами td
    selector: "td[child]"
})
export class DirectiveChild {

    // привязка к свойству class
    @HostBinding("class")
    classProperty: string = "";

    constructor(private element: ElementRef) { }

    // родительская директива запрашивает управляющий элемент для поиска дочерней 
    //      директивы, чтобы вызвать setChildClass
    setChildClass(isSet: Boolean) {
        //console.log(`--- --- --- дочерняя директива --- isSet = ${isSet}`);
        this.classProperty = isSet ? "bg-inverse" : "";

        // 
        let classList = this.element.nativeElement.classList;
        if (isSet) {
            classList.remove("bg-danger");
            classList.add("bg-success");
        }
        else {
            classList.remove("bg-success");
            classList.add("bg-danger");
        }
    }
}