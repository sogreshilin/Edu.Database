import React from 'react';

import { Classes, Card, NumericInput, Button, Tooltip } from '@blueprintjs/core';

import styles from './order.scss';

const GeneralOrderInformation = ({ houseCategory, houseNumber, dateFrom, dateTo }) => (
    <div className={"general-order-info"}>
        <h3>Общая информация о заказе</h3>
        <p>Категория дома отдыха: {houseCategory}</p>
        <p>Номер дома: {houseNumber}</p>
        <p>Время пребывания: {dateFrom.toDateString()} -- {dateTo.toDateString()}</p>
    </div>
);

const getOrElse = (value, other) => value === undefined ? other : value;


const servicesList = [
    {
        id: 1,
        title: "Name 1",
        description: "The very best description",
        price: 1000,
    },
    {
        id: 2,
        title: "Name 2",
        description: "Yeaaaah",
        price: 234,
    },
];

export default class OrderFinalization extends React.Component {

    constructor() {
        super();
        this.state = {
            orderedItemsCounters: new Map()
        };

        this.minItemsCount = 0;
        this.maxItemsCount = 10;

        this.counters = new Map();

        this.onAddExtra = this.onAddExtra.bind(this);
        this.onRemoveExtra = this.onRemoveExtra.bind(this);
        this.onItemValueChanged = this.onItemValueChanged.bind(this);
    }

    loadFromServer() {
        const values = {};
        const itemsCounters = new Map();
        Object.keys(values).forEach(key => {
            itemsCounters.set(key, 0);
        });

        this.setState({
            orderedItemsCounters: itemsCounters
        });
    }

    onAddExtra(itemId) {
        const currentValue = getOrElse(this.counters.get(itemId), this.minItemsCount);

        if (currentValue === this.maxItemsCount) {
            return;
        }

        const finalValue = currentValue + 1;
        this.onItemValueChanged(itemId, finalValue);
    }

    onRemoveExtra(itemId) {
        const currentValue = getOrElse(this.counters.get(itemId), this.minItemsCount);

        if (currentValue === this.minItemsCount) {
            return;
        }

        const finalValue = currentValue - 1;
        this.onItemValueChanged(itemId, finalValue);
    }

    onItemValueChanged(itemId, counterValue) {
        console.log(counterValue);
        const clampValue = (value) => {
            if (value < this.minItemsCount || Number.isNaN(counterValue)) {
                return this.minItemsCount
            } else if (value > this.maxItemsCount) {
                return this.maxItemsCount
            } else {
                return value;
            }
        };

        const finalValue = clampValue(counterValue);
        this.counters.set(itemId, finalValue);
        console.log(`Item: ${itemId}. Count: ${finalValue}`);
        this.forceUpdate();
    }

    render() {
        return (
            <div className={"order-finalization"}>
                <Card>
                    <GeneralOrderInformation houseCategory={"VIP"}
                                             houseNumber={123}
                                             dateFrom={new Date(Date.now())}
                                             dateTo={new Date(Date.now())}
                    />
                </Card>
                <Card>
                    <div className={"extra-services"}>
                        <h3>Дополнительные услуги</h3>
                        {
                            servicesList.map(item =>
                                <div key={item.id} className={"extraServicesItem"}>
                                    <Tooltip className={Classes.TOOLTIP_INDICATOR} content={item.description}>
                                        <div>{item.title}</div>
                                    </Tooltip>
                                    <div>{item.price}&#x20bd;</div>
                                    <div>
                                        <Button icon={"remove"}
                                                onClick={() => this.onRemoveExtra(item.id)} />
                                        <NumericInput min={this.minItemsCount}
                                                      max={this.maxItemsCount}
                                                      value={getOrElse(this.counters.get(item.id), this.minItemsCount)}
                                                      onValueChange={(numberValue, _) => this.onItemValueChanged(item.id, numberValue)} />
                                        <Button icon={"add"}
                                                onClick={() => this.onAddExtra(item.id)} />
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </Card>
            </div>
        );
    }

}