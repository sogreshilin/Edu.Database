import React from "react";
import axios from "axios/index";
import {server} from '../../index'
import { Tag, Tree, Classes, Dialog, Intent, Button, EditableText, TextArea, FileInput, Label } from '@blueprintjs/core';
import {handleStringChange} from "@blueprintjs/docs-theme/lib/esm/index";
import ImageUploader from "./ImageUploader";

const HouseEditor = ({name, description, onNameChanged, onDescriptionChanged, onImageFilesChanged, chosenFiles, onRemoveFile}) => {
    return (
        <div className="pt-dialog-body">
            <Label text={'Наименование'} helperText={'*'}>
                <input className="pt-input"
                       placeholder="Введите название..."
                       onChange={onNameChanged}
                       value={name}/>
            </Label>

            <Label text={'Описание'}>
                <TextArea
                    fill={true}
                    onChange={handleStringChange(text => onDescriptionChanged(text))}
                    value={description}
                    placeholder="Введите описание..."
                    />
            </Label>

            <div>
                <label className="pt-file-input">
                    <input type="file" multiple onChange={onImageFilesChanged}/>
                    <span className="pt-file-upload-input">Choose file...</span>
                </label>
            </div>
            {
                chosenFiles.length > 0 ?
                    <div>
                        <p>Выбранные файлы</p>
                        {
                            chosenFiles.map(file =>
                                <div key={file.name}>
                                    <span className="pt-tag pt-tag-removable .modifier">
                                        {file.name}
                                        <button className="pt-tag-remove" onClick={() => onRemoveFile(file)}/>
                                    </span>
                                    {/*<div className="pt-progress-bar .modifier">*/}
                                        {/*<div className="pt-progress-meter" style={{"width" : "25%"}}/>*/}
                                    {/*</div>*/}
                                </div>
                            )
                        }
                    </div> : <div/>
            }

        </div>
    )
};

const CategoryEditor = ({name, onNameChanged}) => {
    return (
        <div className="pt-dialog-body">
            <Label text={'Наименование'} helperText={'*'}>
                <input className="pt-input"
                       placeholder="Введите название..."
                       onChange={onNameChanged}
                       value={name}/>
            </Label>
        </div>
    );
};


export default class EditHouse extends React.Component {
    constructor() {
        super();
        this.state = {
            file: null,
            nodes: [],

            categories: {},
            houses: {},
            links: {},

            house_id: -1,
            house_name: '',
            house_description: '',
            house_category_id: -1,
            image_files: [],
            category_name: '',
            category_description: '',
            showEditor: false,
            is_house: false,
            onConfirm: () => {},
            isImageUploaderVisible: false
        };
        this.addHouseRecord = this.addHouseRecord.bind(this);
        this.handleImageFilesChanged = this.handleImageFilesChanged.bind(this);
        // this.uploadImage = this.uploadImage.bind(this);
        this.handleAddClicked = this.handleAddClicked.bind(this);
        this.handleNodeCollapse = this.handleNodeCollapse.bind(this);
        this.handleNodeExpand = this.handleNodeExpand.bind(this);
        this.setNodes = this.setNodes.bind(this);
        this.handleNodeClick = this.handleNodeClick.bind(this);
        this.handleAddCategory = this.handleAddCategory.bind(this);
        this.handleEditCategory = this.handleEditCategory.bind(this);
        this.handleAddHouse = this.handleAddHouse.bind(this);
        this.handleEditHouse = this.handleEditHouse.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.addCategory = this.addCategory.bind(this);
        this.editCategory = this.editCategory.bind(this);
        this.addHouse = this.addHouse.bind(this);
        this.editHouse = this.editHouse.bind(this);
        this.handleRemoveFile = this.handleRemoveFile.bind(this);
    }

    componentDidMount() {
        axios
            .get(server + '/api/houses')
            .then(result => this.setState({
                categories: result.data.categories,
                houses: result.data.houses,
                links: result.data.links,
            }, this.setNodes))
            .catch(error => {
                console.error(error)
            })
    }

    setNodes() {
        const links = this.state.links;
        let updated = [...Object.keys(links).map(category_id => ({
                id: category_id,
                icon: 'home',
                label: this.state.categories[category_id].name,
                isExpanded: true,
                // hasCaret: links[category_id] > 0,
                childNodes: [...links[category_id].map(house_id => ({
                    id: house_id,
                    icon: 'dot',
                    label: this.state.houses[house_id].name,

                })).sort((a, b) => a.label > b.label), ({
                    id: -1,
                    icon: 'dot',
                    label: 'Добавить дом...',
                })]
            })), ({
                id: -1,
                icon: 'home',
                label: 'Добавить категорию...',
            })];
        this.setState({
            nodes: updated,
        })
    }

    handleImageFilesChanged(event) {
        const files = event.target.files;
        this.setState(previousState => {
            return {
                image_files: [...previousState.image_files, ...Object.values(files)]
            }
        })
    };

    handleRemoveFile(file) {
        let array = [...this.state.image_files];
        let index = array.indexOf(file);
        array.splice(index, 1);
        this.setState({
            image_files: array
        });
    }

    handleAddClicked() {
        // console.log('add clicked');
        // this.uploadImage();
    }
    //
    // uploadImage() {
    //     const file = this.state.file;
    //     if (file) {
    //         axios.post(server + '/api/upload/house_image', this.state.file, {
    //             headers: { 'Content-Type': this.state.file.type }
    //         })
    //     .then(response => {
    //         this.setState({
    //             image_filename: response.data.image_filename
    //         }, this.addHouseRecord);
    //     })
    //     .catch(error => {
    //             alert(error.message);
    //             console.log(error.response.status);
    //             console.log(error.message);
    //             console.log(error.response.data);
    //         });
    //     }
    // }

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

