import { AbstractControl } from "@angular/forms";

export class ModuleValidator {

    // 
    static StartsWith(startString: string) {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (control.value && control.value.startsWith && control.value.startsWith(startString)) {
                return null;
            }
            else {
                return { "module_validator": { "starts_with": startString } };
            }
        }
    }
}