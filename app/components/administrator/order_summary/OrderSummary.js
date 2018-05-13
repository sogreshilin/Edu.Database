import React from "react";
import { Classes, Intent, Alert, Tab, Tabs, Overlay } from "@blueprintjs/core";
import {getFromStorageOrThrow, SessionStorage} from "../../Storage";
import {date_options, date_time_options} from "../OrderSummary";
import axios from "axios/index";
import {server} from "../../../index";
import { Order } from "./Order"
import { Guests } from "./Guests"
import { Services } from "./Services"
import { Payment } from "./Payment"
import { Time } from "./Time"
import { ServiceShop } from "./ServiceShop"
import classNames from "classnames";

const classes = classNames(Classes.CARD, Classes.ELEVATION_4, "docs-overlay-example-transition");


export default class OrderSummary extends React.Component {
    constructor() {
        super();

        this.state = {
            active_tab_id: "order",
            order: {},
            people_count: 0,
            from_date_expected: null,
            to_date_expected: null,
            from_date_actual: null,
            to_date_actual: null,

            isServiceShopOn: false,
            alertAction: null,
            alertIsOpen: false,
            alertTooltip: '',

            // for ServiceShop
            services: {},
            basket: [],
            current_item_id: 0,
            current_service_id: 0,
            current_price: 0,
            current_amount: 0,
            item_id_generator: 1,
        };

        this.handleTabChanged = this.handleTabChanged.bind(this);
        this.alertConfirmCheckIn = this.alertConfirmCheckIn.bind(this);
        this.alertConfirmCheckOut = this.alertConfirmCheckOut.bind(this);
        this.confirmCheckIn = this.confirmCheckIn.bind(this);
        this.confirmCheckOut = this.confirmCheckOut.bind(this);
        this.alertConfirmCompanyWorker = this.alertConfirmCompanyWorker.bind(this);
        this.alertRejectCompanyWorker = this.alertRejectCompanyWorker.bind(this);
        this.rejectCompanyWorker = this.rejectCompanyWorker.bind(this);
        this.confirmCompanyWorker = this.confirmCompanyWorker.bind(this);
        this.alertConfirmPeopleCount = this.alertConfirmPeopleCount.bind(this);
        this.handlePeopleCountChanged = this.handlePeopleCountChanged.bind(this);
        this.confirmPeopleCount = this.confirmPeopleCount.bind(this);
        this.handleAlertCancel = this.handleAlertCancel.bind(this);
        this.handleAlertConfirm = this.handleAlertConfirm.bind(this);
        this.showServiceShop = this.showServiceShop.bind(this);
        this.hideServiceShop = this.hideServiceShop.bind(this);
        this.handleServiceChanged = this.handleServiceChanged.bind(this);
        this.handleAddItem = this.handleAddItem.bind(this);
        this.handleDeleteItem = this.handleDeleteItem.bind(this);
        this.handleSubmitFromServiceShop = this.handleSubmitFromServiceShop.bind(this);
    }

    componentDidMount() {
        axios.get(server + '/api/services')
            .then(result => this.setState({
                services: result.data
            }))
            .catch(error => alert("Server error: " + error.data))
    }

