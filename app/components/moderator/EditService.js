import React from "react";
import axios from "axios/index";
import {server} from "../../index";
import classNames from "classnames";
import { handleStringChange } from "@blueprintjs/docs-theme";
import {
    Overlay,
    Button,
    Classes,
    Intent,
    EditableText,
    NumericInput,
    Label,
    TextArea,
    Card,
    Dialog
} from "@blueprintjs/core";
import {ClientCategoryCodes, ClientCategoryText} from "../client/client";

const OVERLAY_EXAMPLE_CLASS = "docs-overlay-example-transition";
const classes = classNames(Classes.CARD, Classes.ELEVATION_4, OVERLAY_EXAMPLE_CLASS);

const State = {
    Create: 1,
    Edit: 2,
};

const ServiceRow = ({index, service, onEdit, onDelete}) => {
    return (
        <tr>
            <td>{index}</td>
            <td>{service.name}</td>
            <td>{service.price}</td>
            <td><Button icon={'edit'} onClick={() => onEdit(service.id)} text={'Изменить'} intent={Intent.PRIMARY} /></td>
            <td><Button icon={'delete'} onClick={() => onDelete(service.id)} text={'Удалить'} intent={Intent.DANGER} /></td>
        </tr>
    );
};


function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export default class EditService extends React.Component {
    constructor() {
        super();
        this.state = ({
            services: {},
            service_id: null,
            current_name: '',
            current_description: '',
            current_price: '',
            overlayIsOpen: false,
            state: null,
        });
        this.handleCreate = this.handleCreate.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    componentDidMount() {
        axios.get(server + '/api/extras')
            .then(result => this.setState({
                services: result.data
            }))
            .catch(error =>
                console.log(error)
            )
    }

    handleCreate() {
        this.setState({
            state: State.Create,
            service_id: null,
            overlayIsOpen: true,
            current_name: '',
            current_price: '',
            current_description: '',
        });
    }

    handleEdit(service_id) {
        const service = this.state.services[service_id];
        this.setState({
            state: State.Edit,
            service_id: service_id,
            current_name: service.name,
            current_price: service.price,
            current_description: service.description,
            overlayIsOpen: true,
        })
    }

    handleDelete(service_id) {
        axios.post(server + '/api/remove/extra', { id: service_id })
            .then(result => this.setState({services: result.data}))
    }

    handleSave() {
        let resource = '';
        let data = {};
        switch (this.state.state) {
            case State.Create:
                resource = '/api/add/extra';
                data = {
                    name: this.state.current_name,
                    price: this.state.current_price,
                    description: this.state.current_description
                };
                break;
            case State.Edit:
                resource = '/api/edit/extra';
                data = {
                    id: this.state.service_id,
                    name: this.state.current_name,
                    price: this.state.current_price,
                    description: this.state.current_description
                };
                break;
        }

        axios.post(server + resource, data)
            .then(result => this.setState({services: result.data}))
            .catch(error => alert(error.data));

        this.setState({
            overlayIsOpen: false
        });
    }

    handleCancel() {
        this.setState({
            overlayIsOpen: false
        });
    }

    render() {
        return (
            <div>
                <Dialog
                    onClose={this.handleCancel}
                    isOpen={this.state.overlayIsOpen}
                    className={Classes.OVERLAY_SCROLL_CONTAINER}
                    title="Добавить услугу"
                >
                    <div className="pt-dialog-body">
                        <Label text={'Наименование'} helperText={'*'}>
                            <input className="pt-input" placeholder="Введите название"
                                   onChange={value => {this.setState({current_name: value.target.value})}}
                                value={this.state.current_name}/>
                        </Label>
                        <Label text={'Цена за единицу'} helperText={'*'}>
                            <NumericInput
                                className={Classes.FORM_CONTENT}
                                fill={true}
                                majorStepSize={200}
                                stepSize={100}
                                min={0}
                                onValueChange={value => {this.setState({current_price: value})}}
                                value={this.state.current_price}
                                placeholder="Установите цену"
                            />
                        </Label>
                        <Label text={'Описание'}>
                            <TextArea fill={true}
                                onChange={handleStringChange(textContent => this.setState({ current_description: textContent }))}
                                value={this.state.current_description}
                                      placeholder="Введите описание"
                                />
                        </Label>

                        <div className="pt-dialog-footer">
                        <div className="pt-dialog-footer-actions">
                            <Button intent={Intent.NONE} onClick={this.handleCancel} text={'Отменить'}/>
                            <Button intent={Intent.PRIMARY} onClick={this.handleSave} text={'Сохранить'}/>

                        </div>
                    </div>


                    </div>
                </Dialog>


                <table className="pt-html-table">
                    <thead>
                        <tr>
                            <td>№</td>
                            <td>Наименование услуги</td>
                            <td>Установленная цена</td>
                            <td>Редактировать</td>
                            <td>Удалить</td>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        Object.values(this.state.services).filter(service => service.available).map((service, index) =>
                        <ServiceRow key={service.id} index={index + 1} service={service} onEdit={this.handleEdit} onDelete={this.handleDelete}/>)
                    }
                    </tbody>
                </table>

                <Button onClick={this.handleCreate} intent={Intent.PRIMARY} icon="add" text='Добавить' />

            </div>
        )
    }
}