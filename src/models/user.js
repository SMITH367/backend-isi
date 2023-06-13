const mongose = require("mongoose")


const Schema = mongose.Schema

const user = new Schema({
    name: String,
    password: String,
    email: String,
    identification: Number,
    phoneNumber: Number
})
module.exports = mongose.model("user", user)