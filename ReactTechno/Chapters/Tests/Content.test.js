// Jasmine-style - стиль описания тестов при помощи describe и it.
//      https://jasmine.github.io/



import React from 'react';
import renderer from 'react-test-renderer';

// тестируемый компонент
import Content from './components/Content';

// Enzyme позволяет создавать пригодную для тестирования обертку компонента, при этом
//      компонент не встраивается и DOM не создается.
import { shallow } from 'enzyme';



// --------------- 10. Тестирование.

// При использовании методологии TDD при написании теста продумывается работа 
//      компонента, после чего реализуется сам компонент.

// describe делит тесты на отдельные звенья для тестирования разных частей кода
describe('component Content', () => {

    // тесты группируются при помощи describe
    describe('render', () => {

        // объявление теста, можно использовать it или test
        //      test('first test', () => { });

        // тесты должны быть простыми, особенно для крупных и сложных компонентов

        // 
        it('shallow', () => {

            // фиктивный объект
            const mockPost = {
                content: 'Контент.',
            };

            // Компоненты React должно быть простыми. Компонет следует разбивать 
            //      на части, если для его тестирования требуется множество тестов.

            // выполнить рендеринг компонента и вернуть обертку компонента
            const wrapper = shallow(<Content post={mockPost} />);

            // для выполнения утверждений испольузется встроенная функция expect,
            //      если утверждение не подтверждается, то тест терпит неудачу
            expect(wrapper.find('p').length).toBe(1);
            expect(wrapper.find('p.content').length).toBe(1);
            expect(wrapper.find('.content').text()).toBe(mockPost.content);
            expect(wrapper.find('p').text()).toBe(mockPost.content);
        });

        // 
        test('snapshot', () => {

            // 
            const mockPost = {
                content: 'Контент.',
            };

            // 
            const component = renderer.create(<Content post={mockPost} />);

            // Тестирование моментальных снимков - это процес, в котором тестируемый 
            //      визуальный вывод сравнивается с эталонным выводом. Jest будет 
            //      создавать JSON для тестов и хранить их в специальных каталогах, 
            //      которые должны быть добавлены в систему контроля.

            // 
            const tree = component.toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});