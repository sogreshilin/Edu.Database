import React from "react";
import axios from "axios/index";
import {server} from "../../index";
import { getFromStorageOrThrow } from "../Storage";

const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        };

export default class OrderSummary extends React.Component {
    constructor() {
        super();
        this.state = {
            order: {},
            from_date_expected: null,
            to_date_expected: null,
            from_date_actual: null,
            to_date_actual: null,
        };
        this.confirmCompanyWorker = this.confirmCompanyWorker.bind(this);
        this.rejectCompanyWorker = this.rejectCompanyWorker.bind(this);
        this.confirmCheckIn = this.confirmCheckIn.bind(this);
        this.confirmCheckOut = this.confirmCheckOut.bind(this);
    }

    componentWillMount() {
        const order = JSON.parse(getFromStorageOrThrow('order'));
        try {
            this.setState({
                order: order,
                from_date_expected: new Date(order.time.check_in_expected).toLocaleDateString('ru', options),
                to_date_expected: new Date(order.time.check_out_expected).toLocaleDateString('ru', options),
                from_date_actual: order.time.check_in_actual !== null ?
                    new Date(order.time.check_out_actual).toLocaleDateString('ru', options) :
                    null,
                to_date_actual: order.time.check_out_actual !== null ?
                    new Date(order.time.check_out_actual).toLocaleDateString('ru', options) :
                    null,
            });
        } catch (error) {
            console.error(error);
            alert("Failed to initialize components")
        }
    }


    confirmCompanyWorker() {
        axios.post(server + '/api/confirm_company_worker', {
                order_id: this.state.order.id
            })
            .then(response => {
                this.setState({order: response.data})
            })
            .catch(error => {
                console.log(error.message);
                console.log(error.response.status);
                console.log(error.response.data);
            })
    }

    rejectCompanyWorker() {
        axios.post(server + '/api/reject_company_worker', {
                order_id: this.state.order.id
            })
            .then(response => {
                this.setState({order: response.data})
            })
            .catch(error => {
                console.log(error.message);
                console.log(error.response.status);
                console.log(error.response.data);
            })
    }

    confirmCheckIn() {
        axios.post(server + '/api/confirm_check_in', {
                order_id: this.state.order.id
            })
            .then(response => {
                this.setState({
                    order: response.data,
                    from_date_actual: new Date(response.data.time.check_in_actual).toLocaleDateString('ru', options),
                })
            })
            .catch(error => {
                console.log(error.message);
                console.log(error.response.status);
                console.log(error.response.data);
            })
    }

    confirmCheckOut() {
        axios.post(server + '/api/confirm_check_out', {
                order_id: this.state.order.id
            })
            .then(response => {
                this.setState({
                    order: response.data,
                    to_date_actual: new Date(response.data.time.check_out_actual).toLocaleDateString('ru', options),
                })
            })
            .catch(error => {
                console.log(error.message);
                console.log(error.response.status);
                console.log(error.response.data);
            })
    }

    render() {
        return (
            <div>
                <h3>
                    {'Заказ №' + this.state.order.id}
                </h3>
                <table className={'order-card'}>
                    <tbody>
                    <tr>
                        <td className={'subtitle'} colSpan="2">
                            {'Информация о заказе'}
                        </td>
                    </tr>
                    <tr>
                        <td>{'Статус'}</td>
                        <td>{this.state.order.status}</td>
                    </tr>
                    <tr>
                        <td>{'Категория дома'}</td>
                        <td>{this.state.order.house.category_name}</td>
                    </tr>
                    <tr>
                        <td>{'Дом'}</td>
                        <td>{this.state.order.house.name}</td>
                    </tr>
                    <tr>
                        <td className={'subtitle'} colSpan="2">
                            {'Информация о клиенте'}
                        </td>
                    </tr>
                    <tr>
                        <td>{'Фамилия'}</td>
                        <td>{this.state.order.client.last_name}</td>
                    </tr>
                    <tr>
                        <td>{'Имя'}</td>
                        <td>{this.state.order.client.first_name}</td>
                    </tr>
                    <tr>
                        <td>{'Отчество'}</td>
                        <td>{this.state.order.client.middle_name}</td>
                    </tr>
                    <tr>
                        <td>{'Категория'}</td>
                        <td>
                            {this.state.order.client.category_id === 1 ?
                            (<div>
                                {this.state.order.client.category_name}
                                {this.state.order.client.category_confirmed === null ?
                                    <div>
                                        <button onClick={this.confirmCompanyWorker}>{'Подтвердить'}</button>
                                        <button onClick={this.rejectCompanyWorker}>{'Отклонить'}</button>
                                    </div> : (
                                    this.state.order.client.category_confirmed ?
                                    <p className={'checked'}>{'(Подтверждено)'}</p> :
                                    <p className={'checked'}>{'(Отклонено)'}</p>
                                    )
                                }
                            </div>) :
                            (<div>
                                {this.state.order.client.category_name}
                            </div>)}
                        </td>
                    </tr>
                    <tr>
                        <td className={'subtitle'} colSpan="2">
                            {'Информация об оплате'}
                        </td>
                    </tr>
                    <tr>
                        <td>{'Оплата дома'}</td>
                        <td>{'Онлайн или Кнопка Подтвердить Оплату'}</td>
                    </tr>
                    <tr>
                        <td className={'subtitle'} colSpan="2">
                            {'Заселение'}
                        </td>
                    </tr>
                    <tr>
                        <td>{'Ожидаемое время'}</td>
                        <td>{this.state.from_date_expected}</td>
                    </tr>
                    <tr>
                        <td>{'Фактическое время заселения'}</td>
                        <td>
                        {
                            this.state.from_date_actual === null ?
                            <button onClick={this.confirmCheckIn}>{'Подтвердить заселение'}</button> :
                            this.state.from_date_actual
                        }
                        </td>
                    </tr>
                    <tr>
                        <td className={'subtitle'} colSpan="2">
                            {'Выселение'}
                        </td>
                    </tr>
                    <tr>
                        <td>{'Ожидаемое время'}</td>
                        <td>{this.state.to_date_expected}</td>
                    </tr>
                    <tr>
                        <td>{'Фактическое время'}</td>
                        <td>
                        {
                            this.state.to_date_actual === null ?
                            <button onClick={this.confirmCheckOut}>{'Подтвердить выселение'}</button> :
                            this.state.to_date_actual
                        }</td>
                    </tr>

                    </tbody>
                </table>
            </div>
        );
    }
}
