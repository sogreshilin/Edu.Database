import React from 'react';
import { IProps, Icon, Tag, Intent, Card } from '@blueprintjs/core';
import { DateRange, DateRangePicker } from "@blueprintjs/datetime";
import { Select } from "@blueprintjs/select";

import { Route, Redirect } from 'react-router-dom';

import { SessionStorage, StorageKeys } from "../Storage";

import moment from 'moment';
import classNames from "classnames";
import axios from "axios";

const FORMAT = "dddd, LL";

// const MomentDate: React.SFC<{ date: Date; format?: string }> = ({ date, format = FORMAT }) => {
//     const m = moment(date);
//     if (m.isValid()) {
//         return <Tag intent={Intent.PRIMARY}>{m.format(format)}</Tag>;
//     } else {
//         return <Tag minimal={true}>no date</Tag>;
//     }
// };
//
// const MomentDateRange: React.SFC<{ range: DateRange; format?: string } & IProps> = ({
//     className,
//     range: [start, end],
//     format = FORMAT,
// }) => (
//     <div className={classNames("docs-date-range", className)}>
//         <MomentDate date={start} format={format} />
//         <Icon icon="arrow-right" />
//         <MomentDate date={end} format={format} />
//     </div>
// );

const host = "http://localhost:5000";

const dateToTimestamp = (date) => parseInt((date.getTime() / 1000).toFixed(0));

const HouseCard = ({ houseId, categoryName, title, imageUrl, description, onSelect }) => (
    <div>
        <section>
            <div>
                <img src={ imageUrl } alt={ title } width={100} height={100} />
            </div>
            <div>
                <h3>{ title }</h3>
                <h4>{ categoryName }</h4>
                <p>{ description }</p>
            </div>
        </section>
        <section>
            <button onClick={() => onSelect(houseId)} >{"Перейти к заказу"}</button>
        </section>
    </div>
);


export default class HouseFilter extends React.Component {
    constructor() {
        super();
        this.state = {
            minDate: new Date("2018-1-1"),
            maxDate: new Date("2018-12-31"),
            dateRange: [null, null],

            categories: {},
            houses: {},
            links: {},
            freeHousesIds: new Set(),
            currentCategoryId: -1,
            filtered_houses: [],
            redirectToOrderForm: false
        };

        this.filterHousesForCategory = this.filterHousesForCategory.bind(this);
        this.onHouseChosen = this.onHouseChosen.bind(this);
        this.onDateRangeChanged = this.onDateRangeChanged.bind(this);

        this.freeHousesRequestCancelToken = axios.CancelToken.source();
    }

    componentDidMount() {
        axios.get(`${host}/api/houses`)
            .then(result => this.setState(result.data))
            .catch(error => {
                console.error(error)
            })
    }

    onDateRangeChanged(dateRange) {
        const [rangeStart, rangeEnd] = dateRange;

        if (rangeStart === null || rangeEnd === null) {
            return;
        }

        // this.freeHousesRequestCancelToken.cancel();

        axios.post(`${host}/api/free_houses`, {
            from_date: dateToTimestamp(rangeStart),
            to_date: dateToTimestamp(rangeEnd)
        })
            .then(({ data }) => {
                this.setState({
                    freeHousesIds: new Set(data.houses),
                    dateRange: [rangeStart, rangeEnd]
                }, () => this.filterHousesForCategory(this.state.currentCategoryId))
            })
            .catch(error => {
                console.log(error)
            });
        // TODO: add "loading" spinner
    }

    filterHousesForCategory(categoryIdValue) {
        const categoryId = Number.parseInt(categoryIdValue);

        this.setState({
            currentCategoryId: categoryId,
            filtered_houses: categoryId !== -1 ?
                this.state
                    .links[categoryId]
                    .filter(houseId => this.state.freeHousesIds.has(houseId))
                    .map(houseId => this.state.houses[houseId]) : []
        })
    }

    onHouseChosen(houseId) {
        const house = this.state.houses[houseId];


        console.log(this.state.dateRange);

        SessionStorage.put(StorageKeys.HouseId(), houseId);
        SessionStorage.put(StorageKeys.HouseName(), house.name);
        SessionStorage.put(StorageKeys.CategoryId(), house.category);
        SessionStorage.put(StorageKeys.CategoryName(), this.state.categories[house.category].name);
        SessionStorage.put(StorageKeys.FromTimestamp(), dateToTimestamp(this.state.dateRange[0]));
        SessionStorage.put(StorageKeys.ToTimestamp(), dateToTimestamp(this.state.dateRange[1]));

        this.setState({
            redirectToOrderForm: true
        })
    }

    render() {
        return (
            this.state.redirectToOrderForm ? (
                <Route>
                    <Redirect push to="/react/order" />
                </Route>
                ) : (

            <div className={"houseFilter"}>
                <Card>
                    <DateRangePicker
                        allowSingleDayRange={true}
                        contiguousCalendarMonths={true}
                        minDate={this.state.minDate}
                        maxDate={this.state.maxDate}
                        onChange={this.onDateRangeChanged}
                        shortcuts={false}
                    />

                    {/*<MomentDateRange range={this.state.dateRange} />*/}

                    <select id={"house_category_select"}
                            name={"house_category_select"}
                            onChange={(event) => this.filterHousesForCategory(event.target.value)}
                            >
                        <option key={-1} value={-1}>-- Not Selected --</option>
                        { Object.values(this.state.categories).map(category => <option key={category.id} value={category.id}>{category.name}</option>) }
                    </select>

                    <select id={"house_select"}
                            name={"house_select"}
                            disabled={this.state.currentCategoryId === -1}>
                        <option value={-1}>-- Not Selected --</option>
                        { this.state.filtered_houses.map(house => <option value={house.id}>{house.name}</option>) }
                    </select>
                </Card>

                <Card>
                    {
                        this.state.filtered_houses.map(house =>
                            <HouseCard houseId={house.id}
                                       categoryName={this.state.categories[house.category].name}
                                       title={house.name}
                                       imageUrl={house.image_url}
                                       description={house.description}
                                       onSelect={this.onHouseChosen}
                            />
                        )
                    }
                </Card>

            </div>
            )
        );
    }
}