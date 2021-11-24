export class Message {
    // responses это массив кортежей из двух значений: 
    //      - имя ответа, который будет выведен для пользователя
    //      - функция которой будет передаваться имя
    constructor(
        public message: string,
        public responses?: [string, (arg: string) => void][]) { }
}