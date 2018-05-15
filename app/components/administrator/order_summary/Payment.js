import React from "react";
import { Dialog, Button, Intent, Checkbox } from "@blueprintjs/core";
import {ClientCategoryCodes} from "../../client/client";
import {ReceiptTable} from "../../payment/Payment";

const payment_date_options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };

const service_table_titles = ['Выбрать', '№', 'Наименование услуги', 'Цена', 'Количество', 'Стоимость'];

const PaymentDetails = ({isOpen, onClose, payment_id, payments, services}) => {
    const payment = payments.filter(payment => payment_id === payment.id)[0];
    return (
        <Dialog icon="inbox" isOpen={isOpen} onClose={onClose} title="Детали платежа">
            <div className="pt-dialog-body">
                <p>{"Время внесения оплаты: " +
                    new Date(payment.date).toLocaleDateString('ru', payment_date_options)}</p>
                <p>{"Сумма платежа: " + payment.total }</p>
                <ReceiptTable services={services.filter(service => payment.order_service_ids.includes(service.id))}/>
            </div>
            <div className="pt-dialog-footer">
                <div className="pt-dialog-footer-actions">
                    <Button intent={Intent.PRIMARY} onClick={onClose} text="Вернуться"/>
                </div>
            </div>
        </Dialog>
    );
};

const Payments = ({payments, onShowPaymentDetails}) => {
    return (
        <table className="pt-html-table">
            <thead>
                <tr>
                    <td>№</td>
                    <td>Дата платежа</td>
                    <td>Сумма</td>
                </tr>
            </thead>
            <tbody>
            {payments.map((payment, index) =>
                <tr key={payment.id} onClick={() => onShowPaymentDetails(payment.id)}>
                    <td>{index + 1}</td>
                    <td>{new Date(payment.date).toLocaleDateString('ru')}</td>
                    <td>{payment.total}</td>
                </tr>)
            }
            </tbody>
        </table>
    )
};

const PaymentAwaiting = ({services, chosenServiceIDs, onServiceChecked}) => {
    return (
        <div>
            <table className="pt-html-table">
                <thead>
                    <tr>{service_table_titles.map(title => <td key={title}>{title}</td>)}</tr>
                </thead>

                <tbody>
                {services.map((service, index) =>
                    <tr key={service.id}>
                        <td>
                            <Checkbox checked={chosenServiceIDs.includes(service.id)}
                                      onChange={() => onServiceChecked(service.id)} />
                        </td>

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
        </div>

        )
};

export const Payment = (
    {
        order,
        onShowPaymentDetails,
        onHidePaymentDetails,
        isPaymentDetailsOpen,
        onPendingServiceChanged,
        chosenServiceIDs,
        onProceedPayment,
        paymentID

    }) => {
        const payment_awaiting_services = Object.values(order.services).filter(service => !service.is_paid);
        const payments = Object.values(order.payments);
    return (
        <div>
            {
                payments.length > 0 ?
                    <div>
                        <h3>Внесенные платежи</h3>
                        <Payments payments={payments} onShowPaymentDetails={onShowPaymentDetails}/>
                    </div> :
                    <p>Внесенных платежей нет</p>
            }

            {
                payment_awaiting_services.length > 0 ?
                    <div>
                        <h3>Ожидает оплаты</h3>
                        <PaymentAwaiting services={payment_awaiting_services}
                                 chosenServiceIDs={chosenServiceIDs}
                                 onServiceChecked={onPendingServiceChanged}

                        />
                        <Button text={'Перейти к оплате'}
                                icon={'dollar'}
                                onClick={onProceedPayment}
                                disabled={chosenServiceIDs.length <= 0}/>
                    </div> :
                    <p>Все оплачено</p>
            }

            {
                isPaymentDetailsOpen ?
                    <PaymentDetails isOpen={isPaymentDetailsOpen}
                                    onClose={onHidePaymentDetails}
                                    payments={order.payments}
                                    payment_id={paymentID}
                                    services={order.services}/> :
                    <div/>
            }
        </div>
    )
};

