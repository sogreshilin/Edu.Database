import React from "react";
import axios from "axios/index";
import {server} from '../../index'

// todo: add image_url here

export default class EditHouse extends React.Component {
    constructor() {
        super();
        this.state = {
            name: '',
            categoryId: -1,
            description: '',
            imageUrl: '',
            categories: {}
        };
        this.handleNameChanged = this.handleNameChanged.bind(this);
        this.handleCategoryChanged = this.handleCategoryChanged.bind(this);
        this.handleDescriptionChanged = this.handleDescriptionChanged.bind(this);
        this.handleSaveClicked = this.handleSaveClicked.bind(this);
    }

    componentDidMount() {
        axios
            .get(server + '/api/houses')
            .then(result => this.setState({
                categories: result.data.categories
            }))
            .catch(error => {
                console.error(error)
            })
    }

    render() {
        return (
            <div className={'edit-house'}>
                <div>
                    <input
                        className={'input-field'}
                        type='text'
                        placeholder={'Название'}
                        onChange={this.handleNameChanged} />
                </div>
                <div>
                    <select
                        className={'select-field'}
                        onChange={this.handleCategoryChanged}>
                        <option key={-1} value={-1}>-- Not Selected --</option>
                        { Object.values(this.state.categories).map(category => <option key={category.id} value={category.id}>{category.name}</option>) }
                    </select>
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

    handleCategoryChanged(event) {
        const categoryId = Number.parseInt(event.target.value);
        console.log('categoryId = ' + categoryId);
        this.setState({
            categoryId: categoryId
        })
    }

    handleDescriptionChanged(event) {
        const description = event.target.value;
        this.setState({
            description: description
        })

    }

    handleSaveClicked() {
        axios.post("http://localhost:5000/api/edit/add_house", {
                name: this.state.name,
                categoryId: this.state.categoryId,
                description: this.state.categoryId,
                imageUrl: this.state.imageUrl
            })
            .then(() => alert('Дом успешно сохранен в базу данных'))
            .catch(error => {
                console.log(error.message);
                console.log(error.response.status);
                console.log(error.response.data);
            })
    }
}