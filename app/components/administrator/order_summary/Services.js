import React from "react";
import { Classes, Intent, Alert, Tab, Tabs, Button, NumericInput } from "@blueprintjs/core";

const Service = ({index, service}) => {
    return (
        <tr>
            <td>{index}</td>
            <td>{service.name}</td>
            <td>{service.price}</td>
            <td>{service.amount}</td>
            <td>{service.price * service.amount}</td>
            <td>{service.is_paid ? 'Оплачено' : 'Не оплачено'}</td>
        </tr>
    )
};

export const Services = ({order, onAddService}) => {
    return (
        <div>
            <h3>{'Услуги и штрафы'}</h3>
            <Button icon={'shopping-cart'} text={'Магазин услуг'} onClick={onAddService}/>
            <table className="pt-html-table">
                <thead>
                    <tr>
                        <td>№</td>
                        <td>Наименование</td>
                        <td>Цена</td>
                        <td>Количество</td>
                        <td>Стоимость</td>
                        <td>Статус</td>
                    </tr>
                </thead>
                <tbody>
                        {
                            Object.values(order.services)
                                .map((service, index) =>
                                    <Service
                                        key={index}
                                        index={index + 1}
                                        service={service}
                                    />)
                        }
                </tbody>
            </table>
        </div>
    )
};