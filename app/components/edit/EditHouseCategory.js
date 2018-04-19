import React from "react";
import axios from "axios/index";
import {server} from '../../index'

export default class EditHouseCategory extends React.Component {
    constructor() {
        super();
        this.state = {
            name: '',
            description: ''
        };
        this.handleNameChanged = this.handleNameChanged.bind(this);
        this.handleDescriptionChanged = this.handleDescriptionChanged.bind(this);
        this.handleSaveClicked = this.handleSaveClicked.bind(this);
    }

    render() {
        return (
            <div className={'edit-house-category'}>
                <div>
                    <input
                        className={'input-field'}
                        type='text'
                        placeholder={'Название'}
                        onChange={this.handleNameChanged} />
                </div>
                <div>
                    <textarea
                        className={'description-field'}
                        placeholder={'Описание'}
                        onChange={this.handleDescriptionChanged}>
                    </textarea>
                </div>
                <div>
                    <button onClick={this.handleSaveClicked}>{'Сохранить'}</button>
                </div>

            </div>
        )
    }

    handleNameChanged(event) {
        const name = event.target.value;
        this.setState({
            name: name
        })
    }

    handleDescriptionChanged(event) {
        const description = event.target.value;
        this.setState({
            description: description
        })

    }

    handleSaveClicked() {
        axios.post("http://localhost:5000/api/edit/add_house_category", {
                name: this.state.name,
                description: this.state.categoryId
            })
            .then(() => alert('Новая категория успешно сохранена в базу данных'))
            .catch(error => {
                console.log(error.message);
                console.log(error.response.status);
                console.log(error.response.data);
            })
    }
}