import React from "react";
import axios from "axios/index";
import { Tag, Tree, Classes, Dialog, Intent, Button, EditableText, TextArea, FileInput, Label } from '@blueprintjs/core';


const Row = ({index, name, size, onDelete, isUploading, progress}) => {
    const progressBarStyle =
        progress === 100
            ? "pt-progress-bar pt-intent-success pt-no-stripes pt-no-animation"
            : "pt-progress-bar";
    return (
        <tr>
            <td>{index + 1}</td>
            <td>{name}</td>
            <td>{size}</td>
            <td>
            {
                isUploading ?
                    <div className={progressBarStyle}>
                        <div className="pt-progress-meter" style={{width: progress.toString() + "%"}}/>
                    </div> :
                    <Button icon={'delete'} onClick={() => onDelete(index)} text={'Удалить'} intent={Intent.DANGER}/>
            }
            </td>
        </tr>
    );
};


export default class ImageUploader extends React.Component {
    constructor(args) {
        super();
        this.state = {
            chosenFiles: [],
            showDialog: args.visible,
            isUploading: false,
            progresses: [],
            uploadedFileNames: [],
            onUpload: args.onUpload,
            onCancel: args.onCancel
        };
        this.onCancel = this.onCancel.bind(this);
        this.onConfirm = this.onConfirm.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
    }

    onCancel() {
        this.setState({
            chosenFiles: [],
            showDialog: false,
            isUploading: false
        });
        this.state.onCancel();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            showDialog: nextProps.visible
        })
    }

    onConfirm() {
        let zeros = new Array(this.state.chosenFiles.length).fill(0);
        this.setState({
            isUploading: true,
            progresses: zeros
        });

        const config = {
            onUploadProgress: progressEvent => console.log(progressEvent.loaded)
        };
        Promise.all(this.state.chosenFiles.map((file, index) =>
            axios.post('/api/upload/image', file, {
                headers: {'Content-Type': file.type},
                onUploadProgress: progressEvent => {
                    this.onProgressChanged(index, progressEvent.loaded)
                }
            })))
            .then(values => this.state.onUpload(values.map(response => response.data.filename)))
            .catch(error => console.log(error));
    }

    handleAdd(event) {
        const files = event.target.files;
        console.log(files);
        this.setState(prevState => {
            return {
                chosenFiles: [...prevState.chosenFiles, ...files]
            }
        });
    }

    handleDelete(index) {
        let array = [...this.state.chosenFiles];
        array.splice(index, 1);
        this.setState({
            chosenFiles: array
        });
    }

    onProgressChanged(index, loaded) {
        let array = [...this.state.progresses];
        array[index] = loaded / this.state.chosenFiles[index].size * 100;
        if (array.every(e => e === 100)) {
            this.setState({
                chosenFiles: [],
                showDialog: false,
                isUploading: false,
            })
        }
        this.setState({
            progresses: array
        })
    }

    render() {
        console.log(this.state.chosenFiles.length);
        return (
            <div>
                <Dialog
                    icon="upload"
                    isOpen={this.state.showDialog}
                    onClose={this.onCancel}
                    title="Загрузка изображений"
                >
                    <table className="pt-html-table">
                        <thead>
                            <tr>
                                <td>№</td>
                                <td>Название файла</td>
                                <td>Размер</td>
                                {
                                    this.state.isUploading ? <td>Прогресс</td> : <td>Действие</td>
                                }
                            </tr>
                        </thead>
                        <tbody>
                        {
                            this.state.chosenFiles.map((file, index) =>
                            <Row key={index}
                                 index={index}
                                 name={file.name}
                                 size={file.size}
                                 isUploading={this.state.isUploading}
                                 progress={this.state.progresses[index]}
                                 onDelete={this.handleDelete}
                            />)
                        }
                        {
                            this.state.isUploading ? <tr/>:
                                <tr>
                                    <td/><td/><td/>
                                    <td><Button onClick={() => this.refs.fileUpload.click()} intent={Intent.SUCCESS} icon="add" text='Выбрать'/></td>
                                </tr>
                        }

                        </tbody>
                    </table>

                    <input type="file"
                           id="fileUpload" ref="fileUpload"
                           multiple
                           accept="image/jpeg, image/png"
                           style={{opacity:0, height:"0px", width:"0px"}}
                           onChange={this.handleAdd}
                    />


                    <div className="pt-dialog-footer">
                        <div className="pt-dialog-footer-actions">
                            <Button intent={Intent.WARNING} onClick={this.onCancel} text="Отменить"/>
                            <Button disabled={this.state.chosenFiles.length === 0} intent={Intent.PRIMARY} onClick={this.onConfirm} text="Загрузить"/>
                        </div>
                    </div>
                </Dialog>
            </div>
        )
    }


}