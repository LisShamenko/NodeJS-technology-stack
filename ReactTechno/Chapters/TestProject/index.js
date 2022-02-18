// импорт основного пакета React и метода render из React DOM
import React from 'react';
import { render } from 'react-dom';

// компонент приложения
import App from './App';

// стили
import './../../styles/styles.scss';

// Основной вызов метода render, с которого стартует приложение. 
//      Когда сценарий будет запущен браузером, он отобразит основное приложение и 
//      React возьмет работу на себя. Без этого вызова приложение запущено не будет. 
render(<App />, document.getElementById('app'));