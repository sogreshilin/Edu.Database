import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import styles from './main.scss';

import OrderFinalization from './components/order/OrderFinalization';
import HouseFilter from "./components/house/HouseFilter";
import EditHouseCategory from "./components/edit/EditHouseCategory";
import PriceGenerator from "./components/edit/EditHouseRentalPrices";
import OrdersFilter from "./components/administrator/OrdersFilter";
import OrderSummary from "./components/administrator/order_summary/OrderSummary";
import OrderReview from "./components/order/OrderReview";
import EditHousePrice from "./components/moderator/EditHousePrice";
import ModeratorMainPage from "./components/moderator/MainPage";
import { ServiceShop } from "./components/administrator/order_summary/ServiceShop";
import Payment from "./components/payment/Payment";
import Landing from "./components/landing/Landing";

import { routes } from './routes'
import EditService from "./components/moderator/EditService";

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

const WrappedComponents = () => (
    <div className={'container'}>
        <Switch>
            <Route exact path={routes.ORDER_FINISH} component={OrderFinalization} />
            <Route path={routes.ORDER} component={OrderReview} />
            <Route exact path={routes.BOOK_HOUSE} component={HouseFilter} />
            <Route exact path={routes.ADD_HOUSE_CATEGORY} component={EditHouseCategory} />
            <Route exact path={routes.EDIT_SERVICE} component={EditService} />
            <Route exact path={routes.EDIT} component={ModeratorMainPage} />
            <Route exact path={routes.EDIT_PRICE} component={PriceGenerator} />
            <Route exact path={routes.ADMIN_ORDERS} component={OrdersFilter} />
            <Route exact path={routes.ADMIN_ORDER_SUMMARY} component={OrderSummary} />
            <Route exact path={routes.ADMIN_SERVICE_SHOP} component={ServiceShop} />
            <Route exact path={routes.PAYMENT} component={Payment} />
            <Route exact path={routes.SERVICES} component={NotImplemented} />
            <Route exact path={routes.CONTACTS} component={NotImplemented} />
            <Route exact path={routes.ABOUT} component={NotImplemented} />
            <Route component={NotFound} />
        </Switch>
    </div>
);


const App = () => (
    <Router>
        <Switch>
            <Route exact path='/' component={Landing} />
            <Route component={WrappedComponents} />
        </Switch>
    </Router>
);

ReactDOM.render(
    <App />,
    document.getElementById("app")
);
