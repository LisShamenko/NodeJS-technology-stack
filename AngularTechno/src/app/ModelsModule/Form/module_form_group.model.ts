import { FormGroup, Validators } from "@angular/forms";
import { ModuleFormControl } from "./module_form_control.model";
import { ModuleValidator } from "./module_validator.interval";

export class ModuleFormGroup extends FormGroup {

    constructor() {
        super({
            name: new ModuleFormControl("Name", "name", "", Validators.required),
            category: new ModuleFormControl("Category", "category", "",
                Validators.compose([
                    Validators.required,
                    ModuleValidator.StartsWith("category")
                ])),
            price: new ModuleFormControl("Price", "price", "",
                Validators.compose([
                    Validators.required,
                    Validators.pattern("^[0-9\.]+$")
                ]))
        });
    }

    getFormMessages(): string[] {

        let controlProps = Object.keys(this.controls);
        let letProductControls: ModuleFormControl[] = controlProps.map(
            prop => this.controls[prop] as ModuleFormControl
        );

        let messages: string[] = [];
        letProductControls.forEach(control => {
            let controlMessages = control.getControlMessages();
            controlMessages.forEach(message => messages.push(message))
        });
        return messages;
    }
}