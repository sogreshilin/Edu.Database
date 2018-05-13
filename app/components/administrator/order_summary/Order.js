import React from "react";
import {OrderStatusText} from "../../order/order";

export const Order = ({ order }) => {
    return (
        <div>
            <h3>{'Информация о заказе №' + order.id}</h3>
            <table className="pt-html-table">
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
                </tbody>
            </table>
        </div>
    )
};