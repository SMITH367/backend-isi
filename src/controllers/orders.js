const express = require('express')
const router = express.Router()
const order = require('../models/order')
const users = require('../models/user')
const deliveryMan = require('../models/deliveryMan')
const sendEmail = require('../services/sendEmail')
const database = require("../database/database")
const verifyToken = require("../Auth/verifyToken")
const jwt = require('jsonwebtoken')



//getting all orders 
router.get('/orders/all', async (req, res) => {
    const viewOrder = await order.find()
    res.send(viewOrder)
})

//Getting order data
router.get('/orders/:id', async (req, res) => {
    const viewOrder = await order.find({
        orderNumber: req.params.id
    }, {
        "_id": 0
    })
    res.send(viewOrder)
})

//Gettin information of the order for the client 
router.get('/orders/client/:id', async (req, res) => {
    const viewOrder = await order.find({
        orderNumber: req.params.id
    }, {
        "_id": 0
    })
    res.send(viewOrder)
})


router.get('/orders/search/:id', async (req, res) => {
    const viewOrder = await order.find({
        orderNumber: req.params.id
    }, {
        "_id": 0,
        "collectionAddress": 0,
        "price": 0,
        "orderInformation": 0,
    })
    res.send(viewOrder)
})

//getting disponible orders for delivery man
router.get('/orders/deliveryMan/aviable', async (req, res) => {
    const viewOrder = await order.find({
        state: 1
    }, {
        "_id": 0,
        "orderInformation.value": 0,
        "orderInformation.contents": 0,
        "orderInformation.measures": 0,
        "addressee.adresseeName": 0,
        "addressee.phoneNumber": 0,
        "sender": 0,
        "date": 0,
        "deliveryMan": 0,
        "deliveryTime": 0,
        "emailUser": 0
    }).sort({
        $natural: -1
    })
    res.send(viewOrder)
})

//getting order deliveryMan data

router.post('/orders/deliveryMan/:id', async (req, res) => {

    const deliveryMan = req.body.deliveryMan
    let viewOrder = await order.findOne({
        orderNumber: req.params.id
    }, {
        "_id": 0,
        "orderInformation.value": 0,
        "orderInformation.contents": 0,
    })

    const userInformation = await users.findOne({
        email: viewOrder.emailUser
    })

    if (viewOrder !== null && userInformation !== null) {


        let data = {
            order: viewOrder,
            userName: userInformation.name,
            phone: userInformation.phoneNumber
        }

        if (viewOrder.emailDeliveryMan === deliveryMan) {
            res.send(data)
        } else {
            res.send(403)
        }
    } else {
        res.sendStatus(404)
    }


})

//Creating a new order
router.post('/orders/create', async (req, res) => {

    const viewOrderInfo = await order.find({
        orderNumber: req.params.orderNumber
    })

    if (viewOrderInfo.length === 0) {
        const orderData = {
            sender: req.body.user,
            date: req.body.date,
            collectionAddress: req.body.collectionAddress,
            deliveryAddress: req.body.deliveryAddress,
            price: req.body.price,
            orderInformation: {
                value: req.body.value,
                measures: req.body.measures,
                contents: req.body.contents
            },
            addressee: {
                addresseeName: req.body.addresseeName,
                phoneNumber: req.body.addresseePhoneNumber
            },
            state: 1,
            deliveryMan: "",
            orderNumber: req.body.orderNumber,
            emailUser: req.body.emailUser,
            emailDeliveryMan: ""
        }


        const deliveryMans = await deliveryMan.find()
        let deliveryEmails = []
        deliveryMans.forEach(delivery => {
            deliveryEmails.push(delivery.email)
        })

        // setTimeout(() => {
        //     sendEmail(deliveryEmails, 1, orderData.orderNumber)
        // }, 1000)
        const newOrder = new order(orderData)
        await newOrder.save()

        res.json({
            "added": "true"
        })

    } else {
        res.send({
            "added": "false"
        })

    }
})


router.put('/orders/deliveryMan/assignOrder/:orderNumber', async (req, res) => {

    const deliveryManView = req.body.deliveryMan
    try {
        const ordersDeliveryMan = await deliveryMan.findOne({
            email: deliveryManView
        })

        if (ordersDeliveryMan !== null) {

           
            await order.updateOne({
                orderNumber: req.params.orderNumber
            }, {
                deliveryMan: deliveryManView,
                emailDeliveryMan: ordersDeliveryMan.email
            })
          
            res.send(true)
        }

    } catch (err) {
        res.sendStatus(404)
    }
})



