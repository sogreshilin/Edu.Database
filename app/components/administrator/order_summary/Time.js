import React from "react";
import { Classes, Intent, Slider, Button } from "@blueprintjs/core";

export const Time = (
    {
        from_date_expected,
        from_date_actual,
        to_date_expected,
        to_date_actual,
        onCheckIn,
        onCheckOut    }) => {
    return (
        <div>
            <h3>{'Заселение и выселение'}</h3>
            <table className="pt-html-table">
                <tbody>
                    <tr>
                        <td>{'Ожидаемое время заселения'}</td>
                        <td>{from_date_expected}</td>
                    </tr>
                    <tr>
                        <td>{'Фактическое время заселения'}</td>
                        <td>
                            <div className={'inline-cell'}>
                            {
                                from_date_actual ||
                                <Button icon={'time'}
                                        intent={Intent.SUCCESS}
                                        onClick={onCheckIn}
                                        text={'Сейчас'}
                                />
                            }
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>{'Ожидаемое время выселения'}</td>
                        <td>{to_date_expected}</td>
                    </tr>
                    <tr>
                        <td>{'Фактическое время выселения'}</td>
                        <td>
                            <div className={'inline-cell'}>
                            {
                                to_date_actual ||
                                <Button icon={'time'}
                                        intent={Intent.SUCCESS}
                                        onClick={onCheckOut}
                                        text={'Сейчас'}
                                />
                            }
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
};
