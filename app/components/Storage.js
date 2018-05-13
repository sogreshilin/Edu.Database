export class StorageKeys {

    static CategoryId() { return  "category_id"; }
    static CategoryName() { return "category_name"; }
    static HouseId() { return "house_id"; }
    static HouseName() { return "house_name"; }
    static FromDate() { return "from_date"; }
    static ToDate() { return "to_date"; }
    static Prices() { return "prices"; }

}

export class SessionStorage {

    static put(key, value) {
        console.log("put", key, value);
        return sessionStorage.setItem(key, value);
    }

    static get(key) {
        const value = sessionStorage.getItem(key);
        console.log("get", key, value);
        return value;
    }

}

export const getFromStorageOrThrow = (key) => {
    const item = SessionStorage.get(key);
    if (item === null) {
        throw RangeError(`No element for key ${key}`);
    }
    return item;
};
