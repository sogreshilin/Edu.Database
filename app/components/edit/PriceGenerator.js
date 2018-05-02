import React from "react";
import axios from "axios/index";
import {server} from '../../index'
import { DateRange, DateRangePicker, DateRangeInput } from "@blueprintjs/datetime";
import { Button, Card, Elevation, Label } from "@blueprintjs/core";

function addDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

function getAllWeekendsInRange(range) {
    let currentDate = new Date(range[0]);
    let days = [];

    while (currentDate <= range[1]) {
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
            days.push(new Date(currentDate));
        }
        currentDate = addDay(currentDate);
    }

    if (days.length === 0) {
        return [];
    }

    let rv = [];

    let i = 0;
    if (days[i].getDay() === 0) {
        rv.push([days[i], days[i]]);
        i += 1;
    }

    while (i < days.length - 1) {
        rv.push([days[i], days[i + 1]]);
        i += 2;
    }

    if (i === days.length) {
        return rv;
    }

    rv.push([days[days.length - 1], days[days.length - 1]]);

    return rv;
}


export default class PriceGenerator extends React.Component {
    constructor() {
        super();

        this.state = {
            holidayClientCategoryHouseCategoryPrice: {},
            weekendClientCategoryHouseCategoryPrice: {},
            weekdayClientCategoryHouseCategoryPrice: {},
            clientCategories: {},
            houseCategories: {},
            priceGenerationRange: [new Date(new Date().getFullYear(), 0, 1), new Date(new Date().getFullYear(), 11, 31)],

            holidaysClientCategory: null,
            holidaysDates: [],
            holidayPickedRange: [null, null],
            holidaySelectedDate: null,

            weekendsClientCategory: null,
            weekendsDates: [],
            weekendPickedRange: [null, null],
            weekendSelectedDate: null,

            weekdaysClientCategory: null,
            weekdaysDates: [],
            weekdayPickedRange: [null, null],
            weekdaySelectedDate: null
        };

        this.handleSavePrices = this.handleSavePrices.bind(this);
        this.handleAddHolidayDateRange = this.handleAddHolidayDateRange.bind(this);
        this.handleDeleteHolidayDateRange = this.handleDeleteHolidayDateRange.bind(this);

        this.handleAddWeekendDateRange = this.handleAddWeekendDateRange.bind(this);
        this.handleDeleteWeekendDateRange = this.handleDeleteWeekendDateRange.bind(this);

        this.handleAddWeekdayDateRange = this.handleAddWeekdayDateRange.bind(this);
        this.handleDeleteWeekdayDateRange = this.handleDeleteWeekdayDateRange.bind(this);
    }

    componentDidMount() {
        axios
            .get(server + '/api/houses')
            .then(result => this.setState({
                houseCategories: result.data.categories
            }))
            .catch(error => {
                console.error(error)
            });
        axios
            .get(server + '/api/client_categories')
            .then(result => this.setState({
                clientCategories: result.data,
                holidaysClientCategory: Object.values(result.data)[0].name,
                weekendsClientCategory: Object.values(result.data)[0].name,
                weekdaysClientCategory: Object.values(result.data)[0].name
            }))
            .catch(error => {
                console.error(error)
            })
    }

    handleAddHolidayDateRange() {
        const range = this.state.holidayPickedRange;
        console.log("range: " + range);
        if (range[0] !== null && range[1] !== null &&
            !this.state.holidaysDates.includes(range)) {
                this.setState(prevState => ({
                    holidaysDates: [...prevState.holidaysDates, range]
                }));
        }
    }

    handleAddWeekendDateRange() {
        const range = this.state.weekendPickedRange;
        console.log("range: " + range);
        if (range[0] !== null && range[1] !== null &&
            !this.state.weekendsDates.includes(range)) {
                this.setState(prevState => ({
                    weekendsDates: [...prevState.weekendsDates, range]
                }));
        }
    }

    handleAddWeekdayDateRange() {
        const range = this.state.weekdayPickedRange;
        console.log("range: " + range);
        if (range[0] !== null && range[1] !== null &&
            !this.state.weekdaysDates.includes(range)) {
                this.setState(prevState => ({
                    weekdaysDates: [...prevState.weekdaysDates, range]
                }));
        }
    }

    handleDeleteHolidayDateRange() {
        const date = this.state.holidaySelectedDate;
        const index = this.state.holidaysDates.length === 1 ? 0 : this.state.holidaysDates
            .map(range => range[0].toLocaleDateString("ru") + " - " + range[1].toLocaleDateString("ru"))
            .indexOf(date);
        let updatedHolidays = this.state.holidaysDates;
        if (index !== -1) {
            updatedHolidays.splice(index, 1);
        }
        this.setState({ holidaysDates: updatedHolidays });
    }

