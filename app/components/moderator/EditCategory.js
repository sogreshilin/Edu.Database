import React from "react";
import {Tag, Tree, Classes, Dialog, Intent, Button, EditableText, TextArea, Tabs, Tab, FileInput, Label} from '@blueprintjs/core';
import {handleStringChange} from "@blueprintjs/docs-theme/lib/esm/index";
import {server} from "../../index";
import axios from "axios/index";
import ImageUploader from "../edit/ImageUploader";


const State = {
    Create: 1,
    Edit: 2,
};


const CategoryEditor = ({
    onNameChanged,
    name,
    description,
    onDescriptionChanged,
    images,
    onImageUploadButtonClicked
}) => {
    return (
        <div>
            <Label text={'Наименование'} helperText={'*'}>
                    <input className="pt-input" placeholder="Введите название..."
                           onChange={onNameChanged}
                           value={name}/>
                </Label>


                <Label text={'Описание'}>
                    <TextArea
                        fill
                        onChange={onDescriptionChanged}
                        value={description}
                        placeholder="Введите описание..."/>
                </Label>

                <div id={'carousel'}>
                    {
                        images.map(image =>
                            <div className={'slide'}>
                                <img src={"/resources/image/" + image} alt={"Изображение"}/>
                            </div>
                        )
                    }
                </div>

                <Button icon="paperclip" text="Прикрепить изображения" onClick={onImageUploadButtonClicked}/>
        </div>
    );
};


const Houses = ({houses, onEditHouse, onRemoveHouse, onCreateHouse }) => {
    return (
        <div>
             <Label text={'Дома категории'}>
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
                        houses.map((house, index) =>
                            <tr key={house.id}>
                                <td>{index + 1}</td>
                                <td>{house.name}</td>
                                <td><Button icon={'edit'} onClick={() => onEditHouse(house.id)} text={'Изменить'}
                                            intent={Intent.PRIMARY}/></td>
                                <td><Button icon={'delete'} onClick={() => onRemoveHouse(house.id)}
                                            text={'Удалить'} intent={Intent.DANGER}/></td>
                            </tr>
                        )
                    }
                    </tbody>
                </table>
            </Label>
            <Button intent={Intent.PRIMARY} text={'Добавить'} icon={'add'} onClick={onCreateHouse}/>
        </div>
    );
};


export default class EditCategory extends React.Component {
    constructor(args) {
        super();
        this.state = {

            isEditorVisible: false,
            categories: {},
            houses: {},
            links: {},

            active_tab_id: '',
            category_editor_state: null,
            category_id: null,
            category_name: '',
            description: '',
            images: [],

            isHouseEditorVisible: false,
            house_editor_state: null,
            house_id: null,
            house_name: '',

            isImageUploaderVisible: false,

        };
        this.handleCreate = this.handleCreate.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleImagesUploaded = this.handleImagesUploaded.bind(this);
        this.handleEditHouse = this.handleEditHouse.bind(this);
        this.handleRemoveHouse = this.handleRemoveHouse.bind(this);
        this.handleCreateHouse = this.handleCreateHouse.bind(this);
        this.handleSaveHouse = this.handleSaveHouse.bind(this);
        this.handleHouseCancel = this.handleHouseCancel.bind(this);
        this.handleTabChanged = this.handleTabChanged.bind(this);
    }

    componentDidMount() {
        axios.get('/api/house_categories')
            .then(response => {
                this.setState({categories: response.data})
            })
            .catch(error => {
                console.error(error);
            });
        axios.get('/api/houses')
            .then(response => {
                this.setState({
                    houses: response.data.houses,
                    links: response.data.links
                })
            })
            .catch(error => {
                console.error(error);
            });
    }

    handleEditHouse(house_id) {
        this.setState({
            house_editor_state: State.Edit,
            house_id: house_id,
            house_name: this.state.houses[house_id].name,
            isHouseEditorVisible: true,
        })
    }

    handleHouseCancel() {
        this.setState({
            isHouseEditorVisible: false
        })
    }

