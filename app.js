//<a target="_blank" href="https://icons8.com/icon/wMubOjl2fqdm/anonymous-mask">Anonymous Mask</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>

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

//komentar


app.use(express.static('css'))
app.use(express.static('public'))
app.use(express.static('profilePictures'))
app.use(cookieParser())
app.set('view engine', 'ejs');


/*db.all('select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME="Korisnici"', (err, data) => {
    if (err) return;
    else console.log(data);
})*/


db.all('select * from Korisnici',(err, results) => {
    if (err) console.log(err);
    else if(results.length != 0) {
        console.log(results)
        console.log("Ovo gore je tablica korisnika")
    } 
    else console.log('OK'); 
})

//db.all('create table Objave(korisnik varchar(50) not null, objava varchar(300) not null, )')

//Ako vrati false korisnik ne postoji, ako vrati true onda postoji
function ProvjeriKorisnika(user, password){
    console.log("provjera Korisnika: ")
     
        db.all('SELECT * FROM Korisnici WHERE username ="' + user + '" AND pass="' + password + '"', async (err, rows) =>{
        if(err) console.log(err);
        else if(rows.length>0) {
            console.log("Ispisiani Redovi:" )
            console.log(rows);
            
            return true;
        } else return false;
        });
    }


//vrati putanju za sliku
function vratiSlikuIme(broj){
    switch(broj){
        case '1' : {return '/Anonimus.png'; break}
        case '2' : {return '/IronMan.png'; break}
        case '3' : {return '/Fredy.png'; break}
        case '4' : {return '/Jason.png'; break}
    }
    
}

//Ako vrati true, kolacic postoji
function ProvjeriKolacic(id, user){
    
    var podatak = db.all('SELECT * FROM Korisnici WHERE kolacic="' + id + '" AND username="' + user + '"', async (err, rows) => {
        if(err) {
            console.log(err);
            return false; 
        } else if(rows.length){
            console.log("Redovi sa kolacicem test" + rows)
            return true
        } else return false
    })
    console.log(podatak)
    return podatak
}




app.get('/login',(req, res)=>{
    console.log("Login se upalio")
    res.sendFile(__dirname + '/html/login/login.html');
})

app.post('/logiraj',urlencodedParser ,async (req, res)=>{
    const username = req.body.username
    const pass = req.body.password
    console.log(username + " " + pass)
    const kljuc = Date.now()
    console.log("Bool u logu: " + ProvjeriKorisnika(username,pass))
    await db.all('SELECT * FROM Korisnici WHERE username ="' + username + '" AND pass="' + pass + '"', async (err, rows) =>{
        if(err) console.log(err);
        else if(rows.length>0) {
            console.log("Ispisiani Redovi:" )
            console.log(rows);
            db.run('UPDATE Korisnici SET kolacic= ? where username = ?', [kljuc, username], (err, result) => {
                if(err){
                    console.log(err)
                    res.redirect('/login?status=error')
                } else {
                    res.cookie('uniqueID', kljuc)
                    res.cookie('user', username)
                    console.log("Kolacici postavljeni key:" + kljuc + " user:" + username)
                    res.redirect('/')
                }
            })
        } else {
            console.log(err)
            res.redirect('/login?status=error')
        }
        });
    /*
    if(!ProvjeriKorisnika(username,pass)){
        setTimeout(()=>{}, 200)
        console.log("Nema logina")
        res.redirect('/login?status=false')
        res.end();
    }
    if(ProvjeriKorisnika(username,pass)){
        setTimeout(()=>{}, 200)
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
        res.end();
    }*/
})

app.get('/', (req, res)=>{
    console.log('Spajanje na home')
    if(!req.cookies.user){
        console.log('No cookies')
        res.redirect('/login?status=NoCookie');
    } else {
        console.log(req.cookies);
        if(ProvjeriKolacic(req.cookies.uniqueID, req.cookies.user)) {
            res.render('home', { username: req.cookies.user, slika: vratiSlikuIme(req.cookies.slikica)})
        } else { res.redirect('/login?status=NoCookie'); }
    }
})


app.get('/odjava', (req, res) => {
    res.clearCookie('uniqueID')
    res.clearCookie('user')
    res.clearCookie('userID')
    res.redirect('/login?status=LoggedOut')
})

app.get('/ikonaSelect?ikona=anon', (req, res)=>{
    const ikona = req.params.ikona
    console.log(ikona)
    switch(ikona){
        case 'anon': {
            res.send('<img src="/Anonimus.png" alt="anon" />')
        }
        case 'iron': {
            res.send('<img src="/IronMan.png" alt="anon" />')
        }
        case 'fred': {
            res.send('<img src="/FreddyFazbear.png" alt="anon" />')
        }
        case 'json': {
            res.send('<img src="/Jason.png" alt="anon" />')
        }
    }
})


app.post('/registriraj',urlencodedParser ,(req, res)=>{
    const username = req.body.username
    const pass = req.body.password
    const slikica = req.body.slikica
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
            db.run('INSERT INTO Korisnici(username,pass,icon, kolacic) VALUES (?,?,?,?)',[username,pass,slikica, kolacic],(err)=>{
                if(err) {
                    console.log(err)
                    res.redirect('/login')
                } else {
                    res.cookie('uniqueID', kolacic)
                    res.cookie('userID', username)
                    res.cookie('icon', slikica)
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

