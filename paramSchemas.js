const Joi = require('joi')

const GETeventParams = Joi.object({
    limit: Joi.number().integer().min(1),
    page:  Joi.number().integer().min(0),
    evst:  Joi.string().valid("SCHEDULED","STOPPED","ON-HOLD","IN-PROGRESS","COMPLETED","CANCELLED"),
    tkst:  Joi.string().valid("SCHEDULED","OPEN","CLOSED"),  
    ven:   Joi.number().integer().min(1).max(999999),
    ha:    Joi.number().integer().min(1).max(999999),
    name:  Joi.string().min(1).max(20),
    desc:  Joi.bool()
 });


const GEThallParams = Joi.object({
    limit: Joi.number().integer().min(1),
    page:  Joi.number().integer().min(0),
    ven:   Joi.number().integer().min(1).max(999999),
    desc:  Joi.bool()
})

const GETvenueParams = Joi.object({
    limit: Joi.number().integer().min(1),
    page:  Joi.number().integer().min(0),
    desc:  Joi.bool()
})

const GETchartParams = Joi.object({
    name:  Joi.string().min(1).max(100).required()
})

const GETeventReportParams = Joi.object({
    ev:    Joi.number().integer().min(1).max(999999).required()
})

const GETticketParams = Joi.object({
    ev:    Joi.number().integer().min(1).max(999999)
})

 module.exports = {GETeventParams,GETchartParams,GEThallParams,GETvenueParams,GETeventReportParams,GETticketParams}