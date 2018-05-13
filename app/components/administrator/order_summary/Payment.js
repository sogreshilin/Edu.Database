import React from "react";
import {ClientCategoryCodes} from "../../client/client";

export const Payment = ({order}) => {
    return (
        <div>
            <h3>Оплата</h3>
            <table className="pt-html-table">
                <tbody>
                    <tr>
                        <td>{'Оплата дома'}</td>
                        <td className={'todo'}>{'Онлайн или Кнопка Подтвердить Оплату'}</td>
                    </tr>
                    {
                    (order.client.category_id === ClientCategoryCodes.CompanyWorker
                    && order.client.category_confirmed === false) ?
                    <tr>
                        <td>{'Категория не подтверждена'}</td>
                        <td className={'todo'}>{'Онлайн или Кнопка Подтвердить Оплату'}</td>
                    </tr> : <tr/>
                    }
                </tbody>
            </table>
        </div>
    )
};

