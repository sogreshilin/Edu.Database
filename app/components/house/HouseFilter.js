import React from 'react';
import { IProps, Icon, Tag, Intent, Card } from '@blueprintjs/core';
import { DateRange, DateRangePicker } from "@blueprintjs/datetime";
import { Select } from "@blueprintjs/select";

import moment from 'moment';
import classNames from "classnames";
import axios from "axios";

const FORMAT = "dddd, LL";

const MomentDate: React.SFC<{ date: Date; format?: string }> = ({ date, format = FORMAT }) => {
    const m = moment(date);
    if (m.isValid()) {
        return <Tag intent={Intent.PRIMARY}>{m.format(format)}</Tag>;
    } else {
        return <Tag minimal={true}>no date</Tag>;
    }
};

const MomentDateRange: React.SFC<{ range: DateRange; format?: string } & IProps> = ({
    className,
    range: [start, end],
    format = FORMAT,
}) => (
    <div className={classNames("docs-date-range", className)}>
        <MomentDate date={start} format={format} />
        <Icon icon="arrow-right" />
        <MomentDate date={end} format={format} />
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
            current_category_id: -1,
            filtered_houses: []
        };

        this.onHouseCategoryChanged = this.onHouseCategoryChanged.bind(this);
    }

    componentDidMount() {
        axios("/api/form")
            .then(result => this.setState(result.data))
            .catch(error => {
                console.error(error)
            })
    }

    onHouseCategoryChanged(event) {
        console.log("house category changed to = " + event.target.value)
        const categoryId = event.target.value
        this.setState({
            current_category_id: categoryId,
            filtered_houses: categoryId != -1 ?
            this.state
                .links[categoryId]
               .map(houseId => this.state.houses[houseId]) : []
        })
    }

    render() {
        return (
            <div className={"houseFilter"}>
                <Card>
                    <DateRangePicker
                        allowSingleDayRange={true}
                        contiguousCalendarMonths={true}
                        minDate={this.state.minDate}
                        maxDate={this.state.maxDate}
                        onChange={(dateRange: DateRange) => this.setState({ dateRange })}
                        shortcuts={false}
                    />

                    <MomentDateRange range={this.state.dateRange} />

                    <select id={"house_category_select"}
                            name={"house_category_select"}
                            onChange={this.onHouseCategoryChanged}
                            >
                        <option key={-1} value={-1}>-- Not Selected --</option>
                        { Object.values(this.state.categories).map(category => <option key={category.id} value={category.id}>{category.name}</option>) }
                    </select>

                </Card>

            </div>
        );
    }
}