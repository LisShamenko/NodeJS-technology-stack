import { Pipe } from "@angular/core";

@Pipe({
    name: "module_plus_pipe"
})
export class ModulePlusPipe {
    transform(value: any, plusValue?: any): number {
        if (Number.parseFloat(value) == NaN) {
            return 0;
        }
        else if (Number.parseFloat(plusValue) == NaN) {
            return value;
        }
        else {
            return value + plusValue;
        }
    }
}