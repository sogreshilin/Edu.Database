import React from "react";
import axios from "axios/index";
import {server} from "../../index";
import {Overlay, Button, Classes, Intent, EditableText, NumericInput, Label, TextArea, Card} from "@blueprintjs/core";
import { Cell, Column, Table, ColumnHeaderCell } from "@blueprintjs/table";

import styles from './shop.scss';

const column_names = ['Наименование', 'Цена', 'Количество', 'Стоимость', 'Удалить'];

const PurchasedItem = ({item, services, onDelete}) => {
    return (
        <tr>
            <td>{services[item.service_id].name}</td>
            <td>{services[item.service_id].price}</td>
            <td>{item.amount}</td>
            <td>{services[item.service_id].price * item.amount}</td>
            <td>
                <Button icon={'delete'}
                        intent={Intent.DANGER}
                        text={'Удалить'}
                        style={{display: 'inline-block'}}
                        onClick={() => {onDelete(item.id)}}
                />
            </td>
        </tr>
    );
};

const PurchasedItems = ({basket, services, onDelete }) => {
    return (
        <table className={'services-table'}>
                    <tbody>
                        <tr>
                        {
                            column_names.map((name, index) => <th key={index}>{name}</th>)
                        }
                        </tr>
                        {
                            basket.map(item => <PurchasedItem key={item.id} item={item} services={services} onDelete={onDelete}/>)
                        }
                    </tbody>
                </table>
    );
};

const ServicePicker = (
    {
        service_id,
        services,
        onServiceChanged,
        price,
        amount,
        onAmountChanged,
        onAddItem }) => {
    return (
        <Card>
            <div className="pt-select" style={{display: 'inline-block'}}>
                <select
                    value={service_id}
                    onChange={onServiceChanged}>
                    <option key={0} value={0}>Выберите услугу...</option>
                    {
                        Object.values(services)
                            .map(service => <option key={service.id} value={service.id}>{service.name}</option>)
                    }
                </select>
            </div>

            <div style={{display: 'inline-block'}}>
                <EditableText
                    value={price}
                    disabled={true}
                />
            </div>

            <div style={{display: 'inline-block'}}>
                <NumericInput
                    value={amount}
                    onValueChange={onAmountChanged}
                    className={Classes.FORM_CONTENT}
                    fill={true}
                    min={0}
                />
            </div>

            <div style={{display: 'inline-block'}}>
                <EditableText
                    value={price * amount}
                    disabled={true}
                />
            </div>

            <div style={{display: 'inline-block'}}>
                <Button icon={'plus'}
                        intent={Intent.SUCCESS}
                        text={'Добавить'}
                        style={{display: 'inline-block'}}
                        onClick={onAddItem}
                />
            </div>

        </Card>
    );
};

const Total = ({basket, services, onSubmit}) => {
    return (
        <Card>
            <p style={{display: 'inline-block'}}>Total: </p>
            <p style={{display: 'inline-block'}}>
            {
                basket.reduce((accumulator, current_item, index, array) => accumulator += (services[current_item.service_id].price * current_item.amount), 0)
            }
            </p>
            <Button style={{display: 'inline-block'}} text={"Продолжить"} onClick={onSubmit}/>
        </Card>
    )
};

function parseQuery(query) {
    const rv = {};
    query = query.substring(1);
    if (query.includes('&')) {
        query.split('&').forEach(e => {
            const [key, value] = e.split('=', 2);
            rv[key] = value;
        });
    } else {
        const [key, value] = query.split('=', 2);
        rv[key] = value;
    }
    return rv;
}

export default class ServiceShop extends React.Component {
    constructor() {
        super();
        this.state = {
            order_id: -1,
            services: {},
            basket: [],
            current_item_id: 0,
            current_service_id: 0,
            current_price: 0,
            current_amount: 0,
            item_id_generator: 1,
        };
        this.handleServiceChanged = this.handleServiceChanged.bind(this);
        this.handleAddItem = this.handleAddItem.bind(this);
        this.handleDeleteItem = this.handleDeleteItem.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        console.log(this.props.location.search);
        this.setState({
            order_id: parseQuery(this.props.location.search)['order_id'] || -1,
        }, () => {
            if (this.state.order_id <= 0) {
                alert("Order id was not found");
            }
        });

        axios.get(server + '/api/services')
            .then(result => this.setState({
                services: result.data
            }))
            .catch(error => alert("Server error: " + error.data))
    }

    handleServiceChanged(event) {
        const id = event.target.value;
        this.setState({
            current_service_id: parseInt(id),
            current_price: id > 0 ? this.state.services[id].price : 0,
        })
    }

    handleAddItem() {
        if (this.state.current_service_id > 0 && this.state.current_amount > 0) {
            const item = {
                id: this.state.item_id_generator,
                service_id: this.state.current_service_id,
                amount: this.state.current_amount,
            };
            const updated_basket = this.state.basket.concat(item);
            this.setState({
                item_id_generator: this.state.item_id_generator + 1,
                basket: updated_basket,
                current_service_id: 0,
                current_price: 0,
                current_amount: 0,
            });
        }
    }

    handleDeleteItem(item_id) {
        const updated_basket = this.state.basket.filter(e => e.id !== item_id);
        this.setState({
            basket: updated_basket,
        })
    }

    handleSubmit() {
        console.log(this.props);
        axios.post(server + '/api/order/add_services', {
            order_id: this.state.order_id,
            services: this.state.basket,
        })
            .then(result => console.log(result))
            .catch(error => console.log(error));
    }

    render() {
        return (
            <div>
                <ServicePicker
                    services={this.state.services}
                    onServiceChanged={this.handleServiceChanged}
                    service_id={this.state.current_service_id}
                    price={this.state.current_price}
                    amount={this.state.current_amount}
                    onAmountChanged={value => {this.setState({current_amount: value})}}
                    onAddItem={this.handleAddItem}
                />

                <PurchasedItems
                    basket={this.state.basket}
                    onDelete={this.handleDeleteItem}
                    services={this.state.services}
                />

                <Total basket={this.state.basket} services={this.state.services} onSubmit={this.handleSubmit}/>


            </div>

        )
    }

}