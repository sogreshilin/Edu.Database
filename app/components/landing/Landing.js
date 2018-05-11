import React, { Component } from 'react';
import { Link } from "react-router-dom";
import ImageGallery from 'react-image-gallery';

import styles from './landing.scss';

const landingText = "Отдых в живописном районе Восточного Казахстана";


const LandingImageBlock = ({ onDetailsClick }) => {
    return (
        <section className={'landing-image-block'}>
            <div className={'landing-image-section'}>
                <div className={'landing-text-container'}>
                    <p className={'landing-text'}>{ landingText }</p>
                </div>
            </div>
            <div className={'landing-buttons-section'}>
                <div className={'landing-buttons'}>
                    <div className={'action-button'}>
                        <Link to='/filter'>Забронировать</Link>
                    </div>
                    <div className={'details-button'}>
                        <a onClick={onDetailsClick} href='#accommodation'>Подробности</a>
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
            </div>
        </div>
    </section>
);



const BookOfferReminder = () => (
    <section className={'book-offer-reminder-block'}>
        <p>Попробуйте нашу базу отдыха</p>
        <div>
            <Link className={'book-reminder-button'} to={'/filter'}>Забронировать дом</Link>
        </div>
    </section>
);

const SubscriptionOffer = () => (
    <section className={'subscription-offer-block'}>
        <p>Узнайте о новых предложениях первым</p>
        <div>
            <input placeholder={'Email'} />
            <button>Подписаться</button>
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
    <div className={'image-gallery-block'}>
        <ImageGallery items={galleryUrls}
                      showThumbnails={false}
                      showBullets
        />
    </div>
);


export default class Landing extends Component {

    constructor(props) {
        super(props);
    }

    render () {
        return (
            <div className={'landing'}>
                <LandingImageBlock onDetailsClick={() => {}} />
                <AccommodationInformation />
                <ImageGalleryBlock />
                <BookOfferReminder />
                <SubscriptionOffer />
            </div>
        );
    }
}
