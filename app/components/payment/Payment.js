import React from "react";
import {getFromStorageOrThrow, SessionStorage} from "../Storage";
import {Button, Intent} from "@blueprintjs/core";
import {server} from "../../index";
import axios from "axios/index";
import {Redirect, Route} from "react-router-dom";

const receipt_table_titles = ['№', 'Наименование', 'Цена', 'Количество', 'Стоимость'];

export const ReceiptTable = ({ services }) => {
    return (
        <table className="pt-html-table">
            <thead>
                <tr>
                    {receipt_table_titles.map(title => <td key={title}>{title}</td>)}
                </tr>
            </thead>
            <tbody>
            {services.map((service, index) =>
                    <tr key={service.id}>
                        <td>{index + 1}</td>
                        <td>{service.name}</td>
                        <td>{service.price}</td>
                        <td>{service.amount}</td>
                        <td>{service.price * service.amount}</td>
                    </tr>
                )
            }
            </tbody>
            <tfoot>
                    <tr>
                        <td/>
                        <td/>
                        <td/>
                        <td>Итого</td>
                        <td>
                        {services.reduce((previousValue, currentService) =>
                                previousValue += (currentService.price * currentService.amount), 0)
                        }
                        </td>
                    </tr>
                </tfoot>
        </table>
    )
};

export default class Payment extends React.Component {
    constructor() {
        super();
        this.state = {
            order : {},
            chosenServiceIDs: [],
            isPayed: false,
            redirectToOrder: false,
        };

        this.handlePayClicked = this.handlePayClicked.bind(this);
        this.handleBackToOrder = this.handleBackToOrder.bind(this);
    }

    componentWillMount() {
        const order = JSON.parse(getFromStorageOrThrow('order'));
        const chosenServiceIDs = JSON.parse(getFromStorageOrThrow('chosenServiceIDs'));

        try {
            this.setState({
                order: order,
                chosenServiceIDs: chosenServiceIDs
            });
        } catch (error) {
            console.error(error);
            alert("Failed to initialize components");
        }
    }

    handlePayClicked() {
        console.log('handlePayClicked');
        axios.post(server + '/api/payment', {
            order_id: this.state.order.id,
            service_ids: this.state.chosenServiceIDs
        })
            .then(response => {
                this.setState({
                        order: response.data,
                        isPayed: true,
                    },
                    () => {
                        SessionStorage.put('order', JSON.stringify(this.state.order));
                        alert('Успешная оплата');
                    })
            })
            .catch(error => {
                console.log(error.message);
                console.log(error.response.status);
                console.log(error.response.data);
            })
    }

    handleBackToOrder() {
        console.log('handleBackToOrder');
        this.setState({
            redirectToOrder: true,
        })
    }

    render() {
        const services = Object.values(this.state.order.services)
            .filter(service => this.state.chosenServiceIDs.includes(service.id));
        console.log('this.state.redirectToOrder: ' + this.state.redirectToOrder );
        return (
            <div>
                {
                    this.state.redirectToOrder ? (
                        <Route>
                            <Redirect push to={"/admin/order_summary"} />
                        </Route>
                    ) : (
                        <div>
                            <h3>Оплата</h3>
                            {
                                this.state.isPayed ?
                                    <div>
                                        <Button text={'Вернуться к заказу'} intent={Intent.PRIMARY} onClick={this.handleBackToOrder}/>
                                    </div> :
                                    <div>
                                        <ReceiptTable services={services}/>
                                        <Button text={'Оплатить'} icon={'dollar'} intent={Intent.SUCCESS} onClick={this.handlePayClicked}/>
                                    </div>
                            }
                        </div>
                    )

                }
            </div>
        )
    }
}