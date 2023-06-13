const express = require('express')
const router = express.Router()
const deliveryMan = require('../models/deliveryMan')
const jwt = require('jsonwebtoken')
const verifyToken = require('../Auth/verifyToken')
const bcryptjs = require('bcryptjs')
const database = require("../database/database")



router.get('/deliveryMan/:email', async (req, res) => {
    const viewUser = await deliveryMan.find({
        email: req.params.email
    }, {
        "password": 0,
        "_id": 0,
        "orders": 0,
    })
    res.send(viewUser)
})



//Creating an user account 
router.post('/deliveryMan/user', async (req, res) => {

    const viewUser = await deliveryMan.find({
        name: req.body.name
    })
    const viewUser2 = await deliveryMan.find({
        email: req.body.email
    })
    if (viewUser.length === 0 && viewUser2.length === 0) {

        let passwordHash = await bcryptjs.hash(req.body.password, 8)

        const userData = {
            name: req.body.name,
            password: passwordHash,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            identification: req.body.identification,
            plate: req.body.plate,
            vehicle: req.body.vehicle,
            balance: 0
        }
        const newUser = new deliveryMan(userData)
        await newUser.save()
        res.json({
            "added": "true"
        })
    } else {
        res.send({
            "added": "false"
        })
    }
})


//Login sistem
router.post('/deliveryMan/login', async (req, res) => {


    const viewUser = await deliveryMan.find({
        email: req.body.email
    })
    let passwordUser = ""
    let passwordTry = ""
    let passwordValidation = ""

    if (viewUser.length > 0) {
        passwordUser = viewUser[0].password
        passwordTry = req.body.password
        passwordValidation = bcryptjs.compareSync(passwordTry, passwordUser)
    }


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
                accessToken: token,
                vehicle: viewUser[0].vehicle,
                plate: viewUser[0].plate
            }
            res.json(dataUser);

        })
    } else {
        res.sendStatus(403)
    }

})



router.put('/deliveryMan/:id', verifyToken, (req, res) => {

    jwt.verify(req.auth, 'secretKey', async (err, data) => {
        if (err) {
            res.send(err);
        } else {
            const newData = {
                name: req.body.name,
                identification: req.body.identification,
                phoneNumber: req.body.phoneNumber,
                vehicle: req.body.vehicle,
                plate: req.body.plate
            }
            try {
                const updateUser = await deliveryMan.updateOne({
                    email: req.params.id
                }, newData)
                res.send(updateUser.acknowledged)
            } catch (err) {
                res.sendStatus(403)
            }
        }
    })
})



module.exports = router