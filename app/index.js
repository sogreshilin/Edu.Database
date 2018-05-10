import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import axios from 'axios';

import styles from './main.scss';

import OrderFinalization from './components/order/OrderFinalization';
import HouseFilter from "./components/house/HouseFilter";
import EditHouse from "./components/edit/EditHouse";
import EditHouseCategory from "./components/edit/EditHouseCategory";
import PriceGenerator from "./components/edit/PriceGenerator";
import OrdersFilter from "./components/administrator/OrdersFilter";
import OrderSummary from "./components/administrator/OrderSummary";
import OrderReview from "./components/order/OrderReview";

export const server = 'http://localhost:5000';

const NotFound = () => (
    <div>
        <h1>Not Found</h1>
    </div>
);



const App = () => (
    <Router>
        <div>
            <Switch>
                <Route exact path='/order' component={OrderFinalization} />
                <Route path='current_order_status/order/:id' component={OrderReview} />
                <Route exact path='current_order_status/filter' component={HouseFilter} />
                <Route exact path='current_order_status/edit/add_house' component={EditHouse} />
                <Route exact path='current_order_status/edit/add_house_category' component={EditHouseCategory} />
                <Route exact path='current_order_status/edit/price' component={PriceGenerator} />
                <Route exact path='current_order_status/admin/orders' component={OrdersFilter} />
                <Route exact path='current_order_status/admin/order_summary' component={OrderSummary} />
                <Route component={NotFound} />
            </Switch>
        </div>
    </Router>
);

ReactDOM.render(
    <App />,
    document.getElementById("app")
);
