import React from "react";
import {Tag, Tree, Classes, Dialog, Intent, Button, EditableText, TextArea, FileInput, Label} from '@blueprintjs/core';
import {handleStringChange} from "@blueprintjs/docs-theme/lib/esm/index";
import {server} from "../../index";
import axios from "axios/index";
import ImageUploader from "../edit/ImageUploader";


const State = {
    Create: 1,
    Edit: 2,
};

export default class EditCategory extends React.Component {
    constructor(args) {
        super();
        this.state = {
            isEditorVisible: false,
            categories: {},
            state: null,

            category_id: null,
            name: '',
            description: '',
            images: [],

            isImageUploaderVisible: false,

        };
        this.handleCreate = this.handleCreate.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleImagesUploaded = this.handleImagesUploaded.bind(this);
    }

    componentDidMount() {
        axios.get(server + '/api/house_categories')
            .then(response => {
                this.setState({categories: response.data})
            })
            .catch(error => {
                console.error(error);
            });
    }


    handleCreate() {
        this.setState({
            state: State.Create,
            category_id: null,
            isEditorVisible: true,
            name: '',
            description: '',
            images: []
        });
    }

    handleEdit(category_id) {
        const category = this.state.categories[category_id];
        this.setState({
            state: State.Edit,
            category_id: category_id,
            name: category.name,
            description: category.description,
            images: category.images || [],
            isEditorVisible: true,
        })
    }

    handleImagesUploaded(files) {
        console.log(files);
        this.setState((prev) => {
            return {
                images: [...prev.images, ...files],
                isImageUploaderVisible: false,
            }
        });
    }

    handleSave() {
        let resource = '';
        let data = {};
        switch (this.state.state) {
            case State.Create:
                resource = '/api/add/house_category';
                data = {
                    name: this.state.name,
                    description: this.state.description,
                    images: this.state.images
                };
                break;
            case State.Edit:
                resource = '/api/edit/house_category';
                data = {
                    id: this.state.category_id,
                    name: this.state.name,
                    description: this.state.description,
                    images: this.state.images
                };
                break;
        }

        axios.post(server + resource, data)
            .then(result => this.setState({categories: result.data}))
            .catch(error => console.log(error));

        this.setState({
            isEditorVisible: false
        });
    }

    handleDelete(category_id) {
        axios.post(server + '/api/remove/house_category', {id: category_id})
            .then(result => this.setState({categories: result.data}))
            .catch(error => console.log(error));
    }

    handleCancel() {
        this.setState({
            isEditorVisible: false,
        })
    }

    render() {
        return (
            <div>
                <Dialog
                    icon="edit"
                    isOpen={this.state.isEditorVisible}
                    onClose={this.handleCancel}
                    title="Категория дома"
                >

                    <div className="pt-dialog-body">
                        <Label text={'Наименование'} helperText={'*'}>
                            <input className="pt-input" placeholder="Введите название..."
                                   onChange={(event) => this.setState({name: event.target.value})}
                                   value={this.state.name}/>
                        </Label>

                        <Label text={'Описание'}>
                            <TextArea
                                fill
                                onChange={handleStringChange(text => this.setState({description: text}))}
                                value={this.state.description}
                                placeholder="Введите описание..."/>
                        </Label>

                        {
                            this.state.images.map(image => <p key={image}>{image}</p>)
                        }

                        <Button icon="paperclip" text="Прикрепить изображения" onClick={() => this.setState({isImageUploaderVisible: true})}/>
                    </div>

                    <div className="pt-dialog-footer">
                        <div className="pt-dialog-footer-actions">
                            <Button intent={Intent.WARNING} onClick={this.handleCancel} text="Отменить"/>
                            <Button intent={Intent.PRIMARY} onClick={this.handleSave} text="Сохранить"/>
                        </div>
                    </div>
                </Dialog>

                <ImageUploader visible={this.state.isImageUploaderVisible}
                               onUpload={this.handleImagesUploaded}
                               onCancel={() => this.setState({isImageUploaderVisible: false})}
                />

                <table className="pt-html-table">
                    <thead>
                    <tr>
                        <td>№</td>
                        <td>Название</td>
                        <td>Редактировать</td>
                        <td>Удалить</td>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        Object.values(this.state.categories).map((category, index) =>
                            <tr key={category.id}>
                                <td>{index + 1}</td>
                                <td>{category.name}</td>
                                <td><Button icon={'edit'} onClick={() => this.handleEdit(category.id)} text={'Изменить'}
                                            intent={Intent.PRIMARY}/></td>
                                <td><Button icon={'delete'} onClick={() => this.handleDelete(category.id)}
                                            text={'Удалить'} intent={Intent.DANGER}/></td>
                            </tr>
                        )
                    }
                    </tbody>
                </table>

                <Button onClick={this.handleCreate} intent={Intent.PRIMARY} icon="add" text='Добавить'/>
            </div>
        )
    }
}