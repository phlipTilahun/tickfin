var express = require('express')
var venueRouter = express.Router()
var dbpool = require('../db');
const paramSchemas = require('../paramSchemas');
const resourceSchemas = require('../resourceSchemas');
const errorHandler = require('../errorHandler')



venueRouter.get('/',(req,res,next)=>{
  var params = req.query
  var {value , error} = paramSchemas.GETvenueParams.validate(params);
  if (error)
      res.status(400).json(error)
  else{
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
    var queryString = `SELECT id AS venueId, name AS name, address AS location FROM venue WHERE idorganizer = ${req.orgId} ORDER BY id ${desc} LIMIT ${limit} OFFSET ${page}`  
    console.log(queryString)
    dbpool.query(queryString, (er, re) => {
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

venueRouter.post('/',(req,res,next)=>{
  var reqbod = req.body
  var {value , error} = resourceSchemas.venue.validate(reqbod)
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
        if(key == 'venueId'){
          s +=  reqbod[key]
        }
        else if(key == 'name' || key == 'location'){
          s += "'" + reqbod[key].toLowerCase() + "'"
        }
        return s
      }
    ).join(',');  
    dbpool.query(`INSERT INTO venue(address,name,id,idorganizer) VALUES(${queryString},${req.orgId})`, (er, re) => {
      if(re){
        res.status(201).json(reqbod)
      }else{
        res.status(400).json(er.detail)
      }
    })
  }
});

venueRouter.put('/',(req,res,next)=>{
  var reqbod = req.body
  var {value , error} = resourceSchemas.venue.validate(reqbod)
  if (error)
      res.send(error)
  else{  
    dbpool.query(`DELETE FROM venue WHERE id = ${reqbod.venueId}`, (er, re) => {
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
          if(key == 'venueId'){
            s +=  reqbod[key]
          }
          else if(key == 'name' || key == 'location'){
            s += "'" + reqbod[key].toLowerCase() + "'"
          }
          return s
        }
      ).join(',');  
      console.log(queryString)
      dbpool.query(`INSERT INTO venue(address,name,id,idorganizer) VALUES(${queryString},${req.orgId})`, (er, re) => {
        if(re){
          res.status(201).json(reqbod)
        }else{
          res.status(400).json(er.detail)
        }
      })      
    }) 
  }
});

venueRouter.get('/:venueId(\\d+)',(req,res,next)=>{
  var queryy = `SELECT id AS venueId, name AS name, address AS location FROM venue WHERE id = ${req.params.venueId}`
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


venueRouter.delete('/:venueId(\\d+)',(req,res,next)=>{
  var queryy = `DELETE FROM venue WHERE id = ${req.params.venueId}`
  dbpool.query(queryy, (er, re) => {
    if(re){
      res.status(201).json("Venue Deleted") 
    }else{
      res.status(400).json(er.detail)
    }
  }) 
});

module.exports = venueRouter