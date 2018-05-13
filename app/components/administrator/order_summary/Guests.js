import React from "react";
import {ClientCategoryCodes, ClientCategoryText} from "../../client/client";
import { Button, Intent, Slider } from "@blueprintjs/core";


const ConfirmClientCategory = ({confirmed, onConfirm, onReject}) => {
    return (
        <div>
        {
            confirmed === null ?
                <div>
                    <Button icon={'confirm'} intent={Intent.SUCCESS} onClick={onConfirm}>{'Подтвердить'}</Button>
                    <Button icon={'delete'} intent={Intent.DANGER} onClick={onReject}>{'Отклонить'}</Button>
                </div> :
                    confirmed ?
                        <p>{'(Подтверждено)'}</p> :
                        <p>{'(Отклонено)'}</p>
        }
        </div>
    );
};


export const Guests = (
    {
        order,
        onConfirm,
        onReject,
        peopleCount,
        onPeopleCountChange,
        onConfirmPeopleCount,
        peopleCountConfirmed    }) => {
    return (
        <div>
            <h3>{'Информация о клиенте'}</h3>
            <table className="pt-html-table">
                <tbody>
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
                        <td>
                            <div className={'inline-cell'}>
                            <p>{ClientCategoryText[order.client.category_id]} </p>
                            {
                                order.client.category_id === ClientCategoryCodes.CompanyWorker ?
                                    <ConfirmClientCategory
                                        confirmed={order.client.category_confirmed}
                                        onConfirm={onConfirm}
                                        onReject={onReject}
                                    /> :
                                    <div/>
                            }
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>{'Количество отдыхающих'}</td>
                        <td>
                            {
                                !peopleCountConfirmed ?
                                    <div>
                                        <Slider
                                            min={0}
                                            max={12}
                                            stepSize={1}
                                            labelStepSize={2}
                                            onChange={onPeopleCountChange}
                                            value={peopleCount}
                                        />
                                        <Button
                                            icon={'confirm'}
                                            intent={Intent.SUCCESS}
                                            text={'Подтвердить'}
                                            onClick={onConfirmPeopleCount}
                                        />
                                    </div>:
                                    <p>{peopleCount}</p>
                            }
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
};