    handleDeleteWeekendDateRange() {
        const date = this.state.weekendSelectedDate;
        const index = this.state.weekendsDates.length === 1 ? 0 : this.state.weekendsDates
            .map(range => range[0].toLocaleDateString("ru") + " - " + range[1].toLocaleDateString("ru"))
            .indexOf(date);
        let updatedWeekends = this.state.weekendsDates;
        if (index !== -1) {
            updatedWeekends.splice(index, 1);
        }
        this.setState({ weekendsDates: updatedWeekends });
    }

    handleDeleteWeekdayDateRange() {
        const date = this.state.weekdaySelectedDate;
        const index = this.state.weekdaysDates.length === 1 ? 0 : this.state.weekdaysDates
            .map(range => range[0].toLocaleDateString("ru") + " - " + range[1].toLocaleDateString("ru"))
            .indexOf(date);
        let updatedWeekdays = this.state.weekdaysDates;
        if (index !== -1) {
            updatedWeekdays.splice(index, 1);
        }
        this.setState({ weekdaysDates: updatedWeekdays });
    }

    handleSavePrices() {
        axios.post(server + "/api/edit/prices", {
            holiday: {
                dates: this.state.holidaysDates,
                prices: this.state.holidayClientCategoryHouseCategoryPrice
            },
            weekend: {
                dates: this.state.weekendsDates,
                prices: this.state.weekendClientCategoryHouseCategoryPrice
            },
            weekday: {
                dates: this.state.weekdaysDates,
                prices: this.state.weekdayClientCategoryHouseCategoryPrice
            }
        })
            .then(() => alert('Цены успешно сгенерированы и сохранены в базу данных'))
            .catch(error => {
                console.log(error.message);
                console.log(error.response.status);
                console.log(error.response.data);
            })
    }