    handleRemoveHouse(house_id) {
        axios.post('/api/remove/house', {
            id: house_id
        })
            .then(response => {
                this.setState({
                    houses: response.data.houses,
                    links: response.data.links
                })
            })
           .catch(error => {console.error(error);});
    }

    handleCreateHouse() {
        this.setState({
            house_editor_state: State.Create,
            house_id: null,
            house_name: '',
            isHouseEditorVisible: true,
        })
    }

    handleSaveHouse() {
        let resource = '';
        let data = {};

        switch (this.state.house_editor_state) {
            case State.Create:
                resource = '/api/add/house';
                data = {
                    name: this.state.house_name,
                    category_id: this.state.category_id,
                };
                break;
            case State.Edit:
                resource = '/api/edit/house';
                data = {
                    id: this.state.house_id,
                    name: this.state.house_name,
                };
                break;
        }

        axios.post(server + resource, data)
            .then(response => {
                this.setState({
                    houses: response.data.houses,
                    links: response.data.links
                })
            })
            .catch(error => console.log(error));

        this.setState({
            isHouseEditorVisible: false
        });
    }


    handleCreate() {
        this.setState({
            category_editor_state: State.Create,
            category_id: null,
            isEditorVisible: true,
            category_name: '',
            description: '',
            images: []
        });
    }

    handleEdit(category_id) {
        const category = this.state.categories[category_id];
        this.setState({
            category_editor_state: State.Edit,
            category_id: category_id,
            category_name: category.name,
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
        switch (this.state.category_editor_state) {
            case State.Create:
                resource = '/api/add/house_category';
                data = {
                    name: this.state.category_name,
                    description: this.state.description,
                    images: this.state.images
                };
                break;
            case State.Edit:
                resource = '/api/edit/house_category';
                data = {
                    id: this.state.category_id,
                    name: this.state.category_name,
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

    handleTabChanged(id) {
        this.setState({active_tab_id: id});
    }

    render() {
        console.log(this.state.houses);
        console.log(this.state.links);
        const categoryEditor =
            <CategoryEditor
                onNameChanged={(event) => this.setState({category_name: event.target.value})}
                name={this.state.category_name}
                description={this.state.description}
                onDescriptionChanged={handleStringChange(text => this.setState({description: text}))}
                images={this.state.images}
                onImageUploadButtonClicked={() => this.setState({isImageUploaderVisible: true})}
            />;

        const housesEditor =
            <Houses houses={Object.values(this.state.houses).filter(house => house.category === this.state.category_id)}
                    onEditHouse={this.handleEditHouse}
                    onRemoveHouse={this.handleRemoveHouse}
                    onCreateHouse={this.handleCreateHouse}/>;
        return (
            <div>
                <Dialog
                    icon="edit"
                    isOpen={this.state.isEditorVisible}
                    onClose={this.handleCancel}
                    title="Категория дома"
                >

                <div className="pt-dialog-body">
                    <Tabs onChange={this.handleTabChanged}>
                        <Tab id={'house_category'} title={'Категории домов'} panel={categoryEditor}/>
                        <Tab disabled={this.state.category_editor_state === State.Create} id={'houses'} title={'Дома'} panel={housesEditor}/>
                    </Tabs>
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

                <Dialog
                    icon="edit"
                    isOpen={this.state.isHouseEditorVisible}
                    onClose={this.handleHouseCancel}
                    title="Дом"
                >

                    <div className="pt-dialog-body">
                        <Label text={'Наименование'} helperText={'*'}>
                            <input className="pt-input" placeholder="Введите название..."
                                   onChange={(event) => this.setState({house_name: event.target.value})}
                                   value={this.state.house_name}/>
                        </Label>
                    </div>

                    <div className="pt-dialog-footer">
                        <div className="pt-dialog-footer-actions">
                            <Button intent={Intent.WARNING} onClick={this.handleHouseCancel} text="Отменить"/>
                            <Button intent={Intent.PRIMARY} onClick={this.handleSaveHouse} text="Сохранить"/>
                        </div>
                    </div>
                </Dialog>

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