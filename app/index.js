import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import axios from 'axios';

import styles from './main.scss';

import OrderFinalization from './components/order/OrderFinalization';
import HouseFilter from "./components/house/HouseFilter";
import EditHouse from "./components/edit/EditHouse";
import EditHouseCategory from "./components/edit/EditHouseCategory";

export const server = 'http://localhost:5000';


class OrderForm extends React.Component {

    constructor() {
        super();
        this.state = {
            houses: {},
            categories: {},
            links: {},
            current_category_id: undefined
        };

        this.onHouseCategoryChanged = this.onHouseCategoryChanged.bind(this);
    }

    componentDidMount() {
        axios("/api/form")
            .then(result => this.setState(result.data, state => this.setState({
                current_category_id: Object.keys(this.state.categories)[0]
            })))
            .catch(error => {
                console.error(error)
            })
    }

    onHouseCategoryChanged(event) {
        this.setState({
            current_category_id: event.target.value

        })
    }

    render() {
        const filtered_houses = this.state.currentCategoryId !== undefined ?
            this.state
                .links[this.state.currentCategoryId]
                .map(categoryId => this.state.houses[categoryId]) : [];

        return (
            <form>
                  <div>
                      <label htmlFor={"house_category_select"} />
                      <select id={"house_category_select"}
                              name={"house_category_select"}
                              onChange={this.onHouseCategoryChanged}
                              value={this.state.currentCategoryId}
                              required
                      >
                          { Object.values(this.state.categories).map(category => <option key={category.id} value={category.id}>{category.name}</option>) }
                      </select>
                  </div>
                <div>
                    <select id={"house_select"}
                            name={"house_select"}
                            disabled={this.state.currentCategoryId === undefined}>
                        <option value={undefined}>-- Not Selected --</option>
                        { filtered_houses.map(house => <option value={house.id}>{house.name}</option>) }
                    </select>
                </div>
                <div>
                    <input type={"email"} required />
                </div>
            </form>
        );
    }

}

const Footer = () => (
    <footer style={{"margin": "50px 0"}}>
        Footer will be here soon...
    </footer>
);

const App = () => (
    <Router>
        <div>
            <Switch>
                <Route exact path='/react/order' component={OrderFinalization} />
                <Route exact path='/react/filter' component={HouseFilter} />
                <Route exact path='/react/edit/add_house' component={EditHouse} />
                <Route exact path='/react/edit/add_house_category' component={EditHouseCategory} />
                <Route component={OrderForm} />
            </Switch>
            <Footer />
        </div>
    </Router>
);

ReactDOM.render(
    <App />,
    document.getElementById("app")
);
