import React from "react";
import axios from "axios/index";
import {server} from "../../index";
import {Redirect, Route} from "react-router-dom";
import { Card } from '@blueprintjs/core';

import styles from './order_filter.scss';
import {SessionStorage} from "../Storage";
import {OrderStatusText} from "../order/order";

const OrderCard = ({ order, onClick }) => {
    const options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    const from_date = new Date(order.time.check_in_expected).toLocaleDateString('ru', options);
    const to_date = new Date(order.time.check_out_expected).toLocaleDateString('ru', options);
    const client =
        order.client.last_name + ' ' +
        order.client.first_name.charAt(0) + '.' +
        (order.client.middle_name ? order.client.middle_name.charAt(0) + '.' : '');
    return (<div>
        <h3>
            {'Заказ №' + order.id}
        </h3>
        <table className={'order-card'}>
            <tbody>
                <tr>
                    <td>{'Статус'}</td>
                    <td>{OrderStatusText[order.status_id]}</td>
                </tr>
                <tr>
                    <td>{'Категория дома'}</td>
                    <td>{order.house.category_name}</td>
                </tr>
                <tr>
                    <td>{'Дом'}</td>
                    <td>{order.house.name}</td>
                </tr>
                <tr>
                    <td>{'Дата въезда'}</td>
                    <td>{from_date}</td>
                </tr>
                <tr>
                    <td>{'Дата выезда'}</td>
                    <td>{to_date}</td>
                </tr>
                <tr>
                    <td>{'Клиент'}</td>
                    <td>{client}</td>
                </tr>
            </tbody>
        </table>
        <button onClick={() => onClick(order.id)}>{'Подробнее'}</button>
    </div>)
};

export default class OrdersFilter extends React.Component {
    constructor() {
        super();
        this.state = {
            chosenOrderId: null,
            orders: {},
            redirectToOrderFrom: false,
        };
        this.onOrderChosen = this.onOrderChosen.bind(this);
    };

    onOrderChosen(orderId) {
        SessionStorage.put('order', JSON.stringify(this.state.orders[orderId]));
        this.setState({
            redirectToOrderForm: true,
            chosenOrderId: orderId
        })
    };

    componentDidMount() {
        axios.get(server + '/api/upcoming_orders')
            .then(result => {
                    console.log('result.data = ' + result.data);
                    this.setState({
                        orders: result.data
                    })
                }
            )
            .catch(error => {
                console.error(error)
            })
    }

    render() {
        return (
            this.state.redirectToOrderForm ? (
                <Route>
                    <Redirect push to={"/admin/order_summary"} />
                </Route>
            ) : (
                <div>
                    {
                            Object.values(this.state.orders)
                                .map(order =>
                                    <div key={order.id}>
                                        <Card>
                                            <OrderCard
                                                order={order}
                                                onClick={this.onOrderChosen}
                                            />
                                        </Card>
                                        <p/>
                                    </div>
                                )
                    }
                </div>
            )
        )
    }
}