import React from 'react';
import { Card, Button, Label, Intent, Checkbox } from '@blueprintjs/core';
import InputMask from 'react-input-mask';

import { StorageKeys, getFromStorageOrThrow } from "../Storage";

import axios from 'axios';

import styles from './order.scss';
import PhoneInput from "./PhoneInput";


const mockSessionStorage = () => {
    sessionStorage.setItem("category_id", 12);
    sessionStorage.setItem("house_id", 1);
    sessionStorage.setItem("from_timestamp", 1525000000);
    sessionStorage.setItem("to_timestamp", 1525090600);
};


const emailRegExPattern = "(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])";
const emailRegEx = new RegExp(emailRegExPattern);


// Form fields validation and formatting

const isEmailValid = (email) => emailRegEx.test(email);

const serializePhoneNumber = (phoneNumber) => phoneNumber.split('').filter(_ => _ === '+' ||  _.match(/\d/) !== null).join('');

const deserializePhoneNumber = (rawPhone) =>
    '+' +
    rawPhone.charAt(0) + " (" +
    rawPhone.substring(1, 4) + ") " +
    rawPhone.substring(4, 7) + "-" +
    rawPhone.substring(7, 9) + "-" +
    rawPhone.substring(9, 11);


const toInt = (value) => Number.parseInt(value);


// Form fields keys

class FormKeys {

    static Email() { return "email"; }
    static FirstName() { return "first_name"; }
    static SecondName() { return "second_name"; }
    static ThirdName() { return "third_name"; }
    static Phone() { return "phone"; }

}


const GeneralOrderInformation = ({ houseCategory, houseNumber, dateFrom, dateTo, price }) => {
    const options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    const from = new Date(dateFrom).toLocaleDateString('ru', options);
    const to = new Date(dateTo).toLocaleDateString('ru', options);
    return (
        <section className={"generalOrderInfoSection"}>
            <h3>Информация о заказе</h3>
            <p>Категория дома отдыха: {houseCategory}</p>
            <p>Номер дома: {houseNumber}</p>
            {/*<p>Время пребывания: {dateFrom} -- {dateTo}</p>*/}
            <p>Время пребывания: {from} -- {to}</p>
            <p>Cтоимость: <span>{price}</span>&#8376;</p>
        </section>
    )
};


export default class OrderFinalization extends React.Component {

    constructor() {
        super();
        this.state = {
            category_id:  0,
            house_id: 0,
            from_timestamp: 0,
            to_timestamp: 0,
            email: "",
            first_name: "",
            second_name: "",
            third_name: "",
            phone: "",
            prices: 0,
            isCompanyWorker: false,
            invalidFields: new Set(),
        };

        this.onCheckboxClicked = this.onCheckboxClicked.bind(this);
        this.onMakeOrderClicked = this.onMakeOrderClicked.bind(this);
        this.onNamePartChange = this.onNamePartChange.bind(this);
        this.onEmailChange = this.onEmailChange.bind(this);
        this.onPhoneNumberChanged = this.onPhoneNumberChanged.bind(this);
    }

    componentWillMount() {
        const prices = JSON.parse(getFromStorageOrThrow(StorageKeys.Prices()));
        console.log("prices: " + prices);
        try {
            this.setState({
                category_id:  toInt(getFromStorageOrThrow(StorageKeys.CategoryId())),
                categoryName:  getFromStorageOrThrow(StorageKeys.CategoryName()),
                house_id: toInt(getFromStorageOrThrow(StorageKeys.HouseId())),
                house_name: getFromStorageOrThrow(StorageKeys.HouseName()),
                from_timestamp: toInt(getFromStorageOrThrow(StorageKeys.FromTimestamp())),
                to_timestamp: toInt(getFromStorageOrThrow(StorageKeys.ToTimestamp())),
                prices: JSON.parse(getFromStorageOrThrow(StorageKeys.Prices())),
                email: "",
                first_name: "",
                second_name: "",
                third_name: "",
                phone: "",
                isCompanyWorker: false,
            });
            console.log('call /api/current_user');
            axios.get('/api/current_user')
                .then(result => {
                    if (result.data.is_authenticated) {
                        this.setState({
                            first_name: result.data.first_name,
                            second_name: result.data.last_name,
                            third_name: result.data.middle_name,
                            phone: deserializePhoneNumber(result.data.phone),
                            email: result.data.email,
                            isCompanyWorker: parseInt(result.data.category_id) === 1
                        })
                    }
                })
                .catch(error => {
                    console.error(error);
                    this.setState({
                        showLoadError: true
                    })
                })
        } catch (error) {
            console.error(error);
            alert("Failed to initialize components")
        }
    }

