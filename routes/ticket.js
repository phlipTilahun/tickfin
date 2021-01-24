var express = require('express')
var ticketRouter = express.Router()
var dbpool = require('../db');
const paramSchemas = require('../paramSchemas');
const resourceSchemas = require('../resourceSchemas');
const errorHandler = require('../errorHandler')



ticketRouter.get('/',(req,res,next)=>{
  // var params = req.query
  // var {value , error} = paramSchemas.GETticketParams.validate(params);
  // if (error)
  //     res.status(400).json(error)
  // else{
    // construct a querystring from the req.query object. 
    var queryString = `SELECT * FROM ticket WHERE id = ${req.query.data}`  
    console.log(queryString)
    dbpool.query(queryString, (er, re) => {
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
  //}
});

ticketRouter.post('/',(req,res,next)=>{
  var reqbod = req.body
  var {value , error} = resourceSchemas.ticket.validate(reqbod)
  if (error)
      res.status(400).json(error)
  else {
    if(!req.body.seatnum){
      req.body.seatnum = "None"
    }
    // order object by key
    const reqbod = Object.keys(req.body).sort().reduce(
      (obj, key) => { 
        obj[key] = req.body[key]; 
        return obj;
      }, 
      {}
    );    
    // construct a querystring from the req.query object. 
    var queryString = Object.keys(reqbod).map(key => {
      var s = ''
      if(key == 'eventId'){
        s +=  reqbod[key]
      }
      else if(key == 'eventName' || key == 'date' || key == 'time' || key == 'hallName' || key == 'venName'){
        s += "'" + reqbod[key].toLowerCase() + "'"
      }
      else if(key == 'seatnum'){
        if(reqbod[key] == "None"){
          s += 'NULL'
        }
        else{
          s += "'" + reqbod[key].toLowerCase() + "'"
        }
      }
      return s
    }
  ).join(',');    
    console.log(queryString)
    dbpool.query(`INSERT INTO ticket(date,idevent,eventname,hallname,seatnum,time,venuename) VALUES(${queryString})`, (er, re) => {
      if(re){
        res.status(201).json(reqbod)
      }else{
        res.status(400).json(er.detail)
      }
    })
  }
});

module.exports = ticketRouter