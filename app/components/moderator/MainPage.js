import axios from "axios/index";
import {server} from "../../index";
import React from "react";
import EditHousePrice from "./EditHousePrice";
import {Tab, Tabs} from "@blueprintjs/core";
import EditService from "./EditService";
import EditCategory from "./EditCategory";
import EditHolidays from "./EditHolidays";



export default class ModeratorMainPage extends React.Component {
    constructor() {
        super();

        this.state = {

        };

        this.handleTabChanged = this.handleTabChanged.bind(this);

    }

    handleTabChanged(id) {
        this.setState({active_tab_id: id});
    }

    render() {
        return (
            <div>
                <Tabs onChange={this.handleTabChanged}>
                    <Tab id={'house'} title={'Категории домов'} panel={<EditCategory/>}/>
                    <Tab id={'services'} title={'Услуги'} panel={<EditService/>}/>
                    <Tab id={'house_rental'} title={'Цена домов'} panel={<EditHousePrice/>}/>
                    <Tab id={'holidays'} title={'Праздники'} panel={<EditHolidays/>}/>
                </Tabs>
            </div>
        );
    }


}