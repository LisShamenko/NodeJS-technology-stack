import { Directive, ContentChildren, QueryList, Input } from "@angular/core";
import { ModuleChildDirective } from "./module_child.directive";

@Directive({
    selector: "table[module_parent]"
})
export class ModuleParentDirective {

    @Input("module_parent")
    isEnable: boolean = false;

    @ContentChildren(ModuleChildDirective, { descendants: true })
    contentChildren: QueryList<ModuleChildDirective> | null = null;

    ngAfterContentInit() {
        if (this.isEnable && this.contentChildren != null) {
            this.contentChildren.changes.subscribe(() => {
                setTimeout(() => this.updateContentChildren(), 0);
            });
        }
    }

    private updateContentChildren() {
        if (this.isEnable && this.contentChildren != null) {
            this.contentChildren.forEach((child, index) => {
                child.setModuleChildClass(true, "bg-info", "bg-info");
            });
        }
    }
}
