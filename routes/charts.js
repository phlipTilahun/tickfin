var express = require('express')
var path = require('path')
var chartRouter = express.Router()
var dbpool = require('../db');
const fs = require('fs')
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
const paramSchemas = require('../paramSchemas');
const resourceSchemas = require('../resourceSchemas');
const errorHandler = require('../errorHandler');
const { string, number } = require('joi');
const { idleCount } = require('../db');


chartRouter.post('/chartedit',(req,res,next)=>{

  fs.writeFileSync(req.query.path,JSON.stringify(req.body.seatingarrangment))
  //console.log(JSON.stringify(req.body.seatingarrangment))
})

chartRouter.get('/',(req,res,next)=>{

  var params = req.query
  var {value , error} = paramSchemas.GETchartParams.validate(params)
  if (error)
      res.status(400).json(error)
  else {
        dbpool.query(`SELECT * FROM seatingchart WHERE name = '${params.name}' and idorganizer = ${req.orgId}`, (er, re) => {
            if(re.rows[0]){
              var options = {
                headers: {
                    'chartId': re.rows[0].id,
                    'name': re.rows[0].name,
                    'path': re.rows[0].seatingarrangment
                }
              };

              if(req.headers.id){
                dbpool.query(`SELECT tickstat FROM event WHERE id = ${req.headers.id}`,(err,resp)=>{
                   if(resp){
                     if(resp.rows[0].tickstat != 'open'){
                        res.status(204).send("Ticket sales is not open")
                     }else{
                      res.sendFile(path.join(__dirname,'../',`/${re.rows[re.rows.length-1].seatingarrangment}`),options)  
                     }
                   }
                   else{
                    console.log(err)
                   }
                })
              }else{
                res.sendFile(path.join(__dirname,'../',`/${re.rows[re.rows.length-1].seatingarrangment}`),options)  
              }
            }    
            else{
                res.json("Not Found").status(404)
            }
        })     
  }
});

chartRouter.post('/',upload.single('seatingarrangment'),(req,res,next)=>{
  var reqbod = req.body
  if(req.file){
      reqbod.seatingarrangment = "Present"
  }
  console.log(req.file)
  var {value , error} = resourceSchemas.chart.validate(reqbod)
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
    dbpool.query(`INSERT INTO seatingchart(id,idorganizer,seatingarrangment,name) VALUES(${reqbod.chartId},${req.orgId},'${req.file.path}','${reqbod.name}')`, (er, re) => {
      if(re){
        res.status(201).json(reqbod)
      }else{
        console.log(er)
        res.status(400).json(er.detail)
      }  
    })
  }
});

chartRouter.put('/',upload.single('seatingarrangment'),(req,res,next)=>{
    var reqbod = req.body
    if(req.file){
        reqbod.seatingarrangment = "Present"
    }
    var {value , error} = resourceSchemas.chart.validate(reqbod)
    if (error)
        res.send(error)
    else{
       dbpool.query(`DELETE FROM seatingchart WHERE id = ${reqbod.chartId}`, (er, re) => {
            console.log(er)
            // order object by key
            const reqbod = Object.keys(req.body).sort().reduce(
                (obj, key) => { 
                obj[key] = req.body[key]; 
                return obj;
                }, 
            {}
            );   
            dbpool.query(`INSERT INTO seatingchart(id,idorganizer,seatingarrangment,name) VALUES(${reqbod.chartId},${req.orgId},'${req.file.path}','${reqbod.name}')`, (er, re) => {
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

chartRouter.get('/:chartId(\\d+)',(req,res,next)=>{
  var queryy = `SELECT * FROM seatingchart WHERE id = ${req.params.chartId}`
  dbpool.query(queryy, (er, re) => {
    if(re.rows[0]){
        var options = {
            headers: {
                'chartId': re.rows[0].id,
                'name': re.rows[0].name
            }
          };
        res.sendFile(path.join(__dirname,'../',`/${re.rows[0].seatingarrangment}`),options)  
    }    
    else{
        res.status(404).json("Not Found").status(404)
    }
  }) 
});

chartRouter.delete('/:chartId(\\d+)',(req,res,next)=>{
  var queryy = `DELETE FROM seatingchart WHERE id = ${req.params.chartId}`
  dbpool.query(queryy, (er, re) => {
    if(re){
      res.status(201).json("Chart Deleted") 
    }else{
      res.status(400).json(er.detail)
    }
  }) 
});

module.exports = chartRouter