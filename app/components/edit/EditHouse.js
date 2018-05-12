import React from "react";
import axios from "axios/index";
import {server} from '../../index'
import Popup from "reactjs-popup";
import { Card, Button, Label, Intent, Checkbox } from '@blueprintjs/core';

import styles from './edit.scss';

/*
const EditorPopup = ({
    triggerButtonText,
    title,
    name,
    category_id,
    categories,
    description,
    onNameChanged,
    onCategoryChanged,
    onDescriptionChanged,
    onFileChanged,
    confirmButtonText,
    onConfirm
}) => {
    return (
        <Popup trigger={<button>{triggerButtonText}</button>} modal>
            <div>
                <div className={'edit-house'}>
                    <h3>{title}</h3>
                    <Label text={"Название"} helperText={"*"}>
                        <input
                            required
                            value={name}
                            className={'pt-input'}
                            type='text'
                            onChange={onNameChanged} />
                    </Label>

                    <Label text={"Категория дома"} helperText={"*"}>
                        <select
                            className={'pt-input'}
                            onChange={onCategoryChanged}
                            defaultValue={category_id}
                        >
                            <option key={-1} value={-1}>-- Not Selected --</option>
                            { Object.values(categories).map(category => <option key={category.id} value={category.id}>{category.name}</option>) }
                        </select>
                    </Label>

                    <Label text={"Описание"}>
                        <textarea
                            defaultValue={description}
                            className={'pt-input'}
                            onChange={onCategoryChanged}>
                        </textarea>
                    </Label>

                    <Label text={"Изображение"} helperText={"*"}>
                        <input
                            required
                            id={'pt-input'}
                            type="file"
                            onChange={onFileChanged}
                            accept=".gif,.jpg,.jpeg,.png,.pjpeg"
                            ref={'ChooseImageRef'}
                        />
                    </Label>

                    <div>
                        <button onClick={onConfirm}>{confirmButtonText}</button>
                    </div>
                </div>
            </div>
        </Popup>
    );
};
*/


export default class EditHouse extends React.Component {
    constructor() {
        super();
        this.state = {
            house_id: -1,
            name: '',
            category_id: -1,
            description: '',
            file: null,

            categories: {},
            houses: {},
            image_filename: null,
        };
        this.handleNameChanged = this.handleNameChanged.bind(this);
        this.handleCategoryChanged = this.handleCategoryChanged.bind(this);
        this.handleDescriptionChanged = this.handleDescriptionChanged.bind(this);
        this.addHouseRecord = this.addHouseRecord.bind(this);
        this.handleFileChanged = this.handleFileChanged.bind(this);
        this.uploadImage = this.uploadImage.bind(this);
        this.handleAddClicked = this.handleAddClicked.bind(this);
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

    handleNameChanged(event) {
        const name = event.target.value;
        this.setState({
            name: name
        })
    }

    handleCategoryChanged(event) {
        const categoryId = Number.parseInt(event.target.value);
        this.setState({
            category_id: categoryId
        })
    }

    handleDescriptionChanged(event) {
        const description = event.target.value;
        this.setState({
            description: description
        })

    }

    handleFileChanged(event) {
        const file = event.target.files[0];
        this.setState({
            file: file
        })
    };

    handleAddClicked() {
        this.uploadImage();
    }

    uploadImage() {
        const file = this.state.file;
        if (file) {
            axios.post(server + '/api/upload/house_image', this.state.file, {
                headers: { 'Content-Type': this.state.file.type }
            })
        .then(response => {
            this.setState({
                image_filename: response.data.image_filename
            }, this.addHouseRecord);
        })
        .catch(error => {
                alert(error.message);
                console.log(error.response.status);
                console.log(error.message);
                console.log(error.response.data);
            });
        }
    }

     addHouseRecord() {
        axios.post(server + "/api/edit/house", {
                name: this.state.name,
                house_id: this.state.house_id,
                category_id: this.state.category_id,
                description: this.state.description,
                image_filename: this.state.image_filename,
            })
            .then(() => {
                alert('Дом успешно сохранен в базу данных');
                axios
                    .get(server + '/api/houses')
                    .then(result => this.setState({
                        categories: result.data.categories,
                        houses: result.data.houses
                    }))
                    .catch(error => {
                        console.error(error)
                    })
            })
            .catch(error => {
                alert(error.response.data);
                console.log(error.message);
                console.log(error.response.status);
                console.log(error.response.data);
            });

    }

    render() {
        return (
            <div className={'edit-house'}>
                <h1>{'Редактирование домов'}</h1>

                {/*<EditorPopup*/}
                    {/*triggerButtonText={"Добавить новый"}*/}
                    {/*title={"Добавление нового дома"}*/}
                    {/*name={this.state.name}*/}
                    {/*category_id={this.state.category_id}*/}
                    {/*categories={this.state.categories}*/}
                    {/*description={this.state.description}*/}
                    {/*onNameChanged={this.handleNameChanged}*/}
                    {/*onCategoryChanged={this.handleCategoryChanged}*/}
                    {/*onDescriptionChanged={this.handleDescriptionChanged}*/}
                    {/*onFileChanged={this.handleFileChanged}*/}
                    {/*confirmButtonText={"Добавить"}*/}
                    {/*onConfirm={this.handleAddClicked}*/}
                {/*/>*/}

                <Popup trigger={<button>Добавить дом</button>} modal>
                    <div>
                        <div className={'edit-house'}>
                            <h3>{'Добавление нового дома'}</h3>
                            <Label text={"Название"} helperText={"*"}>
                                <input
                                    required
                                    className={'pt-input'}
                                    type='text'
                                    onChange={this.handleNameChanged} />
                            </Label>
                            <Label text={"Категория дома"} helperText={"*"}>
                                <select
                                    className={'pt-input'}
                                    onChange={this.handleCategoryChanged}>
                                    <option key={-1} value={-1}>-- Not Selected --</option>
                                    { Object.values(this.state.categories).map(category => <option key={category.id} value={category.id}>{category.name}</option>) }
                                </select>
                            </Label>
                            <Label text={"Описание"}>
                                <textarea
                                    className={'pt-input'}
                                    onChange={this.handleDescriptionChanged}>
                                </textarea>
                            </Label>
                            <Label text={"Изображение"} helperText={"*"}>
                                <input
                                    required
                                    id={'pt-input'}
                                    type="file"
                                    onChange={this.handleFileChanged}
                                    accept=".gif,.jpg,.jpeg,.png,.pjpeg"
                                    ref={'ChooseImageRef'}
                                />
                            </Label>

                            <div>
                                <button onClick={this.handleAddClicked}>{'Добавить'}</button>
                            </div>
                        </div>
                    </div>
                </Popup>

                <h3>{'Следующие дома есть в базе данных'}</h3>
                <div>
                    {
                        Object.values(this.state.houses).map(house =>
                                <div id={house.id}>
                                    <p>{house.name}</p>
                                    <button>Удалить</button>
                                    <button>Изменить</button>
                                </div>
                            )
                    }
                </div>
            </div>
        )
    }

}