//Change the state order 
router.put('/orders/update/state/:orderNumber', async (req, res) => {
    const newState = req.body.state

    console.log(newState)
    if (newState === 2 || newState === 4 || newState === 0) {
        try {

            const findState = await order.findOne({
                orderNumber: req.params.orderNumber
            })

            if (findState.state !== newState && findState.state !== 0 && !(findState.state===4 && newState ===0) ) {

                    const updateState = await order.updateOne({
                        orderNumber: req.params.orderNumber
                    }, {
                        $set: {
                            state: newState
                        }
                    })
                    const searchOrder = await order.findOne({
                        orderNumber: req.params.orderNumber
                    })
                    const userName = searchOrder.user
                    const userData = await users.findOne({
                        name: userName
                    })

                    try{
                        if(newState === 4){
                            const ordersDeliveryMan = await deliveryMan.findOne({
                                email: searchOrder.deliveryMan
                            })
                            ordersDeliveryMan.orders.push(req.params.orderNumber)
    
                            await deliveryMan.updateOne({
                                email: ordersDeliveryMan.email,
                
                            }, {
                                orders: ordersDeliveryMan.orders
                            })
                        }
                    } catch(err){
                        res.send(err)
                    }
                   
                res.send(true)

            } else {
                res.send(false)
            }
        } catch (err) {
            res.sendStatus(404)
        }
    } else {
        res.sendStatus(403)
    }

})



// //Change the state order 
// router.put('/orders/update/state/:orderNumber', async (req, res) => {
//     const newState = req.body.state

//     console.log(newState)
//     if (newState === 2 || newState === 4 || newState === 0) {
//         try {

//             const findState = await order.findOne({
//                 orderNumber: req.params.orderNumber
//             })

//             if (findState.state !== newState && findState.state !== 0) {
//                 const updateState = await order.updateOne({
//                     orderNumber: req.params.orderNumber
//                 }, {
//                     $set: {
//                         state: newState
//                     }
//                 })
//                 const searchOrder = await order.findOne({
//                     orderNumber: req.params.orderNumber
//                 })
//                 const userName = searchOrder.user
//                 const userData = await users.findOne({
//                     name: userName
//                 })

//                 // setTimeout(() => {
//                 //     sendEmail([userData.email], newState, req.params.orderNumber)
//                 // }, 1000)

//                 res.send(true)
//             } else {
//                 res.send(false)
//             }
//         } catch (err) {
//             res.sendStatus(404)
//         }
//     } else {
//         res.sendStatus(403)
//     }

// })

//getting history of orders by user 
router.get('/orders/user/:user', verifyToken, async (req, res) => {

    console.log("here")
    jwt.verify(req.auth, 'secretKey', async (err, data) => {
        if (err) {
            res.send(err);
        } else {
            try {
                const viewOrder = await order.find({
                    emailUser: req.params.user
                }, {
                    "_id": 0,
                    "orderInformation": 0,
                    "price": 0,
                    "addressee": 0,
                    "deliveryMan": 0,
                    "deliveryTime": 0

                }).sort({
                    $natural: -1
                }).limit(10)

                res.send(viewOrder.reverse())
            } catch (err) {
                res.send(err)
            }
        }
    })
})

// getting only one order information by user
router.post('/order/user/:user', verifyToken, async (req, res) => {

    const orderNumber = req.body.orderNumber
    jwt.verify(req.auth, 'secretKey', async (err, data) => {
        if (err) {
            res.send(err);
        } else {
            try {

                const viewOrder = await order.find({
                    orderNumber: orderNumber
                }, {
                    "_id": 0
                })

                let data = {
                    order: viewOrder
                }
                if (viewOrder[0].state > 1) {
                    const deliveryManInf = await deliveryMan.findOne({
                        email: viewOrder[0].emailDeliveryMan
                    }, {
                        "_id": 0,
                        "identification": 0,
                        "orders": 0,
                        "password": 0,
                        "email": 0
                    })

                    data = {
                        order: viewOrder,
                        deliveryManInf: deliveryManInf
                    }
                }
                console.log(data)
                res.send(data)
            } catch (err) {
                res.send(err)
            }
        }
    })
})


module.exports = router