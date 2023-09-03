const express = require('express');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')

const app = express();
const sqlite3 = require('sqlite3').verbose();

var urlencodedParser = bodyParser.urlencoded({ extended: false })

let db = new sqlite3.Database('./db/users.db',(err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
  });


app.use(express.static('css'))
app.use(express.static('public'))
app.use(cookieParser())
app.set('view engine', 'ejs');

db.all('select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME="Korisnici"', (err, data) => {
    if (err) return;
    else console.log(data);
})

db.all('select * from Korisnici',(err, results) => {
    if (err) console.log(err);
    else if(results.length != 0) {
        console.log(results)
        console.log("Ovo gore je tablica korisnika")
    } 
    else console.log('OK'); 
})

//Ako vrati false korisnik ne postoji, ako vrati true onda postoji
function ProvjeriKorisnika(user, password){
    db.all('SELECT * FROM Korisnici WHERE username ="' + user + '" AND pass="' + password + '"', (err, rows) =>{
        if(err) console.log(err);
        else if(rows.length) {
            console.log(rows);
            return true;
        } else return false;
    })
}

//Ako vrati true, kolacic postoji
function ProvjeriKolacic(id, user){
    db.all('SELECT * FROM Korisnici WHERE kolacic="' + id + '" AND username="' + user + '"', (err, rows) => {
        if(err) {
            console.log(err);
            return false; 
        } else if(rows.length){
            console.log(rows);
            return true
        } else return false
    })
}




app.get('/login',(req, res)=>{
    console.log("Login se upalio")
    res.sendFile(__dirname + '/html/login/login.html');
})

app.post('/logiraj',urlencodedParser ,(req, res)=>{
    const username = req.body.username
    const pass = req.body.password
    console.log(username + " " + pass)
    const kljuc = Date.now()
    if(!ProvjeriKorisnika(username,pass)){
        console.log("Login radi")
        db.run('UPDATE Korisnici SET kolacic= ? where username = ?', [kljuc, username], (err, result) => {
            if(err){
                console.log(err)
                res.redirect('/login?status=error')
            } else {
                res.cookie('uniqueID', kljuc)
                res.cookie('user', username)
                console.log("Kolacici postavljeni")
                res.redirect('/')
            }
        })
    } else {
        res.redirect('/login?status=false')
    }
})

app.get('/', (req, res)=>{
    console.log('Spajanje na home')
    if(!req.cookies){
        console.log('No cookies')
        res.redirect('/login');
    } else {
        console.log(req.cookies);
        if(!ProvjeriKolacic(req.cookies.uniqueID, req.cookies.username)) {
            res.render('home', { username: req.cookies.user})
        } else { res.redirect('/login?status=NoCookie'); }
    }
})

app.get('/odjava', (req, res) => {
    res.clearCookie()
    res.redirect('/login?status=LoggedOut')
})


app.post('/registriraj',urlencodedParser ,(req, res)=>{
    const username = req.body.username
    const pass = req.body.password
    const kolacic = Date.now()
    if(username == undefined || pass == undefined || username == null){
        console.log("Podaci ne valjaju")
        res.redirect('/login')
    }
    db.all('select * from Korisnici WHERE username="' + username + '"',(err, results) => {
        if (err) console.log(err);
        else if(results.length != 0){
            res.redirect('/login?status=failed')
        } else {
            db.run('INSERT INTO Korisnici(username,pass,icon, kolacic) VALUES (?,?,?,?)',[username,pass,'Anonimus', kolacic],(err)=>{
                if(err) {
                    console.log(err)
                    res.redirect('/login')
                } else {
                    res.cookie('uniqueID', kolacic)
                    res.cookie('userID', username)
                    console.log('uspjesna registracija')
                    res.redirect('/login')
                }
            })
        } 
    })
    
    
})

app.listen(5000, ()=>{
    console.log("Server radi")
})

"CREATE TABLE Korisnici (	id INT PRIMARY KEY IDENTITY(1,1),	username VARCHAR(20) NOT NULL,pass VARCHAR(20),icon NVARCHAR(MAX));"