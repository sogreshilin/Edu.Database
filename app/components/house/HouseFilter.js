import React from 'react';
import { Card } from '@blueprintjs/core';
import { DateRangeInput } from "@blueprintjs/datetime";
import { Select } from "@blueprintjs/select";

import { Route, Redirect } from 'react-router-dom';

import { SessionStorage, StorageKeys } from "../Storage";

import styles from './house_filter.scss';
import axios from "axios";

const host = "http://localhost:5000";

const dateToTimestamp = (date) => parseInt((date.getTime() / 1000).toFixed(0));

const HouseCard = ({ houseId, categoryName, title, imageUrl, description, onSelect }) => (
    <div className={"house-card"}>
        <section className={'house-card-image-wrapper'}>
            <img src={ "https://cdn.torontolife.com/wp-content/uploads/2017/08/toronto-house-for-sale-53-burnhamthorpe-crescent-1-1200x628.jpg" } alt={ title } width={100} height={100} />
        </section>
        <section className={"house-card-info-section"}>
            <div className={'house-card-info-wrapper'}>
                <h3 className={'house-card-title'}>{ title }</h3>
                <h4 className={'house-card-category'}><span className={'house-category-tag'}>{ categoryName }</span></h4>
                <p className={'house-card-description'}>{ description }</p>
            </div>
            <div className={'house-card-button-wrapper'}>
                <button className={"book-house-button"} onClick={() => onSelect(houseId)} >{"Перейти к заказу"}</button>
            </div>
        </section>
    </div>
);

const LoadingError = ({ message }) => (
    <Card>
        <div className="loading-error-card">
            <h2>{message}</h2>
        </div>
    </Card>
);


export default class HouseFilter extends React.Component {
    constructor() {
        super();
        this.state = {
            showLoadError: false,
            redirectToOrderForm: false,

            minDate: new Date("2018-1-1"),
            maxDate: new Date("2018-12-31"),
            dateRange: [null, null],

            categories: {},
            houses: {},
            links: {},
            freeHousesIds: new Set(),
            currentCategoryId: -1,
            filtered_houses: [],
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
                console.error(error);
                this.setState({
                    showLoadError: true
                })
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
            this.state.showLoadError ? (
                <LoadingError message={"Ой, информация о домиках сейчас недоступна"} />
            ) : (
                <div className={"houseFilter"}>
                    <Card elevation={1}>
                        <h2>Выбор дома отдыха</h2>
                        <div className={"filter-item"}>
                            <h5>Даты запланированного отдыха</h5>
                            <DateRangeInput
                                value={ this.state.priceGenerationRange }
                                formatDate={ date => date.toLocaleDateString("ru") }
                                parseDate={ str => new Date(str) }
                                shortcuts={ false }
                                contiguousCalendarMonths={true}
                                allowSingleDayRange={true}
                                minDate={this.state.minDate}
                                maxDate={this.state.maxDate}
                                onChange={this.onDateRangeChanged}
                            />
                        </div>
                        <div className={"filter-item"}>
                            <h5>Категория дома</h5>
                            <select id={"house_category_select"}
                                    name={"house_category_select"}
                                    onChange={(event) => this.filterHousesForCategory(event.target.value)}
                                    >
                                <option key={-1} value={-1}>-- Не выбрано --</option>
                                { Object.values(this.state.categories).map(category => <option key={category.id} value={category.id}>{category.name}</option>) }
                            </select>
                        </div>

                    </Card>

                    {
                        this.state.filtered_houses.length === 0 ? (
                            <p>На выбранные даты нет свободных домиков :(</p>
                        ) : (
                            <div className={'filter-results'}>
                                <h3>Результаты поиска</h3>
                                {
                                    this.state.filtered_houses.map(house =>
                                        <HouseCard key={house.id}
                                                   houseId={house.id}
                                                   categoryName={this.state.categories[house.category].name}
                                                   title={house.name}
                                                   imageUrl={house.image_url}
                                                   description={house.description}
                                                   onSelect={this.onHouseChosen}
                                        />
                                    )
                                }
                            </div>
                        )
                    }

                </div>
            )
        ));
    }
}
