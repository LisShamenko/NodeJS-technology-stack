// класс сервиса
export class FirstService {
    private variableValue: number = 0;
    public get variableProperty(): number {
        return this.variableValue;
    }
    public set variableProperty(newValue: number) {
        this.variableValue = newValue;
    }
    public applyProperty(oldValue: number) {
        return this.variableValue + oldValue;
    }
}