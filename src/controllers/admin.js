const express = require('express')
const router = express.Router()
const order = require('../models/order')
const users = require('../models/user')
const deliveryMan = require('../models/deliveryMan')
const sendEmail = require('../services/sendEmail')
const database = require("../database/database")
const verifyToken = require("../Auth/verifyToken")
const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const adminUsers = require('../Auth/adminData')




router.get('/orders/all', async (req, res) => {
    const viewOrder = await order.find()
    res.send(viewOrder)
})


//Login sistem
router.post('/admin/login', async (req, res) => {


    let passwordValidation
    let validationEmail = false

    
    for (let i = 0; i < adminUsers.length; i++) {

       
        if (req.body.email === adminUsers[i].email) {
            validationEmail = true
        }
    }
  

    if (validationEmail) {

       
        const viewUser = await users.find({
            email: req.body.email
        })
   

        try {
    
            const passwordUser = viewUser[0].password
            const passwordTry = req.body.password
            passwordValidation = bcryptjs.compareSync(passwordTry, passwordUser)

            if (viewUser.length > 0 && passwordValidation === true) {
                const user = {
                    id: 1
                }
                jwt.sign({
                    user
                }, 'secretKey', (err, token) => {

                    if (err) return err

                    const dataUser = {
                        name: viewUser[0].name,
                        email: viewUser[0].email,
                        identification: viewUser[0].identification,
                        phoneNumber: viewUser[0].phoneNumber,
                        accessToken: token
                    }
                    res.json(dataUser);
                })
            } else {
                res.sendStatus(403)
            }
        } catch (err) {
            res.sendStatus(403)
        }

    } else {
        res.sendStatus(403)
    }


})


router.post('/admin/statistics/', verifyToken, async (req, res) => {

    jwt.verify(req.auth, 'secretKey', async (err, data) => {
        if (err) {
            res.send(err);
        } else {
            try {
                const statistics = {
                    deliveryManAssignations: []        
                }

                let cantMoneyMonth = 0
                let cantMoneyLastMonth = 0
                let cantMoneyTwoMonthsAgo=0
                let cantDeliveryMonth = 0
                let cantDeliveryTwoMonthsAgo = 0
                let cantDeliveryLastMonth = 0
                let deliveryAveragePerDay = 0
                const today = new Date()
                let date = today.getFullYear() + '-' + (today.getMonth() + 1)
                let lastMonth = today.getFullYear() + "-" + (today.getMonth())
                let twoMonthAgo = today.getMonth() + "-" + (today.getMonth() - 1)



                //  delivery man and cant deliverys

                const deliveryManData = await deliveryMan.find()
                deliveryManData.forEach((data) => {
                    statistics.deliveryManAssignations.push({name:data.name, deliveryManAssigned:data.orders.length})
                })

                
                const orderMonth = await order.find({
                    date: {
                        '$regex': `${date}`
                    }, 
                    state:4
                })
                const orderLastMonth = await order.find({
                    date: {
                        '$regex': `${lastMonth}`
                    },
                    state:4
                })
                const orderTwoMonthsAgo = await order.find({
                    date: {
                        '$regex': `${twoMonthAgo}`
                    },
                    state:4
                })

                const ordersDeclined = await order.find({
                    date: {
                        '$regex': `${date}`
                    }, 
                    state:0
                }).count()

              

                orderMonth.forEach((data) => {
                    cantDeliveryMonth++
                    cantMoneyMonth += data.price
                    
                })

                orderLastMonth.forEach((data) => {
                    cantDeliveryLastMonth++
                    cantMoneyLastMonth += data.price
                })

                orderTwoMonthsAgo.forEach((data) => {
                    cantDeliveryTwoMonthsAgo++
                    cantMoneyTwoMonthsAgo += data.price
                })


                deliveryAveragePerDay = cantDeliveryMonth / 30

                statistics.cantMoneyMonth = cantMoneyMonth
                statistics.cantMoneyLastMonth = cantMoneyLastMonth
                statistics.cantMoneyTwoMothsAgo = cantMoneyTwoMonthsAgo
                statistics.ordersMonth = cantDeliveryMonth
                statistics.ordersLastMonth = cantDeliveryLastMonth
                statistics.ordersTwoMothsAgo = cantDeliveryTwoMonthsAgo
                statistics.deliveryAveragePerDay = Number(deliveryAveragePerDay.toFixed(2))
                statistics.cantOrdersDeclinedMonth = ordersDeclined

                statistics.currentMonth = today.getMonth() + 1
                statistics.lastMonth = today.getMonth() 
                statistics.twoMonths = today.getMonth() - 1


                res.send(statistics);

            } catch (err) {
                res.send(err)
            }
        }
    })
})


module.exports = router