var express = require('express')
var eventRouter = express.Router()
var dbpool = require('../db');
const paramSchemas = require('../paramSchemas');
const resourceSchemas = require('../resourceSchemas');
const errorHandler = require('../errorHandler');
const { string, number } = require('joi');



eventRouter.get('/',(req,res,next)=>{

  var params = req.query
  var {value , error} = paramSchemas.GETeventParams.validate(params)
  if (error)
      res.status(400).json(error)
  else {
    //set default parameter values 
    if(!params.limit){
      params.limit = 10
    }
    if(!params.page){
      params.page = 0
    } 
    if(!params.desc){
      params.desc = true
    }
   var limit = params.limit
   var page = params.page
   var desc = params.desc

   delete params.limit
   delete params.page
   delete params.desc

   // change value of desc to a value postgres understands
   if(desc == true)
     desc = "DESC"
   else
     desc = "ASC" 

    // construct a querystring from the req.query object. 
    var queryString = Object.keys(params).map(key => {
        var s = ''
        if(key == 'name'){
          s += "eventname = '" + params[key] + "'"
        }
        else if(key == 'tkst'){
          s += "tickstat = '" + params[key].toLowerCase() + "'"
        }
        else if(key == "evst"){
          s += "evstatus = '" + params[key].toLowerCase() + "'"
        }
        else if(key == 'ven'){
          s += "idvenue" + ' = ' + params[key]
        } 
        else if(key == 'ha'){
          s += "idhall" + ' = ' + params[key]
        }
        return s
      }
    ).join(' and ');
    if(queryString){
      queryString += " and idorganizer" + ' = ' + req.orgId
    }
    else{
      queryString += "idorganizer" + ' = ' + req.orgId
    }
    

    // query database and send response
    var queryy = `SELECT id AS eventId,eventname AS eventname,description AS eventDescription,startdate AS startdate, enddate AS enddate, starttime AS starttime, endtime AS endtime, idvenue AS venueId, idhall AS hallId, idchart AS idchart, evstatus AS eventStatus, tickstat AS tickStat  FROM event WHERE ${queryString} ORDER BY id ${desc} LIMIT ${limit} OFFSET ${page}`
    console.log(queryy)
    dbpool.query(queryy, (er, re) => {
      if(re){
        if(re.rows[0]){
          res.status(200).json(re.rows)
        }else{
          res.status(404).send("Not Found")
        }
      }else{
        res.status(400).json(er.detail)
      }
    })
  } 
});

eventRouter.post('/',(req,res,next)=>{
  var reqbod = req.body
  var {value , error} = resourceSchemas.event.validate(reqbod)
  if (error)
      res.status(400).json(error)
  else{
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
      if(key == 'eventId' || key == 'hallId' || key == 'venueId' || key == 'chartId'){
        s +=  reqbod[key]
      }
      else if(key == 'eventName' || key == 'eventDescription' || key == 'startDate' || key == 'endDate' || key == 'startTime' || key == 'endTime' || key == 'eventStatus' || key == 'tickStat'){
        s += "'" + reqbod[key].toLowerCase() + "'"
      }
      return s
    }
  ).join(',');
    console.log(queryString)
    dbpool.query(`INSERT INTO event(idchart,enddate,endtime,description,id,eventname,evstatus,idhall,startdate,starttime,tickstat,idvenue,idorganizer) VALUES(${queryString},${req.orgId})`, (er, re) => {
      if(re){
        res.status(201).json(reqbod)
      }else{
        console.log(er)
        res.status(400).json(er.detail)
      }
    })
  }
});

eventRouter.put('/',(req,res,next)=>{
  var reqbod = req.body
  console.log(reqbod)
  var {value , error} = resourceSchemas.event.validate(reqbod)
  if (error)
      res.send(error)
  else{
    dbpool.query(`DELETE FROM event WHERE id = ${reqbod.eventId}`, (er, re) => {
        console.log(er)
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
          if(key == 'eventId' || key == 'hallId' || key == 'venueId'){
            s +=  reqbod[key]
          }
          else if(key == 'eventName' || key == 'eventDescription' || key == 'startDate' || key == 'endDate' || key == 'startTime' || key == 'endTime' || key == 'eventStatus' || key == 'tickStat'){
            s += "'" + reqbod[key].toLowerCase() + "'"
          }
          return s
        }
      ).join(',');
        console.log(queryString)
        dbpool.query(`INSERT INTO event(enddate,endtime,description,id,eventname,evstatus,idhall,startdate,starttime,tickstat,idvenue,idorganizer) VALUES(${queryString},${req.orgId})`, (er, re) => {
          if(re){
            res.status(201).json(reqbod)
          }else{
            console.log(er)
            res.status(400).json(er.detail)
          }
        })          
    }) 
  }
});

eventRouter.get('/:eventId(\\d+)',(req,res,next)=>{
   
  var queryy = `SELECT id AS eventId,eventname AS eventname,description AS eventDescription,startdate AS startdate, enddate AS enddate, starttime AS starttime, endtime AS endtime, idvenue AS venueId, idhall AS hallId, idchart AS idchart, evstatus AS eventStatus, tickstat AS tickStat  FROM event WHERE id = ${req.params.eventId}`
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
});

eventRouter.delete('/:eventId(\\d+)',(req,res,next)=>{
  var queryy = `DELETE FROM event WHERE id = ${req.params.eventId}`
  dbpool.query(queryy, (er, re) => {
    if(re){
      res.status(201).json("Event Deleted") 
    }else{
      res.status(400).json(er.detail)
    }
  }) 
});

module.exports = eventRouter