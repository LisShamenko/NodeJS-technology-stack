import { FormControl } from "@angular/forms";

export class ModuleFormControl extends FormControl {

    label: string;
    modelProperty: string;

    constructor(label: string, property: string, value: any, validator: any) {
        super(value, validator);
        this.label = label;
        this.modelProperty = property;
    }

    getControlMessages() {
        let messages: string[] = [];
        if (this.errors) {
            for (let errorName in this.errors) {
                switch (errorName) {

                    case "required":
                        messages.push(`required ${this.label}`); 
                        break;

                    case "pattern":
                        messages.push(`pattern ${this.label}`); 
                        break;

                    case "module_validator":
                        messages.push(`module_validator ${this.label}: ${this.errors['module_validator'].starts_with}`);
                        break;
                }
            }
        }
        return messages;
    }
}