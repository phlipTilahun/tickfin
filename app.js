'use strict';


var express = require('express');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
var bodyparser = require('body-parser')
var dbpool = require('./db');
var fs = require('fs');
var uuid = require('uuid')

//var path = require('path');
//var cookieParser = require('cookie-parser');
//var logger = require('morgan');


const eventRouter = require('./routes/events');
const hallRouter = require('./routes/halls');
const venueRouter = require('./routes/venues');
const eventReportRouter = require('./routes/eventreports');
const ticketRouter = require('./routes/ticket');
const chartRouter = require('./routes/charts');
const { json } = require('express');



const app = express()
const port = process.env.PORT || 5000



app.use(express.urlencoded());
app.use(express.json());
app.use(function (error, req, res, next) {
  if (error instanceof SyntaxError) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.status(400).json(error)
  } else {
    next();
  }
});


app.use((request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



app.use((req,res,next)=>{
  var key = req.query.key
  if(!key){
    res.status(401).json("Unauthorized")
  }else{
    dbpool.query(`SELECT id FROM eventorganizer WHERE apikey = '${key}'`, (er, re) => {
      delete req.query.key
      if(re.rows[0]){
        req.orgId = re.rows[0].id
        next()
      }else{
        res.status(401).json("Unauthorized")
      }
    })
  }
})



app.post('/test',(req,res,next)=>{
  const replaced = req.body.seatingarrangment.replace(/\\/g, '')
  //console.log(JSON.parse(replaced));
  var path = `uploads/${uuid.v4()}.json`
  fs.writeFileSync(path,replaced)
  dbpool.query(`INSERT INTO seatingchart(idorganizer,seatingarrangment,name) VALUES(${req.orgId},'${path}','${req.query.name}')`, (er, re) => {
    if(re){
      res.status(201).json("Saved")
      //console.log(re)
    }else{
      console.log(er)
      res.status(400).json(er.detail)
    }  
  })
  //console.log(req.query.name)
  //res.send("ymechish")
})  


app.use('/event',eventRouter);
app.use('/chart',chartRouter);
app.use('/venue',venueRouter);
app.use('/hall',hallRouter);
app.use('/eventReport',eventReportRouter);
app.use('/ticket',ticketRouter);



app.listen(port,console.log("listening"));
