import React from "react";
import axios from "axios/index";
import {server} from "../../../index";
import {Overlay, Button, Classes, Intent, EditableText, NumericInput, Label, TextArea, Card} from "@blueprintjs/core";
import { Cell, Column, Table, ColumnHeaderCell } from "@blueprintjs/table";


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
        <table className="pt-html-table">
            <thead>
                <tr>
                {
                    column_names.map((name, index) => <th key={index}>{name}</th>)
                }
                </tr>
            </thead>
            <tbody>
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

export const ServiceShop = (
    {
        services,
        onServiceChanged,
        current_service_id,
        current_price,
        current_amount,
        onAmountChanged,
        onAddItem,
        basket,
        onDeleteItem,
        onSubmit   }) => {
    return (
            <div>
                <ServicePicker
                    services={services}
                    onServiceChanged={onServiceChanged}
                    service_id={current_service_id}
                    price={current_price}
                    amount={current_amount}
                    onAmountChanged={onAmountChanged}
                    onAddItem={onAddItem}
                />

                <PurchasedItems
                    basket={basket}
                    onDelete={onDeleteItem}
                    services={services}
                />

                <Total basket={basket}
                       services={services}
                       onSubmit={onSubmit}/>

            </div>

    );
};