import axios from "axios/index";
import React from "react";
import {DatePicker} from "@blueprintjs/datetime";
import {Button} from "@blueprintjs/core";
import {Intent} from "@blueprintjs/core/lib/esm/index";

const date_options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };

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
        this.handleRemoveDate = this.handleRemoveDate.bind(this);
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

    handleRemoveDate(date) {
        axios.post('api/remove/holiday', {
            date: date.toISOString()
        })
            .then(result => this.setState({holidays: result.data.holidays.map(date => new Date(date))}))
            .catch(error => console.log(error));
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
                    onChange={(newDate) => this.handleChanged(newDate)}
                    value={this.state.selectedDate}
                />
                <Button icon={"calendar"} text={"Добавить"} onClick={this.handleAddHoliday}/>
                <table className="pt-html-table">
                    <thead>
                    <tr>
                        <td>№</td>
                        <td>Дата</td>
                        <td>Удалить</td>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.holidays.sort((a, b) => a > b).map((date, index) =>
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{date.toLocaleDateString('ru', date_options)}</td>
                                <td><Button icon={'delete'} onClick={() => this.handleRemoveDate(date)}
                                            text={'Удалить'} intent={Intent.DANGER}/></td>
                            </tr>
                    )
                    }
                    </tbody>
                </table>
            </div>
        )
    }

}