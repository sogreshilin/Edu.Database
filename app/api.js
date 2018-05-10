import * as axios from "axios";

const BASE_URL = '/api';

const toApiUrl = (urlString) => `${BASE_URL}${urlString}`;

class OrderApi {

    constructor() {
        this.base = "orders";
    }

    get(orderId) {
        return axios(toApiUrl(`/${this.base}/${orderId}`));
    }

    cancel(orderId) {
        return axios.patch(toApiUrl(`/${this.base}/${orderId}/cancel`))
    }

}

export default API = {
    orders: OrderApi()
}