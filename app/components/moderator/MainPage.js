import axios from "axios/index";
import {server} from "../../index";
import React from "react";
import EditHousePrice from "./EditHousePrice";
import {Tab, Tabs} from "@blueprintjs/core";
import EditHouse from "../edit/EditHouse";
import EditService from "./EditService";



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
                    <Tab id={'house'} title={'Дома'} panel={<EditHouse/>}/>
                    <Tab id={'services'} title={'Услуги'} panel={<EditService/>}/>
                    <Tab id={'house_rental'} title={'Цена домов'} panel={<EditHousePrice/>}/>
                </Tabs>
            </div>
        );
    }


}