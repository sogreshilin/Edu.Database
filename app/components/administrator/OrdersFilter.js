import React from "react";
import axios from "axios/index";
import {server} from "../../index";
import {Redirect, Route} from "react-router-dom";

const OrderCard = ({ order, onClick }) => (
    <div>
        <section>
            <h3> {'Заказ №' + order.id} </h3>
            <p> {'Статус: ' + order.status} </p>
            <p> {'Категория дома: ' + order.house.category} </p>
            <p> {'Дом: ' + order.house.name}</p>
            <p> {'С ' + order.time.checkIn + ' по ' + order.time.checkOut} </p>
            <p> {'Клиент: ' +
                order.client.lastName + ' ' +
                order.client.firstName + ' ' +
                order.client.secondName
            } </p>
        </section>
        <section>
            <button onClick={() => onClick(order.id)} >{'Подробнее'}</button>
        </section>
    </div>
);

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
        const order = this.state.orders[orderId];

        this.setState({
            redirectToOrderForm: true
        })
    };

    componentDidMount() {
        axios.get(server + '/api/upcoming_orders')
            .then(result => this.setState(result.data))
            .catch(error => {
                console.error(error)
            })
    }

    render() {
        return (
            this.state.redirectToOrderForm ? (
                <Route>
                    <Redirect push to={"react/admin/order/" + this.state.chosenOrderId} />
                </Route>
            ) : (
                <div>
                    <div>
                        {
                            this.state.orders.map(order => <OrderCard order={order} onClick={this.onOrderChosen}/>)
                        }
                    </div>
                </div>
            )
        )
    }
}