var express = require('express')
var hallRouter = express.Router()
var dbpool = require('../db');
const paramSchemas = require('../paramSchemas');
const resourceSchemas = require('../resourceSchemas');
const errorHandler = require('../errorHandler');
const { isError } = require('joi');



hallRouter.get('/',(req,res,next)=>{
  var params = req.query
  var {value , error} = paramSchemas.GEThallParams.validate(params);
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

    if(params.ven){
      var queryString = `SELECT id AS hallId, idvenue AS venueId, venname AS venName, hallname AS name, capacity AS capacity FROM hall WHERE idvenue = ${params.ven} and idorganizer = ${req.orgId} ORDER BY id ${desc} LIMIT ${limit} OFFSET ${page}`  
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
    }else{
      var queryString = `SELECT id AS hallId, idvenue AS venueId, venname AS venName, hallname AS name, capacity AS capacity FROM hall WHERE idorganizer = ${req.orgId} ORDER BY id ${desc} LIMIT ${limit} OFFSET ${page}`  
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
  }
});

hallRouter.post('/',(req,res,next)=>{
  var reqbod = req.body
  var {value , error} = resourceSchemas.hall.validate(reqbod)
  if (error)
      res.status(400).json(error)
  else{
    if(!req.body.venueId){
      req.body.venueId = "None"
    }
    if(!req.body.venName){
      req.body.venName = "None"
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
        if(key == 'hallId' ||  key == 'capacity'){
          s +=  reqbod[key]
        }
        else if(key == 'name'){
          s += "'" + reqbod[key].toLowerCase() + "'"
        }
        else if(key == 'venName'){
          if(reqbod[key] == "None"){
            s += 'NULL'
          }
          else{
            s += "'" + reqbod[key].toLowerCase() + "'"
          }
        }
        else if(key == 'venueId'){
          if(reqbod[key] == "None"){
            s += 'NULL'
          }
          else{
            s +=  reqbod[key]
          }
        }
        return s
      }
    ).join(',');  
    console.log(queryString)
    dbpool.query(`INSERT INTO hall(capacity,id,hallname,venname,idvenue,idorganizer) VALUES(${queryString},${req.orgId})`, (er, re) => {
      if(re){
        res.status(201).json(reqbod)
      }else{
        res.status(400).json(er.detail)
      }
    })
  }
});

hallRouter.put('/',(req,res,next)=>{
  var reqbod = req.body
  var {value , error} = resourceSchemas.hall.validate(reqbod)
  if (error)
      res.send(error)
  else{
    dbpool.query(`DELETE FROM hall WHERE id = ${reqbod.hallId}`, (er, re) => {
      console.log(er)
      if(!req.body.venueId){
        req.body.venueId = "None"
      }
      if(!req.body.venName){
        req.body.venName = "None"
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
          if(key == 'hallId' ||  key == 'capacity'){
            s +=  reqbod[key]
          }
          else if(key == 'name'){
            s += "'" + reqbod[key].toLowerCase() + "'"
          }
          else if(key == 'venName'){
            if(reqbod[key] == "None"){
              s += 'NULL'
            }
            else{
              s += "'" + reqbod[key].toLowerCase() + "'"
            }
          }
          else if(key == 'venueId'){
            if(reqbod[key] == "None"){
              s += 'NULL'
            }
            else{
              s += reqbod[key]
            }
          }
          return s
        }
      ).join(',');  
      console.log(queryString)
      dbpool.query(`INSERT INTO hall(capacity,id,hallname,venname,idvenue,idorganizer) VALUES(${queryString},${req.orgId})`, (er, re) => {
        if(re){
          res.status(201).json(reqbod)
        }else{
          res.status(400).json(er.detail)
        }
      })
    })
  }       
});

hallRouter.get('/:hallId(\\d+)',(req,res,next)=>{
  var queryy = `SELECT id AS hallId, idvenue AS venueId, venname AS venName, hallname AS name, capacity AS capacity FROM hall WHERE id = ${req.params.hallId}`
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

hallRouter.delete('/:hallId(\\d+)',(req,res,next)=>{
  var queryy = `DELETE FROM hall WHERE id = ${req.params.hallId}`
  dbpool.query(queryy, (er, re) => {
    if(re){
      res.status(201).json("Hall Deleted") 
    }else{
      res.status(400).json(er.detail)
    }
  }) 
});

module.exports = hallRouter