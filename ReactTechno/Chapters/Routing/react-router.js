import React from "react";
import { render } from "react-dom";

// 
import { Link, useLocation, Outlet } from "react-router-dom";
import { Routes, Route, Navigate } from "react-router-dom";
import { useRoutes, useParams, useNavigate } from "react-router-dom";
import { BrowserRouter as Router } from "react-router-dom";

import colorData from "./../../data/colorData";



// Redirects in React Router v6
//      https://gist.github.com/mjackson/b5748add2795ce7448a366ae8f8ae3bb
// 
// устаревший код:
//      import { Redirect } from "react-router-dom";
//      Чтобы перенаправить пользователя с одного маршрута на другой 
//      используется компонент Redirect. 
//      <Redirect from="services" to="about/services" />
// 
// новый код (v6):
//      <Route path="services" element={<Navigate replace to="about/services" />} />



// --------------- 12. Маршрутизация: React Router.

// --- 12.1 Components.

// 
function Home() {
    return (
        <div>
            <h2>Home</h2>
            <nav>
                {
                    // в пакете react-router-dom есть компонент 
                    //      Link для создания ссылок
                }
                <p><Link to="about">About</Link></p>
                <p><Link to="about/services">About - Services</Link></p>
                <p><Link to="dashboard">Dashboard</Link></p>
                <p><Link to="services">Services</Link></p>
            </nav>
        </div>
    );
}

// 
function About() {
    return (
        <div>
            <h2>About</h2>
            <p><Link to="/">Return.</Link></p>
            <p><Link to="services">Services.</Link></p>
            {
                // Вложенные маршруты.

                // Чтобы отобразить компонент Services следует использовать 
                //      компонент Outlet, который позволяет визуализировать 
                //      вложенные компоненты.
                //      http://localhost:3000/about/services
            }
            <Outlet />
        </div>
    );
}

//
function Dashboard() {
    return (
        <div>
            <h2>Dashboard</h2>
            <p><Link to="/">Return.</Link></p>
        </div>
    );
}

// Универсальный обработчик.
function NoMatch() {

    // хук useLocation позволяет определить текущий маршрут
    let location = useLocation();

    // значение location.pathname содержит посещаемый маршрут
    return (
        <div>
            <h2>Nothing to see here: {location.pathname}!</h2>
            <p><Link to="/">Go to the home page</Link></p>
        </div>
    );
}

// 
function Services() {
    return (
        <div>
            <h2>Services</h2>
            <p><Link to="/">Return.</Link></p>
            <p><Link to="colors/Crimson">Crimson.</Link></p>
            <p><Link to="colors/PaleGreen">PaleGreen.</Link></p>
            <p><Link to="colors/Aquamarine">Aquamarine.</Link></p>
        </div>
    );
}

// 
function Color() {

    // объект params это объект, который содержит любые параметры маршрутизатора
    let { title } = useParams();
    let color = colorData.colors.find(c => c.title === title);

    // 
    if (color) {
        return (<div style={{ backgroundColor: color.color, height: 100 }} />);
    }
    else {
        return (<div style={{ height: 100 }} >Not Found.</div>);
    }
}

// --- 12.2 React Router.

// Express.js documentation: Basic Routing. 
//      https://expressjs.com/en/starter/basic-routing.html

// Маршрутизация - это процесс определения конечных точек запросов, которые
//      вместе с местоположением и историей просмотров браузера используются
//      для обновления интерфейса. React не поставляется со стандартным 
//      маршрутизатором.

// Маршрутизатор позволяет настраивать маршруты для каждого раздела сайта.
//      Маршрут - это конечная точка, которую можно ввести в адресную строку 
//      браузера. При запросе маршрута отображается соответствующий контент.

// Установка React Router и React Router DOM:
//      npm install react-router@experimental react-router-dom@experimental

// Иерархия адресов:
//      http://localhost:3000
//          /about
//              /about
//              /about/services
//              /about/services/colors/:title
//          /dashboard
//          /services
//          /no-match

// 
function App() {
    return (
        <div>
            {
                // настройка маршрутов, компонент Routes является оболочкой 
                //      для отображаемых маршрутов, компоненты Route определяют 
                //      маршруты, которые Router использует для отображения 
                //      компонентов React, когда расположение браузера совпадает 
                //      с path, отобразится element
            }
            <Routes>
                <Route path="/" element={<Home />} />
                {
                    // настройка маршрутов, чтобы создать иерархию страниц 
                    //      с маршрутами достаточно вложить компоненты Route 
                    //      друг в друга
                }
                <Route path="about" element={<About />}>
                    {
                        // Вложенные маршруты.
                    }
                    <Route path="services" element={<Services />} />
                    {
                        // Параметры маршрутизации.

                        // React Router позволяет настраивать параметры маршрутизации,
                        //      это переменные, которые получают значения из URL.
                    }
                    <Route path="services/colors/:title" element={<Color />} />
                </Route>
                {
                    // Переадресация.

                    // при попытке доступа к 'http://localhost:3000/services'
                    //      пользователь будет перенаправлен на другой адрес
                    //      'http://localhost:3000/about/services'
                }
                <Route
                    path="/services"
                    // '..' указывает вернуться на один сегмент
                    element={<Navigate replace to="./../about/services" />}
                />
                {
                    // прочие маршруты
                }
                <Route path="/dashboard" element={<Dashboard />} />
                {
                    // Универсальный обработчик. Позволяет отобразить компонент 
                    //      для любого не существующего маршрута.
                }
                <Route path="*" element={<NoMatch />} />
            </Routes>
        </div>
    );
}

// --- 12.3 Хук useRoutes.

// 
function ComponentUseRoutes() {
    // компонент Route это оболочка для useRoutes
    return useRoutes([
        { path: "/", element: <Home /> },
        {
            path: "about",
            element: <About />,
            children: [
                { path: "services", element: <Services /> },
            ]
        },
        { path: "dashboard", element: <Dashboard /> },
        { path: "services", redirectTo: "about/services" },
        { path: "*", element: <NoMatch /> },
    ]);
}

// --- 12.4 Запуск.

// Router содержит все компоненты, которые будут использовать маршрутизацию.
//      Все компоненты Route должны быть обернуты компонентом Routes, который 
//      выбирает компонент для рендеринга на основе текущего местоположения окна.
//      Компоненты Link могут использоваться для облегчения навигации.

// React Router передает свойства компонентам, которые он отображает.

import './../../styles/styles.scss';

// объект BrowserRouter импортируется как Router
render(
    // компонент Router передает информацию о текущем местоположении всем 
    //      дочерним элементам, элемент Router используется один раз 
    //      в корне приложения
    <Router>
        <App />
    </Router>,
    document.getElementById("app")
);