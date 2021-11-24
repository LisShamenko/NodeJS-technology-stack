describe("First Jasmine Test", () => {
    // методы expect и toBe используются для проверки равенства
    it("--- toBe", () => expect(true).toBe(true));
    it("--- toBeGreaterThan", () => expect(100).toBeGreaterThan(10));
    it("--- toMatch", () => expect("sample").toMatch("^sam"));
});

// --------------- Jasmine

// методы Jasmine:
// - describe(description, function)  группировкА взаимосвязанных тестов
// - beforeEach(function)             функция, которая будет выполняться перед каждым тестом
// - afterEach(function)              функция, которая будет выполняться после каждого теста
// - it(description, function)        выполнение теста
// - expect(value)                    идентификация результата теста
// - toBe(value)                      ожидаемое значение теста

// проверка результатов:
// - toBe(value)                 равенство заданному значению, но не объекту
// - toEqual(object)             равенство объектов
// - toMatch(regexp)             соответствие регулярному выражению
// - toBeDefined()               результат определен
// - toBeUndefined()             результат не определен
// - toBeNull()                  результат равен null
// - toBeTruthy()                результат является квазиистинным
// - toBeFalsy()                 результат является квазиложным
// - toContain(substring)        содержит подстроку
// - toBeLessThan(value)         меньше заданного значения
// - toBeGreaterThan(value)      больше заданного значения