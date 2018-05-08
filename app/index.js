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

export const server = 'http://localhost:5000';




const App = () => (
    <Router>
        <div>
            <Switch>
                <Route exact path='/react/order' component={OrderFinalization} />
                <Route exact path='/react/filter' component={HouseFilter} />
                <Route exact path='/react/edit/add_house' component={EditHouse} />
                <Route exact path='/react/edit/add_house_category' component={EditHouseCategory} />
                <Route exact path='/react/edit/price' component={PriceGenerator} />
            </Switch>
        </div>
    </Router>
);

ReactDOM.render(
    <App />,
    document.getElementById("app")
);
