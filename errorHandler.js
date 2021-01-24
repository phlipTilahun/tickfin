function checkParamErr(schema, params) {

    var {value , error} = schema.validate(params)

    if(value)
        return value
    sendErrMessage(error)
}


module.exports = {checkParamErr}