// О применении библиотеки React без ES2015, пакет 'create-react-class'.
//      https://reactjs.org/docs/react-without-es6.html

// prop-types - предоставляет набор валидаторов
//      npm install --save prop-types
//      https://www.npmjs.com/package/prop-types

// Классы JsvaScript
//      https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Classes

// --------------- 1. Native React.

// --- 1.1 Компонент Post.

// компонент Post наследуется от класса React.Component
class Post extends React.Component {
    constructor(props) {
        super(props);
    }

    // предоставляет метод рендеринга render, возвращающий только один элемент React
    render() {
        return React.createElement(
            // создание элемента div с css-классом Post
            "div", { className: "post" },
            // вызов React.createElement для создания дочернего элемента
            React.createElement(
                // компонент имеет доступ к свойствам и состоянию this.state
                "h2", { className: "postAuthor", id: this.props.id },
                // ссылка на экземпляр компонента, а не на сценарий класса React
                this.props.user,
                // использование className вместо имени класса CSS элемента DOM
                React.createElement("span", { className: "postBody" },
                    // свойство content определяет внутреннее содержимое создаваемого 
                    //      элемента span
                    this.props.content
                ),
                // this.props.children позволяет компоненту отображать дочерние 
                //      элементы, соответствует выводу вложенных данных
                this.props.children
            )
        );
    }
}

// PropTypes выполняет валидацию свойств, передаваемых компоненту, что позволяет 
//      упростить отладку. В случае ошибки будет выведено предупреждение в консоли 
//      разработчика. Работает только в режиме разработки!

// 
Post.propTypes = {
    // свойства должны иметь указанный тип и являются обязательными
    user: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired
};

// --- 1.2 Компонент Comment.

// создание компонента Comment
class Comment extends React.Component {
    constructor(props) {
        super(props);
    }

    // Компоненты, образованные из классов React.Component, имеют экземпляры поддержки, 
    //      которые позволяют хранить данные и должны обладать методом render, возвращающим 
    //      ровно один React-элемент. React создает из React-элементов виртуальную DOM и 
    //      поддерживает обновление DOM.

    // 
    render() {
        return React.createElement("div", { className: "comment" },
            React.createElement("h2", { className: "commentAuthor" },
                this.props.user,
                React.createElement("span", { className: "commentContent" },
                    this.props.content
                )
            )
        );
    }
}

// объявление PropTypes для Comment
Comment.propTypes = {
    id: PropTypes.number.isRequired,
    content: PropTypes.string.isRequired,
    user: PropTypes.string.isRequired
};

// --- 1.3 Компонент CreateComment.

// 
class CreateComment extends React.Component {
    constructor(props) {
        super(props);

        // устанавливается начальное состояние класса 
        this.state = {
            content: "",
            user: ""
        };

        // компоненты, созданные с помощью классов, автоматически не связываются 
        //      с методами компонентов, поэтому следует связать их в конструкторе
        this.handleUserChange = this.handleUserChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    // назначение обработчика события для обработки изменений в поле autor
    handleUserChange(event) {
        // вернуть изменения в поле
        const value = event.target.value;
        // обновить состояние компонента
        this.setState(() => ({ user: value }));
    }

    // обработки изменений в поле комментария
    handleTextChange(event) {
        const value = event.target.value;
        this.setState({ content: value });
    }

    // обработчик событий для отправки формы
    handleSubmit(event) {
        event.preventDefault();

        // вызов родительской функции onCommentSubmit, которая была передана 
        //      как свойство, данные передаются из формы, форма перезагружается
        this.props.onCommentSubmit({
            user: this.state.user.trim(),
            content: this.state.content.trim()
        });

        // сброс поля ввода после отправки, чтобы пользователь мог отправлять 
        //      другие комментарии
        this.setState(() => ({ user: "", content: "" }));
    }

    // 
    render() {
        return React.createElement(
            "form",
            // связывание метода handleSubmit с событием отправки формы onSubmit
            {
                className: "createComment", onSubmit: this.handleSubmit
            },
            // создание компонента как класса React, который будет иметь поля ввода
            React.createElement(
                "input",
                {
                    type: "text",
                    placeholder: "имя автора",
                    value: this.state.user,
                    onChange: this.handleUserChange
                }
            ),
            React.createElement(
                "input",
                {
                    type: "text",
                    placeholder: "...",
                    value: this.state.content,
                    onChange: this.handleTextChange
                }
            ),
            React.createElement(
                "input",
                {
                    type: "submit",
                    value: "Post"
                }
            )
        );
    }
}

// 
CreateComment.propTypes = {
    onCommentSubmit: PropTypes.func.isRequired,
    content: PropTypes.string
};

// --- 1.4 Компонент CommentBox.

// 
class CommentBox extends React.Component {
    constructor(props) {
        super(props);

        // 
        this.state = {
            // передача комментариев на верхнем уровне 
            comments: this.props.comments
        };

        // 
        this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
    }

