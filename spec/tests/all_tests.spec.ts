// класс TestBed отвечает за моделирование тестовой среды:
// - configureTestingModule     настройка тестового модуля Angular
// - createComponent            создание экземпляра компонента
// - compileComponents          компиляция компонентов

// ComponentFixture:
// - componentInstance   объект компонента
// - debugElement        тестовый управляющий элемент для компонента
// - nativeElement       объект DOM, представляющий управляющий элемент для компонента
// - detectChanges()     поиск изменений и отображение их в шаблоне компонента
// - whenStable()        Promise, обрабатываемый при полном применении эффекта операции

import { DebugElement } from "@angular/core";
import { TestBed, ComponentFixture, waitForAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { FourthComponent } from "../examples/components/fourth.component";
import { Product } from "../../AngularTechno/src/models/Product/product.model";
import { ProductRepository } from "../../AngularTechno/src/models/Product/product.repository";
import { ProductsSource } from "../../AngularTechno/src/models/Product/product.datasource";
import { TestDirective } from "../examples/directives/test.directive";
import { FifthComponent } from "../examples/components/fifth.component";
import { TestComponent } from "../examples/components/test.component";
import { MockProductSource } from "../examples/models/mock_product.datasource";

describe("All Tests", () => {

    // ComponentFixture предоставляет функциональность для тестирования компонентов
    let firstFixture: ComponentFixture<FifthComponent>;
    let firstComponent: FifthComponent;
    let firstDebugElement: DebugElement;
    let firstElement: HTMLSpanElement;

    // службы в модульных тестах заменяются фиктивными объектами
    let mockRepository = {
        getProducts: function () {
            return [
                new Product(1, "product 1", "category 1", 1),
                new Product(2, "product 2", "category 2", 10),
                new Product(3, "product 3", "category 2", 100),
            ]
        }
    }

    // 
    let mockProductSource = new MockProductSource();

    //
    let fourthFixture: ComponentFixture<FourthComponent>;
    let fourthComponent: FourthComponent;
    let fourthDebugElement: DebugElement;
    let fourthElement: HTMLSpanElement;
    let fourthDivElement: HTMLDivElement;

    // 
    let testFixture: ComponentFixture<TestComponent>;
    let fourthFromTest: FourthComponent | undefined;
    let testDebugElement: DebugElement;
    let testDirective: TestDirective | undefined;
    let testSpanElement: HTMLSpanElement;



    // использование TestBed за пределами функции вызовет ошибку Promise
    beforeEach(waitForAsync(() => {

        console.log(`--- beforeEach`);

        // --------------- настройка TestBed

        // настройка тестового модуля Angular с теми же свойствами, что и у @NgModel
        TestBed.configureTestingModule({
            // компонент следует добавить в declarations как и в обычном модуле
            declarations: [FifthComponent, FourthComponent, TestComponent, TestDirective],
            // свойство providers настраивается по аналогии с реальными модулями Angular
            providers: [
                // 
                {
                    provide: ProductRepository,
                    useValue: mockRepository
                },
                {
                    provide: ProductsSource,
                    useValue: mockProductSource
                }
            ]
        });

        // создать экземпляр компонента
        firstFixture = TestBed.createComponent(FifthComponent);
        // получение объекта FifthComponent созданного тестовой средой
        firstComponent = firstFixture.componentInstance;

        // --------------- DebugElement / By

        // DebugElement: 
        // - nativeElement                       объект представляющий элемент HTML в DOM
        // - children                            массив дочерних объектов DebugElement
        // - query(selectorFunction)             поиск одного элемента DebugElement в шаблоне
        // - queryAll(selectorFunction)          поиск всех элементов DebugElement в шаблоне
        // - triggerEventHandler(name, event)    инициирует событие

        // By: 
        // - By.all()               выбрать все элементы
        // - By.css(selector)       выбирает элементы при помощи селектора CSS 
        // - By.directive(type)     выбирает элементы к которым была применена указанная директива

        // DebugElement представляет корневой элемент из шаблона компонента
        firstDebugElement = firstFixture.debugElement;

        // 
        let cssSpan = By.css("span");
        let cssDebugElement: DebugElement = firstDebugElement.query(cssSpan);
        firstElement = cssDebugElement.nativeElement;

        // --------------- компоненты с внешним шаблоном

        // при компиляции компонентов внешние шаблоны включаются в генерируемый код
        //      в текстовом виде, при тестистировании следует выполнять явно шаг компиляции
        TestBed.compileComponents().then(() => {

            console.log(`--- --- COMPILE COMPLETE ---`);

            fourthFixture = TestBed.createComponent(FourthComponent);
            fourthComponent = fourthFixture.componentInstance;
            fourthDebugElement = fourthFixture.debugElement;
            fourthElement = fourthDebugElement.query(By.css("span")).nativeElement;
            fourthDivElement = fourthDebugElement.children[0].nativeElement;

            // 
            testFixture = TestBed.createComponent(TestComponent);

            // требуется вызвать detectChanges, чтобы в компоненте TestComponent были 
            //      обновлены свойства @ViewChild
            testFixture.detectChanges();
            fourthFromTest = testFixture.componentInstance.fourthComponent;
            testDirective = testFixture.componentInstance.testDirective;

            // выбрать дочерний компонент и дочернюю директиву
            testDebugElement = testFixture.debugElement.query(By.directive(FourthComponent));
            testSpanElement = testFixture.debugElement.query(By.css("span.initialClass")).nativeElement;

            // в компоненте TestComponent содержится два элемента span, один в дочернем компоненте 
            //      FourthComponent и еще один в шаблоне TestComponent сразу после объявления 
            //      <fourth-component>, проверка: 
            //
            //      let allSpans = testFixture.debugElement.queryAll(By.css("span"));
            //      allSpans.forEach(spanItem => {
            //          console.log(`--- --- --- --- SPANS --- className = ${spanItem.nativeElement.className}`);
            //      });

            console.log(`--- --- COMPILE PROCESS END---`);
        });
    }));


    
    // --------------- простое тестирование

    it("--- toBeDefined", () => {
        // expect выбирает объект компонента как цель теста, а метод toBeDefined выполняет тест
        expect(firstComponent).toBeDefined()
    });

    it("--- call component's methods", () => {
        firstComponent.category = "category 1";
        expect(firstComponent.getCountProducts()).toBe(1);
        firstComponent.category = "category 2";
        expect(firstComponent.getCountProducts()).toBe(2);
        firstComponent.category = "category 3";
        expect(firstComponent.getCountProducts()).toBe(0);
    });

    // --------------- тестирование выражений привязок

    it("--- binding", () => {

        // после каждого изменения свойства category вызывается метод detectChanges, который
        //      вызывает обработку любых изменений и пересчет выражений привязок данных
        firstComponent.category = "category 1";
        firstFixture.detectChanges();
        expect(firstComponent.getCountProducts()).toBe(1);
        expect(firstElement.textContent).toContain("1");

        // 
        firstComponent.category = "category 2";
        firstFixture.detectChanges();
        expect(firstComponent.getCountProducts()).toBe(2);
        expect(firstElement.textContent).toContain("2");

        // 
        firstComponent.category = "category 3";
        firstFixture.detectChanges();
        expect(firstComponent.getCountProducts()).toBe(0);
        expect(firstElement.textContent).toContain("0");
    });

    // --------------- тестирование событий компонентов

    it("--- events", () => {

        // triggerEventHandler иницирует событие
        expect(fourthComponent.highlighted).toBeFalsy();
        expect(fourthDivElement.classList.contains("bg-success")).toBeFalsy();
        fourthDebugElement.triggerEventHandler("mouseenter", new Event("mouseenter"));
        fourthFixture.detectChanges();

        // 
        expect(fourthComponent.highlighted).toBeTruthy();
        expect(fourthDivElement.classList.contains("bg-success")).toBeTruthy();
        fourthDebugElement.triggerEventHandler("mouseleave", new Event("mouseleave"));
        fourthFixture.detectChanges();

        // 
        expect(fourthComponent.highlighted).toBeFalsy();
        expect(fourthDivElement.classList.contains("bg-success")).toBeFalsy();
    });

    // --------------- тестирование выходных свойств

    it("--- output property", () => {

        // получить событие от выходного свойства
        let highlighted: boolean | null = null;
        fourthComponent.change.subscribe(value => highlighted = value);

        // проверка события mouseenter
        fourthDebugElement.triggerEventHandler("mouseenter", new Event("mouseenter"));
        expect(highlighted).toBeTruthy();

        // проверка события mouseleave
        fourthDebugElement.triggerEventHandler("mouseleave", new Event("mouseleave"));
        expect(highlighted).toBeFalsy();
    });

    // --------------- тестирование входных свойств

    it("--- input property", () => {

        if (fourthFromTest == undefined) {
            expect(true).toBeFalsy();
            return;
        }

        // 
        fourthFromTest.category = "category 1";
        testFixture.detectChanges();
        let products = mockRepository.getProducts()
            .filter(p => p.category == fourthFromTest?.category);

        // 
        let componentProducts = fourthFromTest.getProducts();
        for (let i = 0; i < componentProducts.length; i++) {
            expect(componentProducts[i]).toEqual(products[i]);
        }

        // 
        let textContent = testDebugElement.query(By.css("span")).nativeElement.textContent;
        expect(textContent).toContain(products.length);
    });

    // --------------- тестирование асинхронных операций

    it("--- async operation", () => {

        // 
        mockProductSource.data.push(new Product(100, "product 5", "category 5", 100));

        // не оказывает непосредственного влияния на компонент
        fourthFixture.detectChanges();

        // whenStable возвращает Primise, разрешаемый при полной обработке всех изменений,
        //      что позволяет отложить обработку теста до момента срабатывания асинхронной
        //      операции
        fourthFixture.whenStable().then(() => {
            let products = fourthComponent.getProductsAsync();
            expect(products.length).toBe(3);
        });
    });

    // --------------- тестирование директив

    it("--- directive", () => {

        if (testDirective == undefined) {
            expect(true).toBeFalsy();
            return;
        }

        // 
        testFixture.detectChanges();
        expect(testDirective.bgClass).toBe("initialClass");
        expect(testSpanElement.className).toBe("initialClass");

        // 
        testFixture.componentInstance.className = "nextClass";
        testFixture.detectChanges();
        expect(testDirective.bgClass).toBe("nextClass");
        expect(testSpanElement.className).toBe("nextClass");
    });

});