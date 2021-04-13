const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const DB = require('./configuration/')
const port = '8000'

app.use(bodyParser.json())
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,ssid');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    res.setHeader("Content-Type", "application/json");

    // Pass to next layer of middleware
    next();
});

app.post('/auth/login',DB.login)
app.get('/auth/logout',DB.logout)

app.use(DB.validateUser)
app.get('/',(request,response)=>{
    response.json({message:'Hello World!'})
})

app.get('/tickets',DB.getTickets)
app.get('/users',DB.getUsers)
app.get('/articles',DB.getArticles)
app.post('/article/add',DB.addNewArticle)
app.post('/checks',DB.getChecksByArticle)
app.post('/articles',DB.storeArticleWithChecks)

app.listen(port,()=>{
    console.log("Server started on port "+port)
})