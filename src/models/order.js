const mongose = require("mongoose")


const Schema = mongose.Schema

const order = new Schema({
    user: String,
    date: String,
    collectionAddress: String,
    deliveryAddress: String,
    price: Number,
    deliveryMan: String,
    orderInformation: {
        value: Number,
        measures: String,
        contents: String
    },
    addressee: {
        addresseeName: String,
        phoneNumber: Number
    },
    state: Number,
    orderNumber: Number,
    emailUser: String,
    emailDeliveryMan: String
})
module.exports = mongose.model("orders", order)