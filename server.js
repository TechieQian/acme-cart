const express = require('express')
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000
const conn = require('./db/index')
const path = require('path')

//Start server
const app = express()
app.listen(port, ()=> {
  console.log(`Listening on ${port}`)
  conn.sync()
    .then(()=> {
      return conn.seed()
    })
    .then(()=> {
      console.log('sync success')
    })
    .catch((err)=> {
      console.log(err )
    })
})

app.set('view engine', 'html')
app.engine('html', require('swig').renderFile)

//Body Parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Middleware
app.use(require('morgan')('dev'))
app.use(require('method-override')('_method'))
app.use(require('./routes/orders'))
app.use((err, req, res, next)=> {
  res.status(err.status || 500).render('error', { error: err });
});



//Static
app.use(express.static(path.join(__dirname, 'public')));
