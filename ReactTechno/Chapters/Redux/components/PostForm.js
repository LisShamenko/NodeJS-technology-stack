import React from 'react';
import PropTypes from 'prop-types';
import Filter from 'bad-words';

// 
class PostForm extends React.Component {

    // 
    constructor(props) {
        super(props);

        // 
        this.state =
        {
            content: '',
            isValid: false,
        };

        // 
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePostChange = this.handlePostChange.bind(this);
        this.filter = new Filter();
    }

    // 
    handlePostChange(event) {

        // 
        let clear_content;
        try {
            clear_content = this.filter.clean(event.target.value);
        }
        catch (err) {
            clear_content = event.target.value;
        }

        // 
        this.setState(() => {
            return {
                content: clear_content,
                isValid: clear_content.length <= 280
            };
        });
    }

    // 
    handleSubmit(event) {
        event.preventDefault();

        // 
        if (!this.state.isValid) {
            return;
        }

        // 
        if (this.props.onSubmit) {

            this.props.onSubmit({
                content: this.state.content,
                userId: this.props.user.id,
            });

            // 
            this.setState(() => {
                return {
                    content: '',
                    isValid: null,
                };
            });
        }
    }

    // 
    render() {
        return (
            <div>
                <button onClick={this.handleSubmit}>Post</button>
                <textarea
                    value={this.state.content}
                    onChange={this.handlePostChange}
                />
            </div>
        );
    }
}

// 
PostForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    user: PropTypes.object,
}

// 
export default PostForm;