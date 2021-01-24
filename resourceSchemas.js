const Joi = require('joi')

const event = Joi.object({
    eventName: Joi.string().max(50).required(),
    eventDescription: Joi.string().max(100).required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    startTime: Joi.string().regex(/(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)$/).message({'string.pattern.base': "startTime should be in 24 hour 'HH:MM:SS' format, and separated by colon"}).required(),
    endTime : Joi.string().regex(/(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)$/).message({'string.pattern.base': "endTime should be in 24 hour 'HH:MM:SS' format, and separated by colon"}).required(),
    hallId: Joi.number().integer().min(1).max(99999).required(),
    eventId: Joi.number().integer().min(1).max(999999).required(),
    eventStatus: Joi.string().valid("SCHEDULED","STOPPED","ON-HOLD","IN-PROGRESS","COMPLETED","CANCELLED").required(),
    tickStat:  Joi.string().valid("SCHEDULED","OPEN","CLOSED").required(),
    venueId: Joi.number().integer().min(1).max(99999).required(),
    chartId: Joi.number().integer().min(1).max(99999)
})

const hall = Joi.object({
   venueId: Joi.number().integer().min(1).max(99999),
   name: Joi.string().max(50).required().required(),
   capacity: Joi.number().integer().min(1).max(999999).required(),
   venName: Joi.string().max(50),
   hallId : Joi.number().integer().min(1).max(99999).required(),
}).with('venueId','venName').with('venName','venueId')

const venue = Joi.object({
    venueId: Joi.number().integer().min(1).max(99999).required(),
    name: Joi.string().max(20).required(),
    location: Joi.string().max(100).required(),
})

const ticket = Joi.object({
    eventId: Joi.number().integer().min(1).max(999999).required(),
    eventName: Joi.string().max(50).required(),
    date: Joi.date().required(),
    time: Joi.string().regex(/(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)$/).message({'string.pattern.base': "time should be in 24 hour 'HH:MM:SS' format, and separated by colon"}).required(),
    hallName: Joi.string().max(50).required(),
    venName: Joi.string().max(50).required(),
    seatNum: Joi.string().max(200)
})

const chart = Joi.object({
    chartId: Joi.number().integer().min(1).max(999999).required(),
    name : Joi.string().max(100).required(),
    seatingarrangment: Joi.binary().required()
})

module.exports = {event,hall,venue,ticket,chart}