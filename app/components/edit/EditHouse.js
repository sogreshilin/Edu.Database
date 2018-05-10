import React from "react";
import axios from "axios/index";
import {server} from '../../index'

// todo: add image_url here


const HouseEditor = ({house, onUpdate}) => {
    return (
        <div>
            <p>{house.id}</p>
            <p>{house.name}</p>
            <button onClick={() => onUpdate(house)}>{'Обновить'}</button>
        </div>
    )
};


export default class EditHouse extends React.Component {
    constructor() {
        super();
        this.state = {
            name: '',
            categoryId: -1,
            description: '',
            imageUrl: '',
            categories: {},
            houses: {}
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
                categories: result.data.categories,
                houses: result.data.houses
            }))
            .catch(error => {
                console.error(error)
            })
    }

    render() {
        return (
            <div className={'edit-house'}>
                <h1>{'Редактирование домов'}</h1>
                <h2>{'Добавление нового дома'}</h2>
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

                <h2>{'Редактирование существующих'}</h2>
                {
                    Object.values(this.state.houses).map(house => <HouseEditor house={house} onUpdate={this.handleUpdateHouse}/>)
                }
            </div>
        )
    }

    handleUpdateHouse(house) {
        axios.post(server + '/api/edit/update_house', {
                house: house
            })
            .then(() => alert('Информация о доме обновлена'))
            .catch(error => {
                console.log(error.message);
                console.log(error.response.status);
                console.log(error.response.data);
            })
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
                category_id: this.state.categoryId,
                description: this.state.description,
                image_url: this.state.imageUrl
            })
            .then(() => alert('Дом успешно сохранен в базу данных'))
            .catch(error => {
                console.log(error.message);
                console.log(error.response.status);
                console.log(error.response.data);
            })
    }
}