// --------------- Factory

// Шаблон проектирования Factory использует класс Factory для возврата экземпляра одного из нескольких возможных классов на основе предоставленной ему информации.
// Суть этого шаблона состоит в том, чтобы поместить логику принятия решения относительно того, какой тип класса следует создать, в отдельный класс под названием класс Factory. Затем класс Factory вернет один из нескольких классов, которые являются тонкими вариациями друг друга, которые будут делать немного разные вещи в зависимости от их специальности. Поскольку мы не знаем, какой тип класса будет возвращать шаблон Factory, нам нужен способ работы с любой вариацией различных типов возвращаемых классов. Звучит как идеальный сценарий для интерфейса.

// Бизнес-требования
//      1. От вас требуется классифицировать людей по дате их рождения по трем возрастным группам: Младенцы, Дети и Взрослые.
//      2. Укажите с помощью значений true или false, достигли ли они совершеннолетия, чтобы подписать контракт.
//      3. Человек считается младенцем, если он моложе двух лет.
//      4. Младенцы не могут подписывать контракты.
//      5. Человек считается ребенком, если он моложе 18.
//      6. Дети также не могут подписывать контракты.
//      7. Человек считается совершеннолетним, если он старше 18.
//      8. Только взрослые могут подписывать контракты.
//      9. В целях отчетности каждый тип лица должен иметь возможность вывести свои данные.
//      10. Сюда должны быть включены: дата рождения, категория лица, могут ли они подписывать контракты или нет.

namespace FactoryPattern {

    enum PersonCategory {
        Infant,
        Child,
        Adult,
        Undefined
    }

    interface IPerson {
        Category: PersonCategory;
        canSignContracts(): boolean;
        printDetails(): void;
    }

    abstract class Person implements IPerson {
        Category: PersonCategory;
        private DateOfBirth: Date;
        constructor(dateOfBirth: Date) {
            this.DateOfBirth = dateOfBirth;
            this.Category = PersonCategory.Undefined;
        }
        abstract canSignContracts(): boolean
        printDetails(): void {
            console.log(`Person
                Date of Birth   : ${this.DateOfBirth.toDateString()}
                Category        : ${PersonCategory[this.Category]}
                Can sign        : ${this.canSignContracts()}`);
        }
    }

    class Infant extends Person {
        constructor(dateOfBirth: Date) {
            super(dateOfBirth);
            this.Category = PersonCategory.Infant;
        }
        canSignContracts(): boolean { return false; }
    }

    class Child extends Person {
        constructor(dateOfBirth: Date) {
            super(dateOfBirth);
            this.Category = PersonCategory.Child;
        }
        canSignContracts(): boolean { return false; }
    }

    class Adult extends Person {
        constructor(dateOfBirth: Date) {
            super(dateOfBirth);
            this.Category = PersonCategory.Adult;
        }
        canSignContracts(): boolean { return true; }
    }

    class PersonFactory {
        getPerson(dateOfBirth: Date): IPerson {
            let dateNow = new Date();
            let currentMonth = dateNow.getMonth() + 1;
            let currentDate = dateNow.getDate();
            let dateTwoYearsAgo = new Date(dateNow.getFullYear() - 2, currentMonth, currentDate);
            let date18YearsAgo = new Date(dateNow.getFullYear() - 18, currentMonth, currentDate);

            // 
            if (dateOfBirth >= dateTwoYearsAgo) {
                return new Infant(dateOfBirth);
            }
            else if (dateOfBirth >= date18YearsAgo) {
                return new Child(dateOfBirth);
            }
            else {
                return new Adult(dateOfBirth);
            }
        }
    }

    // 
    let factory = new PersonFactory();
    let p1 = factory.getPerson(new Date(2017, 0, 20));
    p1.printDetails();
    let p2 = factory.getPerson(new Date(2010, 0, 20));
    p2.printDetails();
    let p3 = factory.getPerson(new Date(1969, 0, 20));
    p3.printDetails();
}