    // 
    handleCommentSubmit(comment) {
        const comments = this.state.comments;
        // временный идентификатор
        comment.id = Date.now();
        // нельзя менять состояние напрямую, поэтому создается копия
        const newComments = comments.concat([comment]);
        this.setState({ comments: newComments });
    }

    // 
    render() {
        return React.createElement(
            "div",
            {
                className: "commentBox"
            },
            // передача данных на верхнем уровне, чтобы получить доступ к данным post
            React.createElement(Post, {
                id: this.props.post.id,
                content: this.props.post.content,
                user: this.props.post.user
            }),
            // - установка соответсвия комментариев в this.state.comments и возвращение
            //      элемента React для каждого из них
            // - функция map используется для возврата нового массива элементов React,
            //      функцию forEach использовать нельзя, поскольку она не возвращает 
            //      массив и оставит React.createElement без данных
            this.state.comments.map(function (comment) {
                return React.createElement(Comment, {
                    key: comment.id,
                    id: comment.id,
                    content: comment.content,
                    user: comment.user
                });
            }),
            React.createElement(CreateComment, {
                // передача родительского метода handleCommentSubmit компоненту 
                //      CreateComment для обработки отправки формы
                onCommentSubmit: this.handleCommentSubmit
            })
        );
    }
}

// 
CommentBox.propTypes = {
    post: PropTypes.object,
    comments: PropTypes.arrayOf(PropTypes.object)
};

// --- 1.5 API.

// API (application programming interface, интерфейс программирования приложений) - 
//      это набор подпрограмм и протоколов для создания программного обеспечения. 
//      RESTful JSON API - это серверное API, в котором данные организованы как 
//      ресурсы сервера и предоставляются в формате JSON. Перед созданием UI 
//      требуется узнать формат данных, возвращемых сервером.

// данные передаваемые с сервера
const postsData = [
    {
        // объект поста
        post: { id: 0, user: "(автор 1)", content: "--- (первый пост)" },
        // объекты комментариев
        comments: [
            { id: 0, user: "(автор 4)", content: "--- --- (комментарий 6)" },
        ]
    },
    {
        // объект поста
        post: { id: 123, user: "(автор 3)", content: "--- (контент поста 123)" },
        // объекты комментариев
        comments: [
            { id: 0, user: "(автор 1)", content: "--- --- (комментарий 1)" },
            { id: 1, user: "(автор 2)", content: "--- --- (комментарий 2)" },
            { id: 2, user: "(автор 3)", content: "--- --- (комментарий 3)" },
            { id: 3, user: "(автор 4)", content: "--- --- (комментарий 4)" },
            { id: 4, user: "(автор 5)", content: "--- --- (комментарий 5)" }
        ]
    }
];

// --- 1.6 Запуск.

// ссылка на корневой DOM-элемент, в который помещается React-приложение
const main_post = document.getElementById("main-post");
// 
const app_post = React.createElement(
    // класс Post передается в функцию createElement
    Post, postsData[0].post, // { id: 1, content: " said: This is a post!", user: "mark" }, // 
    // вкладывание компонента Comment в компонент Post
    React.createElement(
        Comment, postsData[0].comments[0]), // { id: 2, user: "bob", content: " commented: wow! how cool!" }), // 
    // добавление CreateComment в компонент приложения
    React.createElement(CreateComment)
);
// 
ReactDOM.render(app_post, main_post);

//
const main_comment = document.getElementById("main-comment");
// 
const app_comment = React.createElement(
    // передача разметки компоненту CommentBox в качестве свойства
    CommentBox, { comments: postsData[1].comments, post: postsData[1].post }
);
// 
ReactDOM.render(app_comment, main_comment);