import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import styles from './main.scss';

import OrderFinalization from './components/order/OrderFinalization';
import HouseFilter from "./components/house/HouseFilter";
import EditHouse from "./components/edit/EditHouse";
import EditHouseCategory from "./components/edit/EditHouseCategory";
import PriceGenerator from "./components/edit/EditHouseRentalPrices";
import OrdersFilter from "./components/administrator/OrdersFilter";
import OrderSummary from "./components/administrator/order_summary/OrderSummary";
import OrderReview from "./components/order/OrderReview";
import EditService from "./components/moderator/EditService";
import ServiceShop from "./components/administrator/ServiceShop";
import Payment from "./components/payment/Payment";
import EditHousePrice from "./components/moderator/EditHousePrice";
import ModeratorMainPage from "./components/moderator/MainPage";

export const server = 'http://localhost:5000';

const NotFound = () => (
    <div>
        <h1>Not Found</h1>
    </div>
);

const NotImplemented = () => (
    <div>
        <h1>Not Implemented</h1>
    </div>
);


const App = () => (
    <Router>
        <div>
            <Switch>
                <Route exact path='/orders/finish' component={OrderFinalization} />
                <Route path='/orders/:id' component={OrderReview} />
                <Route exact path='/filter' component={HouseFilter} />
                <Route exact path='/edit/add_house' component={EditHouse} />
                <Route exact path='/edit/add_house_category' component={EditHouseCategory} />
                <Route exact path='/edit/service' component={EditService} />
                <Route exact path='/edit/price' component={PriceGenerator} />
                <Route exact path='/edit/prices' component={EditHousePrice} />
                <Route exact path='/edit' component={ModeratorMainPage} />
                <Route exact path='/admin/orders' component={OrdersFilter} />
                <Route exact path='/admin/order_summary' component={OrderSummary} />
                <Route exact path='/admin/service_shop' component={ServiceShop} />
                <Route exact path='/payment' component={Payment} />
                <Route exact path='/services' component={NotImplemented} />
                <Route exact path='/contacts' component={NotImplemented} />
                <Route exact path='/about' component={NotImplemented} />
                <Route component={NotFound} />
            </Switch>
        </div>
    </Router>
);

ReactDOM.render(
    <App />,
    document.getElementById("app")
);
