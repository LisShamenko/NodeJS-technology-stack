import { Component, Output, EventEmitter } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ModuleFormControl } from "../../../ModelsModule/Form/module_form_control.model";
import { ModuleFormGroup } from "../../../ModelsModule/Form/module_form_group.model";
import { ModuleProduct } from "../../../ModelsModule/Product/module_product.model";

@Component({
    selector: "module-form-component",
    templateUrl: "./module_form.template.html",
    styleUrls: ["./module_form.style.css"],
})
export class ModuleFormComponent {

    moduleForm: ModuleFormGroup = new ModuleFormGroup();
    currentProduct: ModuleProduct = new ModuleProduct();
    isFormSubmit: boolean = false;

    @Output("module-create-product")
    createProduct = new EventEmitter<ModuleProduct>();

    submitForm(form: ModuleFormGroup) {
        this.isFormSubmit = true;
        if (form.valid) {
            this.createProduct.emit(this.currentProduct);
            this.currentProduct = new ModuleProduct();
            this.moduleForm.reset();
            this.isFormSubmit = false;
        }
    }

    getControlMessages(formGroup: FormGroup, controlName: string): string[] {
        let messages: string[] = [];
        let moduleFormGroup: ModuleFormGroup = formGroup as ModuleFormGroup;
        let control: ModuleFormControl = moduleFormGroup.controls[controlName] as ModuleFormControl;
        if (control !== undefined) {
            return control.getControlMessages();
        }
        return messages;
    }
}