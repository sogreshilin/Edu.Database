export class StorageKeys {

    static CategoryId() { return  "category_id"; }
    static CategoryName() { return "category_name"; }
    static HouseId() { return "house_id"; }
    static HouseName() { return "house_name"; }
    static FromTimestamp() { return "from_timestamp"; }
    static ToTimestamp() { return "to_timestamp"; }

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
