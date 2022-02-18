// функция
const mathFunction = (a) => (a * 20 + 50) / 10;

// объект
export function calculate(items) {
    const total = items.reduce((cost, item) => cost + item.cost, 0);
    return { orderItems: items, total };
}

// Функция describe используется для обертывания нескольких связанных тестов
describe("simple tests", () => {

    // Тестовая функция test - это функция для проверки одного действия, аргументы: 
    //      имя теста;
    //      функция, содержащая проверку; 
    //      тайм-аут, по умолчанию 5 секунд.

    // 
    test("mathematical function", () => {
        // утверждение expect и функция сопоставления результата toBe
        expect(mathFunction(4)).toBe(13);
    });

    // 
    test("comparison of objects", () => {

        // данные
        const items = [
            { id: "3", cost: 1 },
            { id: "1", cost: 10 },
            { id: "2", cost: 100 },
        ];

        // результат
        const result = {
            orderItems: items,
            total: 111
        };

        // чтобы протестировать объект или массив следует использовать toEqual
        expect(calculate(items)).toEqual(result);
    });
});