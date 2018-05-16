import React  from 'react';

import { date_time_options as dateOptions } from "../administrator/order_summary/OrderSummary";
import { OrderStatusCodes, OrderStatusText } from "./order";

const toLocaleDateString = (date) => new Date(date).toLocaleDateString('ru', dateOptions);

const DetailedOrderCard = ({ order }) => (
    <table className={'order-card'}>
        <tbody>
            <tr>
                <td className={'subtitle'} colSpan="2">
                    {'Информация о заказе'}
                </td>
            </tr>
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
                <td className={'subtitle'} colSpan="2">
                    {'Информация о клиенте'}
                </td>
            </tr>
            <tr>
                <td>{'Фамилия'}</td>
                <td>{order.client.last_name}</td>
            </tr>
            <tr>
                <td>{'Имя'}</td>
                <td>{order.client.first_name}</td>
            </tr>
            <tr>
                <td>{'Отчество'}</td>
                <td>{order.client.middle_name}</td>
            </tr>
            <tr>
                <td>{'Категория'}</td>
                <td>{ order.client.category_name }</td>
            </tr>
            <tr>
                <td>{'Телефон'}</td>
                <td>{ order.client.phone }</td>
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
                <td>{toLocaleDateString(order.time.check_in_expected)}</td>
            </tr>
            <tr>
                <td className={'subtitle'} colSpan="2">
                    {'Выселение'}
                </td>
            </tr>
            <tr>
                <td>{'Ожидаемое время'}</td>
                <td>{toLocaleDateString(order.time.check_out_expected)}</td>
            </tr>
        </tbody>
    </table>
);

export default DetailedOrderCard;
