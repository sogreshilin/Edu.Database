import React from 'react';
import ReactDOM from 'react-dom';

import axios from 'axios';



class OrderForm extends React.Component {

    constructor(props) {
        super(props);
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
        const filtered_houses = this.state.current_category_id !== undefined ?
            this.state
                .links[this.state.current_category_id]
                .map(categoryId => this.state.houses[categoryId]) : [];

        return (
            <form>
                  <div>
                      <label For={"house_category_select"} />
                      <select id={"house_category_select"}
                              name={"house_category_select"}
                              onChange={this.onHouseCategoryChanged}
                              value={this.state.current_category_id}
                              required
                      >
                          { Object.values(this.state.categories).map(category => <option value={category.id}>{category.name}</option>) }
                      </select>
                  </div>
                <div>
                    <select id={"house_select"}
                            name={"house_select"}
                            disabled={this.state.current_category_id === undefined}>
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

ReactDOM.render(
    <OrderForm />,
    document.getElementById("app")
);
