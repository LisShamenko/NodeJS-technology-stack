import React from 'react';

// выполняет рендеринг компонентов React для тестирования, 
//      поставляется вместе с Jest:
//      https://ru.reactjs.org/docs/test-renderer.html
import renderer from 'react-test-renderer';

// 
import PostForm from './../../components/Post/PostForm';



// --------------- 10. Тестирование.

// 
describe('component PostForm', () => {

    // 
    let user = {
        "id": "00000000-0000-0000-0000-000000000000",
        "name": "name",
        "image": "/static/images/users/0.jpg"
    };

    // 
    test('snapshot', () => {

        // jest.fn создает mock-функцию, которая позволяет изолировать код и делать
        //      утверждения о том, как компонент использовал mock-функцию, была ли она 
        //      вызвана и с какими аргументами
        const props = { onSubmit: jest.fn(), user: user };

        // чтобы протестировать конструктор следует использовать Sinon, в конструкторе 
        //      происходит инициализация состояния компонента, привязка методов и 
        //      другие настройки

        // создать обертку компонента
        const component = renderer.create(<PostForm {...props} />);

        // генерировать снимок компонента
        const tree = component.toJSON();

        // проверка снимка
        expect(tree).toMatchSnapshot();
    });

    // 
    test('handlePostChange', () => {

        // фиктивные объекты
        const props = { onSubmit: jest.fn(), user: user };
        const mockEvent = { target: { value: 'value' } };

        // имитация функции setState для обновления состояния компонента
        PostForm.prototype.setState = jest.fn(function (updater) {
            this.state = Object.assign(this.state, updater(this.state));
        });

        // создать компонент и вызвать тестируемый метод
        const component = new PostForm(props);
        component.handlePostChange(mockEvent);

        // проверки после выполнения тестируемого метода
        expect(component.setState).toHaveBeenCalled();
        expect(component.setState.mock.calls.length).toEqual(1);
        expect(component.state).toEqual({
            isValid: true,
            content: mockEvent.target.value,
        });
    });

    // 
    test('handleSubmit', () => {

        // фиктивные свойства
        const props = { onSubmit: jest.fn(), user: user };

        // фиктивный объект события
        const mockEvent = {
            target: { value: 'value' },
            preventDefault: jest.fn()
        };

        //
        PostForm.prototype.setState = jest.fn(function (updater) {
            this.state = Object.assign(this.state, updater(this.state));
        });

        //
        const component = new PostForm(props);

        // напрмую изменить состояние компонента и вызвать тестируемый метод
        component.state = {
            isValid: true,
            content: 'content'
        };
        component.handleSubmit(mockEvent);

        // проверка
        expect(component.setState).toHaveBeenCalled();
        expect(props.onSubmit).toHaveBeenCalledWith({
            content: 'content',
            userId: user.id
        });
    });
});