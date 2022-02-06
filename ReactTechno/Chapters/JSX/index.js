import React, { Component } from "react";
import { render } from "react-dom";
import PropTypes from "prop-types";

// --------------- 2. JSX.

// JSX - упрощенный язык разметки, является XML-подобным расширением синтаксиса ECMAScript,
//      без семантики предназначенной для использования препроцессорами, т.е. используется
//      только для кодирования с обязательной транспиляцией. Babel анализирует код JSX и 
//      преобразует его в обычный JavaScript. JSX позволяет создавать компоненты декларативным 
//      способом, без использования React.createClass. У JSX нет точного синтаксиса и соглашений.

// Преимущества JSX: читабельность, декларативность и инкапсулированность. JSX имеет более 
//      простой синтаксис в отличие от функции createElement. Все, что нужно знать о компоненте, 
//      находится в одном месте. 

// Атрибутные выражения - позволяют применять выражение JavaScript в качестве значения атрибута: 
//      <Comment a={this.props.b} />

// Логические атрибуты - если значение атрибута не указано, то считается, что атрибут
//      принимает значение true, значение false следует передавать явно:
//      <Plan active />
//      <Input checked={false} />

// Вложенные выражения - позволяет задать содержимое html элемента:
//      <p>{this.props.content}</p>

// --- 2.1 Компонент Post.

// Существует два основных типа элементов для создания компонентов в React: элементы и 
//      классы. Элементы React - это то, что отображается на экране, они сопоставимы 
//      с DOM-элементами. Классы React являются классами JavaScript, которые наследуются
//      от React.Component и называются компонентами. Компоненты создаются путем рсширения
//      React.Component или функций (функциональные компоненты без состояния).

// Только классы React получают доступ к изменяемому состоянию, но все элементы React получают 
//      доступ к свойствам, которые изменяться не должны (неизменяемое состояние).

// Классы React получают доступ к методам жизненного цикла, которые вызываются React 
//      в определенном порядке во время рендеринга и обновления, что позволяет подключть
//      компоненты к процессу их обновления. Это делает компоненты более предсказуемыми в работе.

// Компоненты React взаимодействуют через свойства и имеют родственные отношения. Родительские 
//      компоненты могут передавать данные потомкам, но потомки не могут изменять предков. 
//      Они могут передавать предкам данные через обратные вызовы, но не имеют прямого 
//      доступа к ним.

// 
class Post extends Component {
    render() {
        return (
            <div className="post">
                <h2 className="postAuthor">{this.props.user}</h2>
                <span className="postBody">{this.props.content}</span>
                {this.props.children}
            </div>
        );
    }
}

// 
Post.propTypes = {
    user: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired
};

// --- 2.2 Компонент Comment.

// 
class Comment extends Component {
    constructor(props) {
        super(props);
    }

    //
    render() {
        return (
            <div className="comment">
                <h2 className="commentAuthor">{this.props.user + " : "}</h2>
                <span className="commentContent">{this.props.content}</span>
            </div>
        );
    }
}

// 
Comment.propTypes = {
    id: PropTypes.number.isRequired,
    content: PropTypes.string.isRequired,
    user: PropTypes.string.isRequired
};

// --- 2.3 Компонент CreateComment.

// 
class CreateComment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            content: "",
            user: ""
        };
        this.handleUserChange = this.handleUserChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    // 
    handleUserChange(event) {
        this.setState({ user: event.target.value });
    }

    // 
    handleTextChange(event) {
        this.setState({ content: event.target.value });
    }

    //
    handleSubmit(event) {
        event.preventDefault();
        this.props.onCommentSubmit({
            user: this.state.user.trim(),
            content: this.state.content.trim()
        });
        this.setState({ user: "", content: "" });
    }

    //
    render() {
        // вместо создания свойств на объекте, атрибуты создаются в HTML-элементах
        return (
            <form onSubmit={this.handleSubmit} className="createComment">
                <input type="text" placeholder="имя автора" value={this.state.user}
                    onChange={this.handleUserChange}
                />
                <input type="text" placeholder="..." value={this.state.content}
                    onChange={this.handleTextChange}
                />
                <button type="submit">Post</button>
            </form>
        );
    }
}

// --- 2.4 Компонент CommentBox.

// 
class CommentBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            comments: this.props.comments
        };
        this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
    }

    // 
    handleCommentSubmit(comment) {
        const comments = this.state.comments;
        comment.id = Date.now();
        const newComments = comments.concat([comment]);
        this.setState({ comments: newComments });
    }

    // 
    render() {
        return (
            <div className="commentBox">
                {
                    // класс React с именем Post
                    <Post
                        id={this.props.post.id}
                        content={this.props.post.content}
                        user={this.props.post.user}
                    />
                }
                <hr />
                {
                    this.state.comments.map(function (comment) {
                        return (
                            // используется обычный javascript-код внутри скобок {} для итерации
                            // по комментариям и создания компонентов комментария
                            <Comment
                                id={comment.id}
                                key={comment.id}
                                content={comment.content}
                                user={comment.user}
                            />
                        );
                    })
                }
                <hr />
                {
                    // передача в обработчик функции handleCommentSubmit как свойства
                    <CreateComment onCommentSubmit={this.handleCommentSubmit} />
                }
            </div>
        );
    }
}

// 
CommentBox.propTypes = {
    post: PropTypes.object,
    comments: PropTypes.arrayOf(PropTypes.object)
};

// --- 2.5 API.

// данные передаваемые с сервера
const data = {
    post: { id: 123, user: "(автор 3)", content: "--- (контент поста 123)" },
    comments: [
        { id: 0, user: "(автор 1)", content: "--- --- (комментарий 1)" },
        { id: 1, user: "(автор 2)", content: "--- --- (комментарий 2)" },
        { id: 2, user: "(автор 3)", content: "--- --- (комментарий 3)" },
        { id: 3, user: "(автор 4)", content: "--- --- (комментарий 4)" },
        { id: 4, user: "(автор 5)", content: "--- --- (комментарий 5)" }
    ]
};

// --- 2.6 Запуск.

// 
const main = document.getElementById("main");

// на верхнем уровне CommentBox является настраиваемым компонентом, который
//      передается в React DOM для рендеринга
render(<CommentBox comments={data.comments} post={data.post} />, main);