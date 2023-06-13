let nodeoutlook = require('nodejs-nodemailer-outlook')


const messageNewOrder = "<b>Nuevo domicilio disponible con orden: "
const messageAssignOrder = "<b>Su orden tiene un domiciliario asignado, numero de seguimiento : "
const messageDelivered = "<b>Su orden ha sido entregada, GRACIAS POR USAR NUESTRO SERVICIO, numero de orden : "

const sendEmail = (toSend, typeMessage, orderNumber) => {

    let orderInfo = ""
    let subject = ""

    toSend.forEach(element => {

        if (typeMessage == 1) {
            orderInfo = messageNewOrder
            subject = "Nueva orden disponible"
        } else if (typeMessage == 2) {
            orderInfo = messageAssignOrder
            subject = "Su orden ha sido asignada"
        } else if (typeMessage == 4) {

            orderInfo = messageDelivered
            subject = "Su orden ha sido entregada"
        }
        nodeoutlook.sendEmail({
            auth: {
                user: "jesuspuente1@hotmail.com",
                pass: "196618ab"
            },
            from: 'jesuspuente1@hotmail.com',
            to: element,
            subject: subject,
            html: `${orderInfo} ${orderNumber} </b>`,
            text: 'This is text version!',
            replyTo: 'receiverXXX@gmail.com',
            attachments: [],
            onError: (e) => console.log(e),
            onSuccess: (i) => console.log(i)
        })
    })

}




module.exports = sendEmail