    handleNodeCollapse(nodeData) {
        nodeData.isExpanded = false;
        this.setState(this.state);
    };

    handleNodeExpand(nodeData) {
        nodeData.isExpanded = true;
        this.setState(this.state);
    };

    handleNodeClick(nodeData, nodePath) {
        console.log(nodeData);
        console.log(nodePath);
        if (nodePath.length == 1) {
            if (nodeData.id == -1) {
                this.handleAddCategory();
            } else {
                this.handleEditCategory(nodeData.id);
            }
        } else {
            if (nodeData.id == -1) {
                this.handleAddHouse(Object.values(this.state.categories)[nodePath[0]].id);
            } else {
                this.handleEditHouse(nodeData.id);
            }
        }
    }

    handleAddCategory() {
        this.setState({
            is_house: false,
            category_name: '',
            category_description: '',
            showEditor: true,
            onConfirm: this.addCategory,
            dialog_title: 'Добавить новую категорию',
            dialog_icon: 'add'
        })
    }

    handleEditCategory(id) {
        this.setState({
            is_house: false,
            category_name: this.state.categories[id].name,
            category_description: this.state.categories[id].description,
            showEditor: true,
            onConfirm: this.editCategory,
            dialog_title: 'Изменить категорию',
            dialog_icon: 'edit'
        })
    }

    handleAddHouse(category_id) {
        this.setState({
            is_house: true,
            house_name: '',
            house_description: '',
            showEditor: true,
            onConfirm: this.addHouse,
            house_category_id: category_id,
            dialog_title: 'Добавить дом',
            dialog_icon: 'add'
        })
    }

    handleEditHouse(id) {
        this.setState({
            house_id: id,
            is_house: true,
            house_name: this.state.houses[id].name,
            house_description: this.state.houses[id].description,
            showEditor: true,
            onConfirm: this.editHouse,
            dialog_title: 'Изменить дом',
            dialog_icon: 'edit'
        })
    }

    addCategory() {
        this.setState({
            showEditor: false
        });
        axios.post(server + '/api/edit/add_house_category', {
            name: this.state.category_name,
            description: this.state.category_description
        })
            .then(result => this.setState({
                categories: result.data.categories,
                houses: result.data.houses,
                links: result.data.links,
            }, this.setNodes))
            .catch(error => {
                console.error(error)
            })
    }

    editCategory() {
        this.setState({
            showEditor: false
        });
        alert('Category edited');
    }

    addHouse() {
        this.setState({
            showEditor: false
        });

        // todo: I don't know why this code doesn't send image data to server
        const files = this.state.image_files;
        let data = new FormData();
        for (let i = 0; i < files.length; i++) {
            console.log(i);
            let file = files[i];
            data.append(i.toString(), file);
        }

        // todo: but this does
        data.append('name', this.state.house_name);
        data.append('description', this.state.house_description);
        data.append('category_id', this.state.house_category_id);

        axios({
            method: 'post',
            url: server + '/api/add/house',
            data: data,
            config: { headers: {'Content-Type': 'multipart/form-data' }},
        })
            .then(result => this.setState({
                categories: result.data.categories,
                houses: result.data.houses,
                links: result.data.links,
            }, this.setNodes))
            .catch(function (response) {
                console.log(response);
            });
    }

    editHouse() {
        console.log('editHouse');
        this.setState({
            showEditor: false
        });
        let data = new FormData();
        data.append('house_id', this.state.house_id);
        data.append('name', this.state.house_name);
        data.append('description', this.state.house_description);

        axios({
            method: 'post',
            url: server + '/api/edit/house',
            data: data,
            config: { headers: {'Content-Type': 'multipart/form-data' }},
        })
            .then(result => this.setState({
                categories: result.data.categories,
                houses: result.data.houses,
                links: result.data.links,
            }, this.setNodes))
            .catch(function (response) {
                console.log(response);
            });
    }


    onCancel() {
        this.setState({
            showEditor: false
        })
    }

    render() {
        return (
            <div>
                <h1>{'Редактирование домов'}</h1>

                <Tree
                    contents={this.state.nodes}
                    onNodeClick={this.handleNodeClick}
                    onNodeCollapse={this.handleNodeCollapse}
                    onNodeExpand={this.handleNodeExpand}
                    className={Classes.ELEVATION_0}
                />

                <ImageUploader visible={true} callback={(files) => {
                    console.log("at callback");
                    console.log(files)
                }}/>
                {/*<Button text={"HELLO"} onClick={this.setState({isImageUploaderVisible: true})}/>*/}

                <Dialog
                    className={'my-dialog'}
                    icon={this.state.dialog_icon}
                    isOpen={this.state.showEditor}
                    onClose={this.onCancel}
                    title={this.state.dialog_title}
                >
                    {
                        this.state.is_house ?
                            <HouseEditor name={this.state.house_name}
                                         description={this.state.house_description}
                                         onNameChanged={(event) => this.setState({house_name: event.target.value})}
                                         onDescriptionChanged={(value) => this.setState({house_description: value})}
                                         onImageFilesChanged={this.handleImageFilesChanged}
                                         chosenFiles={this.state.image_files}
                                         onRemoveFile={this.handleRemoveFile}
                            /> :
                            <CategoryEditor name={this.state.category_name}
                                            onNameChanged={(event) => this.setState({category_name: event.target.value})} />
                    }


                    <div className="pt-dialog-footer">
                        <div className="pt-dialog-footer-actions">
                            <Button
                                intent={Intent.PRIMARY}
                                onClick={this.state.onConfirm}
                                text="Сохранить"
                            />
                        </div>
                    </div>
                </Dialog>
            </div>




        )
    }

}