    onCheckboxClicked() {
        this.setState({
            isCompanyWorker: !this.state.isCompanyWorker
        })
    }

    onMakeOrderClicked() {
        if (this.state.invalidFields.size > 0) {
            return;
        }
        console.log("phone: " + this.state.phone);

        axios.post("http://localhost:5000/api/book", {
                house_id: this.state.house_id,
                from_date: this.state.from_timestamp,
                to_date: this.state.to_timestamp,
                email: this.state.email,
                phone: serializePhoneNumber(this.state.phone),
                first_name: this.state.first_name,
                last_name: this.state.second_name,
                middle_name: this.state.third_name,
                is_company_worker: this.state.isCompanyWorker
            })
            .then(() => alert("Дом успешно забронирован. Вам на почту отправлено письмо с информацией о заказе"))
            .catch(error => {
                console.log(error.message);
                console.log(error.response.status);
                console.log(error.response.data);
            })
    }

    markInvalidField(key) {
        this.setState({
            invalidFields: this.state.invalidFields.add(key)
        })
    }

    updateField(key, value) {
        const set = this.state.invalidFields;
        set.delete(key);
        this.setState({
            [key]: value,
            invalidFields: set
        })
    }

    onNamePartChange(namePart, key) {
        const value = namePart.trim();
        if (value.length === 0 || value.match(/^[a-zA-Z\u0430-\u044f]+$/ig) !== null) {
            this.updateField(key, value)
        } else {
            this.markInvalidField(key)
        }
    }

    onEmailChange(email) {
        let tempState = {};
        if (!isEmailValid(email)) {
            tempState["invalidFields"] = this.state.invalidFields.add(FormKeys.Email())
        } else {
            const set = this.state.invalidFields;
            set.delete(FormKeys.Email());
            tempState["invalidFields"] = set;
        }

        this.setState({
            invalidFields: tempState.invalidFields,
            [FormKeys.Email()]: email
        });
    }

    onPhoneNumberChanged(event) {
        const phone = event.target.value;
        const key = FormKeys.Phone();
        const value = phone.trim().replace(/\D/g, '');
        console.log(value);
        if (value.length === 11) {
            this.updateField(key, value)
        } else {
            this.markInvalidField(key)
        }
    }

     render() {
        return (
            <div className={"orderFinalization"}>
                <Card>
                    <GeneralOrderInformation houseCategory={this.state.category_id}
                                             houseNumber={this.state.house_id}
                                             dateFrom={new Date(this.state.from_timestamp * 1000)}
                                             dateTo={new Date(this.state.to_timestamp * 1000)}
                                             price={this.state.prices[this.state.isCompanyWorker ? "1" : "2"]}
                    />
                </Card>
                <Card>
                    <section className={"contactInfoSection"}>
                        <h3>Контактные данные</h3>
                        <Label text={"Номер телефона"} helperText={"*"}>
                            <InputMask className={'pt-input'}
                                       onChange={this.onPhoneNumberChanged}
                                       mask="+7 (999) 999-99-99"
                                       maskChar=" " />
                        </Label>
                        <Label text={"Email"} helperText={"*"}>
                            <input type={"email"}
                                   className={"pt-input"}
                                   required
                                   value={this.state.email}
                                   onChange={event => this.onEmailChange(event.target.value)}
                            />
                        </Label>
                        <Label text={"Фамилия"} helperText={"*"}>
                            <input className={"pt-input"}
                                   value={this.state.second_name}
                                   required
                                   onChange={event => this.onNamePartChange(event.target.value, FormKeys.SecondName())}
                            />
                        </Label>
                        <Label text={"Имя"} helperText={"*"}>
                            <input className={"pt-input"}
                                   value={this.state.first_name}
                                   required
                                   onChange={event => this.onNamePartChange(event.target.value, FormKeys.FirstName())}
                            />
                        </Label>
                        <Label text={"Отчество"}>
                            <input className={"pt-input"}
                                   value={this.state.third_name}
                                   onChange={event => this.onNamePartChange(event.target.value, FormKeys.ThirdName())}
                            />
                        </Label>
                        <Label text="Я являюсь сотрудником компании" className={"pt-checkbox"}>
                            <input type="checkbox"
                                   checked={this.state.isCompanyWorker}
                                   onChange={this.onCheckboxClicked}
                            />
                        </Label>
                    </section>
                </Card>
                <Card>
                    <div style={{"textAlign": "right"}}>
                        <Button text={"Забронировать"} className={"sidePadding"} onClick={this.onMakeOrderClicked}/>
                        <Button text={"Оплатить"} intent={Intent.SUCCESS} className={"sidePadding"} />
                    </div>
                </Card>
            </div>
        );
    }

}
