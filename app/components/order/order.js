export const OrderStatusCodes = {
    Booked: 1,
    Payed: 2,
    Active: 3,
    Cancelled: 4
};

export const OrderStatusText = {
    [OrderStatusCodes.Booked]: 'Забронирован',
    [OrderStatusCodes.Payed]: 'Оплачен',
    [OrderStatusCodes.Active]: 'Активирован',
    [OrderStatusCodes.Cancelled]: 'Отменен',
};
