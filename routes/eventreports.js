var express = require('express')
var eventReportRouter = express.Router()
var dbpool = require('../db');
const paramSchemas = require('../paramSchemas');
const resourceSchemas = require('../resourceSchemas');
const errorHandler = require('../errorHandler')



eventReportRouter.get('/',(req,res,next)=>{
  var params = req.query
  var {value , error} = paramSchemas.GETeventReportParams.validate(params);
  if (error)
      res.status(400).json(error)
  else{  
      // construct a querystring from the req.query object. 
      var queryString = Object.keys(params).map(key => {
          var s = ''
          if(key == 'ev'){
            s += "idevent" + ' = ' + params[key]
          }           
          return s
        }
      ).join(' and ');
      // query database and send response
      var queryy = `SELECT eventname, numofSoldNormalTick,numofSoldVIPTick,numofSoldEconomyTick,moneyMade FROM eventreport WHERE ${queryString}`
      console.log(queryy)
      dbpool.query(queryy, (er, re) => {
        if(re){
          if(re.rows[0]){
            res.status(200).json(re.rows[0])
          }else{
            res.status(404).send("Not Found")
          }
        }else{
          res.status(400).json(er.detail)
        }
      })     
  }
});


module.exports = eventReportRouter