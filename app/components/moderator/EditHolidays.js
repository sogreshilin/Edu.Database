import axios from "axios/index";
import React from "react";
import {DatePicker} from "@blueprintjs/datetime";
import {Button} from "@blueprintjs/core";

export default class EditHolidays extends React.Component {
    constructor() {
        super();
        this.state = {
            holidays: [], // list of dates
            selectedDate: null,


        };

        this.isHoliday = this.isHoliday.bind(this);
        this.handleChanged = this.handleChanged.bind(this);
        this.handleAddHoliday = this.handleAddHoliday.bind(this);
    }

    componentDidMount() {
        axios.get('api/holidays')
            .then(result => {
                    this.setState({holidays: result.data.holidays.map(date => new Date(date))
                })
            })
            .catch(error => console.log(error));
    }

    isHoliday(date) {
        return this.state.holidays.includes(date)
    }

    handleChanged(date) {
        this.setState({selectedDate: date})
    }

    handleAddHoliday() {
        axios.post('api/add/holiday', {
            date: this.state.selectedDate.toISOString()
        })
            .then(result => this.setState({holidays: result.data.holidays.map(date => new Date(date))}))
            .catch(error => console.log(error));
    }

    render() {
        return (
            <div>
                <DatePicker
                    modifiers={this.isHoliday}
                    onChange={(newDate) => this.handleChanged(newDate)}
                    value={this.state.selectedDate}
                />
                <Button icon={"calendar"} text={"Добавить"} onClick={this.handleAddHoliday}/>
            </div>
        )
    }

}