import React, { Component } from 'react';
import { Link } from "react-router-dom";
import ImageGallery from 'react-image-gallery';

import styles from './landing.scss';

import { routes } from '../../routes';


const landingText = "Отдых в живописном районе Восточного Казахстана";

const smoothAnchorScroll = (elementId) => {
    const anchor = document.getElementById(elementId);
    const topPosition = anchor.getBoundingClientRect().top;
    window.scrollTo({
        top: topPosition,
        behavior: "smooth"
    })
};

const LandingImageBlock = ({ onDetailsClick }) => {
    return (
        <section className={'landing-image-block'}>
            <div className={'landing-image-section'}>
                <div className={"container"}>
                    <div className={'landing-text-container'}>
                        <p className={'landing-text'}>{ landingText }</p>
                        <div className={'landing-buttons-section'}>
                            <div className={'landing-buttons'}>
                                <div className={'action-button'}>
                                    <Link to={routes.BOOK_HOUSE}>Забронировать</Link>
                                </div>
                                <div className={'details-button'}>
                                    <a onClick={onDetailsClick}>Подробности</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};


const AccommodationInformation = () => (
    <section id={'accommodation'} className={'accommodation-information-block'}>
        <div className={'container'}>
            <div className={'heading'}>
                <h2>Комфортное проживание в квартирах трех типов домов</h2>
            </div>
            <div className={'house-info-grid'}>
                <div className={'house-info-item'}>
                    <p>Деревянный одноэтажный дом</p>
                    <p>От 4000 руб/сутки</p>
                </div>
                <div className={'house-info-item'}>
                    <p>Двухэтажный корпус</p>
                    <p>От 5000 руб/сутки</p>
                </div>
                <div className={'house-info-item'}>
                    <p>Деревянный двухэтажный коттедж</p>
                    <p>От 6000 руб/сутки</p>
                </div>
            </div>
            <div className={'extra-info'}>
                <hr/>
                <p>Вместимость каждой квартиры - 5 человек</p>
                <p>Все квартиры оснащены кухонным оборудованием и инвентарем, имеется санузел с душевой кабиной</p>
                <div className={"all-services-wrapper"}>
                    <Link className={'standard-link-button'} to={routes.SERVICES}>Все услуги</Link>
                </div>
            </div>
        </div>
    </section>
);



const BookOfferReminder = () => (
    <section className={'book-offer-reminder-block'}>
        <p>Не отказывайте себе в приятном отдыхе</p>
        <div>
            <Link className={'standard-link-button'} to={routes.BOOK_HOUSE}>Забронировать дом</Link>
        </div>
    </section>
);

const SubscriptionOffer = () => (
    <section className={'subscription-offer-block'}>
        <p>Узнайте о новых предложениях первым</p>
        <div>
            <input placeholder={'Email'} />
            <button className={"standard-link-button"}>Подписаться</button>
        </div>
    </section>
);


const Range = (start, end) => {
  const range = new Array(end-start+1);

  for (let i = start; i <= end; ++i) {
      range[i-start] = i;
  }

  return range;
};

const urlGenerator = "http://dosug-vko.kz/images/slider/baza-sinegorje/sl";

const galleryUrls = Range(2, 18).map(index => ({ original: `${urlGenerator}-${index}.jpg` }));

const ImageGalleryBlock = () => (
    <section className={'image-gallery-block'}>
        <ImageGallery items={galleryUrls}
                      showThumbnails={false}
                      showBullets
        />
    </section>
);


const ListPairItem = ({ title, description }) => (
    <div className={'list-pair-item'}>
        <p className={'list-pair-first-item'}>{title}</p>
        <p className={'list-pair-second-item'}>{description}</p>
    </div>
);

const hqAddress = "Республика Казахстан, Восточно-Казахстанская область, г. Риддер";

const ContactInformation = () => (
    <section className={'contacts-block'}>
        <div className={'left-col'}>
            <h3>Контакты</h3>
            <div className={'list-pair'}>
                <ListPairItem title={"Телефон"} description={"+7 (72336) 303-30, +7 (777) 201-18-67"} />
                {/*<ListPairItem title={""} description={"+7 (777) 201-18-67"} />*/}
                <ListPairItem title={"Отдел продаж"} description={"8 (7232) 76-81-43"} />
                <ListPairItem title={"Адрес"} description={hqAddress} />
                <div className={'list-pair-item'}>
                    <p className={'list-pair-first-item'}>Дорога</p>
                    <ul>
                        <li>Рейсовый автобус до г. Усть-Каменогорск</li>
                        <li>Автобус "Автовокзал - Риддер", остановка "ЛесХоз"</li>
                    </ul>
                </div>
            </div>
        </div>
        <div className={'right-col'}>
            <div className={'map-container'} />
            {/*<iframe*/}
                {/*width="600"*/}
                {/*height="450"*/}
                {/*frameBorder="0"*/}
                {/*src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBHZgjeDjwizEwx1AnnUgxXtPQVIgvTNcE&q=Gromotukha" allowFullScreen>*/}
{/*</iframe>*/}
        </div>

    </section>
);


export default class Landing extends Component {

    constructor(props) {
        super(props);
    }

    render () {
        return (
            <div className={'landing'}>
                <LandingImageBlock onDetailsClick={() => {smoothAnchorScroll("accommodation")}} />
                <AccommodationInformation />
                <ImageGalleryBlock />
                <BookOfferReminder />
                <ContactInformation />
                <SubscriptionOffer />
            </div>
        );
    }
}