    render() {
        console.log(this.state.priceGenerationRange)
        return (
            <div className={'edit-price'}>
                <h1>Генерация цен</h1>
                <div>
                    <Card elevation={Elevation.TWO}>
                        <p>На период</p>
                        <DateRangeInput
                            value={ this.state.priceGenerationRange }
                            onChange={ range => this.setState({ priceGenerationRange: range })}
                            formatDate={ date => date.toLocaleDateString("ru") }
                            parseDate={ str => new Date(str) }
                            shortcuts={ false }
                        />
                    </Card>
                </div>
                <p/>

                {/* holiday */}
                <div>
                    <Card elevation={Elevation.TWO}>
                        <h4>Праздничные дни</h4>
                        <p>Выберите период</p>
                        <DateRangePicker
                            allowSingleDayRange={true}
                            contiguousCalendarMonths={true}
                            minDate={this.state.priceGenerationRange[0]}
                            maxDate={this.state.priceGenerationRange[1]}
                            onChange={pickedRange => this.setState({ holidayPickedRange: pickedRange })}
                            shortcuts={false}
                        />

                        <div>
                            <button onClick={this.handleAddHolidayDateRange}>{'Добавить дату'}</button>
                            <button onClick={this.handleDeleteHolidayDateRange}>{'Удалить дату'}</button>
                        </div>

                        <select size="10"
                            onChange={ (event) => this.setState({holidaySelectedDate: event.target.value}) }>
                            { Object.values(this.state.holidaysDates)
                                .map((range, index) => <option key={index}>{range[0].toLocaleDateString("ru")} - {range[1].toLocaleDateString("ru")}</option>) }
                        </select>

                        { Object.values(this.state.clientCategories).map((clientCategory, index) => (
                            <div key={index}>
                                <Card>
                                    {clientCategory.name}
                                    <div>
                                        { Object.values(this.state.houseCategories).map((houseCategory, index) => (
                                           <div key={index}>
                                            <Label text={houseCategory.name}>
                                                <input type='number' required className={"pt-input"} placeholder={'Цена'}
                                                       onChange={(event) => {
                                                           let price = parseInt(event.target.value);
                                                           this.setState((prevState, props) => {
                                                               holidayClientCategoryHouseCategoryPrice: prevState.holidayClientCategoryHouseCategoryPrice[clientCategory.id + "_" + houseCategory.id] = price
                                                           })
                                                       }}/>
                                            </Label>
                                           </div>
                                        )) }
                                    </div>
                                </Card>
                            </div>
                            ))
                        }
                    </Card>
                </div>
                <p/>



                 {/*weekend */}
                <div>
                    <Card elevation={Elevation.TWO}>
                        <h4>Выходные дни</h4>
                        <p>Выберите период</p>
                        <DateRangePicker
                            allowSingleDayRange={true}
                            contiguousCalendarMonths={true}
                            minDate={this.state.priceGenerationRange[0]}
                            maxDate={this.state.priceGenerationRange[1]}
                            onChange={pickedRange => this.setState({ weekendPickedRange: pickedRange })}
                            shortcuts={false}
                        />
                        <div>
                            <button onClick={this.handleAddWeekendDateRange}>{'Добавить дату'}</button>
                            <button onClick={this.handleDeleteWeekendDateRange}>{'Удалить дату'}</button>
                            <button onClick={() => {this.setState({weekendsDates: getAllWeekendsInRange(this.state.priceGenerationRange)})}}>{'Установить все субботы и воскресения'}</button>
                        </div>

                        <select size="10"
                             onChange={ (event) => this.setState({weekendSelectedDate: event.target.value}) }>
                            { Object.values(this.state.weekendsDates)
                                .map((range, index) => <option key={index}>{range[0].toLocaleDateString("ru")} - {range[1].toLocaleDateString("ru")}</option>) }
                        </select>

                        { Object.values(this.state.clientCategories).map((clientCategory, index) => (
                            <div key={index}>
                                <Card>
                                    {clientCategory.name}
                                    <div>
                                        { Object.values(this.state.houseCategories).map((houseCategory, index) => (
                                           <div key={index}>
                                            <Label text={houseCategory.name}>
                                                <input type='number' required className={"pt-input"} placeholder={'Цена'}
                                                       onChange={(event) => {
                                                           let price = parseInt(event.target.value);
                                                           this.setState((prevState, props) => {
                                                               weekendClientCategoryHouseCategoryPrice: prevState.weekendClientCategoryHouseCategoryPrice[clientCategory.id + "_" + houseCategory.id] = price
                                                           })
                                                       }}/>
                                            </Label>
                                           </div>
                                        )) }
                                    </div>
                                </Card>
                            </div>
                            ))
                        }
                    </Card>
                </div>


                <p/>
                {/*weekday*/}
                <div>
                    <Card elevation={Elevation.TWO}>
                        <h4>Будние дни</h4>
                        <p>Выберите период</p>
                        <DateRangePicker
                            allowSingleDayRange={true}
                            contiguousCalendarMonths={true}
                            minDate={this.state.priceGenerationRange[0]}
                            maxDate={this.state.priceGenerationRange[1]}
                            onChange={pickedRange => this.setState({ weekdayPickedRange: pickedRange })}
                            shortcuts={false}
                        />
                        <div>
                            <button onClick={this.handleAddWeekdayDateRange}>{'Добавить дату'}</button>
                            <button onClick={this.handleDeleteWeekdayDateRange}>{'Удалить дату'}</button>
                            <button onClick={() => this.setState({weekdaysDates: [this.state.priceGenerationRange]})}>{'Установить все дни'}</button>
                        </div>

                        <select size="10"
                             onChange={ (event) => this.setState({weekdaySelectedDate: event.target.value}) }>
                            { Object.values(this.state.weekdaysDates)
                                .map((range, index) => <option key={index}>{range[0].toLocaleDateString("ru")} - {range[1].toLocaleDateString("ru")}</option>) }
                        </select>

                        { Object.values(this.state.clientCategories).map((clientCategory, index) => (
                            <div key={index}>
                                <Card>
                                    {clientCategory.name}
                                    <div>
                                        { Object.values(this.state.houseCategories).map((houseCategory, index) => (
                                           <div key={index}>
                                            <Label text={houseCategory.name}>
                                                <input type='number' required className={"pt-input"} placeholder={'Цена'}
                                                       onChange={(event) => {
                                                          let price = parseInt(event.target.value);
                                                           this.setState((prevState, props) => {
                                                               weekdayClientCategoryHouseCategoryPrice: prevState.weekdayClientCategoryHouseCategoryPrice[clientCategory.id + "_" + houseCategory.id] = price
                                                           })
                                                       }}/>
                                            </Label>
                                           </div>
                                        )) }
                                    </div>
                                </Card>
                            </div>
                            ))
                        }
                    </Card>
                </div>

                <div>
                    <button onClick={this.handleSavePrices}>Сохранить</button>
                </div>
            </div>
        )
    }
}