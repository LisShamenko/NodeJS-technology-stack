import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
Enzyme.configure({ adapter: new Adapter() });

// расширение функциональности expext
import '@testing-library/jest-dom';

// настройка в package.json
//      "jest": {
//          "testEnvironment": "jsdom",
//          "setupFiles": [
//            "raf/polyfill",
//            "./ReactTechno/Chapters/Tests/setup.js"
//          ]
//      },