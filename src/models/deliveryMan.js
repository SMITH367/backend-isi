const mongose = require("mongoose")


const Schema = mongose.Schema

const deliveryMan = new Schema({
    name: String,
    password: String,
    email: String,
    identification: Number,
    phoneNumber: Number,
    vehicle: String,
    orders: {
        type: Array,
        default: []
    },
    plate: String,
})
module.exports = mongose.model("deliveryMan", deliveryMan)