    componentWillMount() {
        const order = JSON.parse(getFromStorageOrThrow('order'));

        try {
            this.setState({
                order: order,
                from_date_expected: new Date(order.time.check_in_expected).toLocaleDateString('ru', date_options),
                to_date_expected: new Date(order.time.check_out_expected).toLocaleDateString('ru', date_options),
                from_date_actual: order.time.check_in_actual !== null ?
                    new Date(order.time.check_in_actual).toLocaleDateString('ru', date_time_options) :
                    null,
                to_date_actual: order.time.check_out_actual !== null ?
                    new Date(order.time.check_out_actual).toLocaleDateString('ru', date_time_options) :
                    null,
                people_count: order.person_count
            });
        } catch (error) {
            console.error(error);
            alert("Failed to initialize components")
        }
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

    handleTabChanged(active_tab_id) {
        this.setState({ active_tab_id: active_tab_id })
    }

    handleAlertCancel() {
        this.setState({alertIsOpen: false})
    }

    handleAlertConfirm() {
        this.state.alertAction();
        this.setState({alertIsOpen: false});
    }

    alertConfirmCompanyWorker() {
       this.setState({
           alertIsOpen: true,
           alertAction: this.confirmCompanyWorker,
           alertTooltip: 'подтвердить, что клиент является сотрудником компании'
       })
    }

    confirmCompanyWorker() {
        axios.post(server + '/api/confirm_company_worker', {
                order_id: this.state.order.id
            })
            .then(response => {
                this.setState({order: response.data},
                    () => SessionStorage.put('order', JSON.stringify(this.state.order)))
            })
            .catch(error => {
                console.log(error.message);
                console.log(error.response.status);
                console.log(error.response.data);
            })
    }

    alertRejectCompanyWorker() {
       this.setState({
           alertIsOpen: true,
           alertAction: this.rejectCompanyWorker,
           alertTooltip: 'отклонить, что клиент является сотрудником компании'
       })
    }

    rejectCompanyWorker() {
        axios.post(server + '/api/reject_company_worker', {
                order_id: this.state.order.id
            })
            .then(response => {
                this.setState({order: response.data},
                    () => SessionStorage.put('order', JSON.stringify(this.state.order)))
            })
            .catch(error => {
                console.log(error.message);
                console.log(error.response.status);
                console.log(error.response.data);
            })
    }

    alertConfirmCheckIn() {
        this.setState({
            alertIsOpen: true,
            alertAction: this.confirmCheckIn,
            alertTooltip: 'подтвердить заселение'
        })
    }

    confirmCheckIn() {
        axios.post(server + '/api/confirm_check_in', {
                order_id: this.state.order.id
            })
            .then(response => {
                this.setState({
                    order: response.data,
                    from_date_actual: new Date(response.data.time.check_in_actual).toLocaleDateString('ru', date_time_options),
                }, () => SessionStorage.put('order', JSON.stringify(this.state.order)))
            })
            .catch(error => {
                console.log(error.message);
                console.log(error.response.status);
                console.log(error.response.data);
            })
    }

    alertConfirmCheckOut() {
        this.setState({
            alertIsOpen: true,
            alertAction: this.confirmCheckOut,
            alertTooltip: 'подтвердить выселение'
        })
    }

    alertConfirmPeopleCount() {
        this.setState({
            alertIsOpen: true,
            alertAction: this.confirmPeopleCount,
            alertTooltip: 'подтвердить количество проживающих: ' + this.state.people_count
        })
    }

    confirmCheckOut() {
        SessionStorage.put('order', JSON.stringify(this.state.order));
        axios.post(server + '/api/confirm_check_out', {
                order_id: this.state.order.id
            })
            .then(response => {
                this.setState({
                    order: response.data,
                    to_date_actual: new Date(response.data.time.check_out_actual).toLocaleDateString('ru', date_time_options),
                }, () => SessionStorage.put('order', JSON.stringify(this.state.order)))
            })
            .catch(error => {
                console.log(error.message);
                console.log(error.response.status);
                console.log(error.response.data);
            })
    }

    handlePeopleCountChanged(value) {
        this.setState({
            people_count: value,
        });
    }

    confirmPeopleCount() {
        axios.post(server + '/api/confirm_amount', {
                order_id: this.state.order.id,
                amount: this.state.people_count
            })
            .then(response => {
                this.setState({
                    order: response.data,
                }, () => SessionStorage.put('order', JSON.stringify(this.state.order)))
            })
            .catch(error => {
                console.log(error.message);
                console.log(error.response.status);
                console.log(error.response.data);
            })
    }

    showServiceShop() {
        this.setState({
            isServiceShopOn: true,
        })
    }

    hideServiceShop() {
        this.setState({
            isServiceShopOn: false,
        })
    }

    handleSubmitFromServiceShop() {
        this.setState({
            isServiceShopOn: false,
            basket: [],
            current_item_id: 0,
            current_service_id: 0,
            current_price: 0,
            current_amount: 0,
            item_id_generator: 1,
        });
        axios.post(server + '/api/order/add_services', {
            order_id: this.state.order.id,
            services: this.state.basket,
        })
            .then(response => {
                this.setState({
                    order: response.data,
                }, () => SessionStorage.put('order', JSON.stringify(this.state.order)))
            })
            .catch(error => console.log(error));
    }

    render() {
        return (
            <div>

                <Tabs onChange={this.handleTabChanged}>

                    <Tab id="order" title="Заказ" panel={<Order order={this.state.order}/>} />

                    <Tab id="guests" title="Гости" panel={
                        <Guests
                            order={this.state.order}
                            onConfirm={this.alertConfirmCompanyWorker}
                            onReject={this.alertRejectCompanyWorker}
                            peopleCount={this.state.people_count}
                            onPeopleCountChange={this.handlePeopleCountChanged}
                            onConfirmPeopleCount={this.alertConfirmPeopleCount}
                            peopleCountConfirmed={this.state.order.person_count > 0}
                        />}
                    />

                    <Tab id="time" title="Время" panel={
                        <Time order={this.state.order}
                            from_date_expected={this.state.from_date_expected}
                            from_date_actual={this.state.from_date_actual}
                            to_date_expected={this.state.to_date_expected }
                            to_date_actual={this.state.to_date_actual}
                            onCheckIn={this.alertConfirmCheckIn}
                            onCheckOut={this.alertConfirmCheckOut}
                        />}
                    />

                    <Tab id="services" title="Услуги и штрафы" panel={
                        <Services order={this.state.order}
                                  onAddService={this.showServiceShop}
                        />}
                    />

                    <Tab id="payment" title="Оплата" panel={<Payment order={this.state.order}/>} />

                    <Tabs.Expander />

                </Tabs>


                <Overlay
                    onClose={this.hideServiceShop}
                    isOpen={this.state.isServiceShopOn}
                    className={Classes.OVERLAY_SCROLL_CONTAINER}
                >
                    <div className={classes}>
                        <ServiceShop
                            services={this.state.services}
                            onServiceChanged={this.handleServiceChanged}
                            current_service_id={this.state.current_service_id}
                            current_price={this.state.current_price}
                            current_amount={this.state.current_amount}
                            onAmountChanged={value => {this.setState({current_amount: value})}}
                            onAddItem={this.handleAddItem}
                            basket={this.state.basket}
                            onDeleteItem={this.handleDeleteItem}
                            onSubmit={this.handleSubmitFromServiceShop}
                        />
                    </div>
                </Overlay>


                <Alert
                    cancelButtonText="Отменить"
                    confirmButtonText="Продолжить"
                    intent={Intent.WARNING}
                    icon={'warning-sign'}
                    isOpen={this.state.alertIsOpen}
                    onCancel={this.handleAlertCancel}
                    onConfirm={this.handleAlertConfirm}
                >
                    <p>Вы уверены, что хотите <b>{this.state.alertTooltip}</b>? Это действие необратимо.</p>
                </Alert>

            </div>
        );
    }
}