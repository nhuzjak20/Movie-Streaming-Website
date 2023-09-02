const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('/db/users.db', sqlite3.OPEN_READWRITE,(err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
  });

app.use(express.static('css'))
app.use(express.static('public'))


app.get('/login',(req, res)=>{
    console.log("Login se upalio")
    res.sendFile(__dirname + '/html/login/login.html');
})

app.post('/logiraj', (req, res)=>{

})

app.get('/')

app.post('/registriraj', (req, res)=>{

})

app.listen(5000, ()=>{
    console.log("Server radi")
})