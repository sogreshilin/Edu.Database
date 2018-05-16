import React from "react";
import axios from "axios/index";
import {server} from "../../index";
import {ClientCategoryCodes, ClientCategoryText} from "../client/client";
import {Tab, Tabs, NumericInput, Classes, Button, Intent, Spinner} from "@blueprintjs/core";
import EditHouse from "../edit/EditHouse";

const DateType = {
    1: 'Праздники',
    2: 'Выходные',
    3: 'Будние'
};

function getPrice(house_rental, date_type, house_category, client_category) {
    const filtered = house_rental.filter(e =>
        e.client_category_id == client_category &&
        e.date_type == date_type &&
        e.house_category_id == house_category);
    if (filtered.length > 0) {
        return filtered[0].price;
    }
    return 0;
}

function setPrice(house_rental, date_type, house_category, client_category, value) {
    const filtered = house_rental.filter(e =>
        e.client_category_id == client_category &&
        e.date_type == date_type &&
        e.house_category_id == house_category);
    if (filtered.length > 0) {
        filtered[0].price = value;
    }
    return house_rental;
}

const Panel = ({house_rental, house_categories, date_type, onPriceChanged}) => {
    return (
        <table className="pt-html-table">
            <thead>
            <tr>
                <td>Категория дома</td>
                {Object.values(ClientCategoryText).map(name => <td key={name}>{name}</td>)}
            </tr>
            </thead>
            <tbody>
            {
                house_categories.map(house_category =>
                    <tr key={house_category.id}>
                        <td>{house_category.name}</td>
                        <td>
                            <NumericInput
                                className={Classes.FORM_CONTENT}
                                fill={true}
                                majorStepSize={200}
                                stepSize={100}
                                min={0}
                                onValueChange={value => onPriceChanged(date_type, house_category.id, ClientCategoryCodes.CompanyWorker, value)}
                                value={getPrice(house_rental, date_type, house_category.id, ClientCategoryCodes.CompanyWorker)}
                            />
                        </td>
                        <td>
                            <NumericInput
                                className={Classes.FORM_CONTENT}
                                fill={true}
                                majorStepSize={200}
                                stepSize={100}
                                min={0}
                                onValueChange={value => onPriceChanged(date_type, house_category.id, ClientCategoryCodes.NonCompanyWorker, value)}
                                value={getPrice(house_rental, date_type, house_category.id, ClientCategoryCodes.NonCompanyWorker)}
                            />
                        </td>
                    </tr>
                )
            }
            </tbody>
        </table>
    )
};

const EditHouseRental = ({house_rental, house_categories, onPriceChanged, handleSaveData, uploading, handleTabChanged}) => {
    return (
        <div>
            <Tabs
                onChange={handleTabChanged}
                vertical={true}
            >
            {
                Object.keys(DateType).map(index =>
                    <Tab
                        key={index}
                        id={DateType[index]}
                        title={DateType[index]}
                        panel={<Panel date_type={index}
                                       house_rental={house_rental}
                                       house_categories={house_categories}
                                       onPriceChanged={onPriceChanged}
                                />}
                    />
                )
            }
            </Tabs>
            <Button intent={Intent.PRIMARY} icon={'document-share'} onClick={handleSaveData} text={'Сохранить'}/>
            {
                uploading ? <Spinner small intent={Intent.PRIMARY}/> : <div/>
            }
        </div>
    );
};

export default class EditHousePrice extends React.Component {
    constructor() {
        super();

        this.state = {
            house_categories: [],
            house_rental: [],
            changed_prices: {},
            uploading: false,
            active_house_rental_tab_id: DateType[1],
        };

        this.handleDateTypeTabChanged = this.handleDateTypeTabChanged.bind(this);
        this.onPriceChanged = this.onPriceChanged.bind(this);
        this.handleSaveHouseRental = this.handleSaveHouseRental.bind(this);
        this.handleTabChanged = this.handleTabChanged.bind(this);

    }

    componentDidMount() {
        axios.get(server + '/api/house_categories')
            .then(house_categories => {
                this.setState({house_categories: house_categories.data});

                axios.get(server + '/api/house_rental')
                    .then(house_rental => this.setState({
                        house_rental: house_rental.data,
                    }))
                    .catch(error => {
                        console.error(error)
                    });
            })
            .catch(error => {
                console.error(error);
            });
    }

    handleDateTypeTabChanged(id) {
        this.setState({active_house_rental_tab_id: id});
    }

    handleTabChanged(id) {
        this.setState({active_tab_id: id});
    }

    onPriceChanged(date_type, house_category, client_category, price) {
        let copy_prices = JSON.parse(JSON.stringify(this.state.changed_prices));
        let copy_rental = JSON.parse(JSON.stringify(this.state.house_rental));
        const key = date_type + "_" + house_category + "_" + client_category;
        copy_prices[key] = price;
        this.setState({
            changed_prices: copy_prices,
            house_rental: setPrice(copy_rental, date_type, house_category, client_category, price)
        });
    }

    handleSaveHouseRental() {
        axios.post(server + '/api/edit/house_rental', {
            house_rental: this.state.house_rental.map(e => ({"id": e.service_id, "price": e.price}))
        })
            .then(() => this.setState({uploading: false}))
            .catch(() => alert('Error'));
        this.setState({uploading: true});
    }

    render() {
        return (
            <div>
                <EditHouseRental house_rental={this.state.house_rental}
                         house_categories={this.state.house_categories}
                         onPriceChanged={this.onPriceChanged}
                         handleSaveData={this.handleSaveHouseRental}
                         uploading={this.state.uploading}
                         handleTabChanged={this.handleDateTypeTabChanged}
                />
            </div>
        );
    }


}