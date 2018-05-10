import React, { Component } from 'react';

import OrderCard from "./OrderCard";
import { OrderStatusCodes } from "../order/order";
import { Callout, Intent } from "@blueprintjs/core";
import { API } from "../../api";


const LoadingError = ({ message }) => (
    <div>
        <p>{ message }</p>
    </div>
);

class OrderReview extends Component {

    constructor(props) {
        super(props);

        this.state = {
            order: {},
            fromDate: null,
            toDate: null,
            isOrderOverdue: false,

            showError: false,
            loadComplete: false,
        };

        this.order_id = this.props.match.params.id;

        this.onCancelOrder = this.onCancelOrder.bind(this);
        this.onProlongOrder = this.onProlongOrder.bind(this);
        this.updateOrderInformation = this.updateOrderInformation.bind(this);
    }

    componentDidMount() {
        this.updateOrderInformation()
    }

    render() {
        return (
            this.state.showError ? (
                <LoadingError message={"Не удалось загрузить информацию о заказе"} />
            ) : (
                <div className={'order-review'}>
                    <h3>Информация о заказе</h3>
                    {
                        this.state.loadComplete &&
                        <OrderCard order={this.state.order}
                                   fromDate={this.state.fromDate}
                                   toDate={this.state.toDate}
                        />
                    }
                    {
                        this.state.order.status_id !== OrderStatusCodes.Cancelled &&
                        <button id={"cancel-order-btn"} onClick={this.onCancelOrder}>Отменить заказ</button>
                    }
                    {
                        this.state.isOrderOverdue &&
                        <Callout intent={Intent.DANGER}>
                            <p>Внимание! Время брони истекло и дом может быть занят.</p>
                            <button id={"prolong-order-btn"} onClick={this.onProlongOrder}>Забронировать снова</button>
                        </Callout>
                    }
                </div>
            )
        );
    }

    updateOrderInformation() {
        API.orders.get(this.order_id)
            .then(({ data }) => this.setState({
                order: data,
                loadComplete: true
            }))
            .catch(error => {
                console.error(error);
                this.setState({ showError: true })
            })
    }

    onCancelOrder() {
        API.orders.cancel(this.order_id)
            .then(response => {
                alert("Заказ успешно отменен");
                this.updateOrderInformation();
            })
            .catch(error => {
                console.error(error);
                alert("Не удалось отменить заказ");
            })

    }

    onProlongOrder() {
        console.log("Order prolonging requested")
    }

}

export default OrderReview
