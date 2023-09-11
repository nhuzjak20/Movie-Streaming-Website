//<a target="_blank" href="https://icons8.com/icon/wMubOjl2fqdm/anonymous-mask">Anonymous Mask</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>

const express = require('express');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
const { redirect } = require('express/lib/response');

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


/*db.all('select * from Korisnici',(err, results) => {
    if (err) console.log(err);
    else if(results.length != 0) {
        console.log(results)
        console.log("Ovo gore je tablica korisnika")
    } 
    else console.log('OK'); 
})*/

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
                    res.cookie('userID', username)
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
    if(!req.cookies.userID){
        console.log('No cookies')
        res.redirect('/login?status=NoCookie');
    } else {
        if(req.cookies.userID == 'AdministratorShegy'){
            res.render('admin', {username: 'Shegy', slika: './Anonimus.png'})
            res.end();
            return;
        } else if(ProvjeriKolacic(req.cookies.uniqueID, req.cookies.userID)) {
            const ikonica = (arg)=>{
                switch(arg){
                    case '1': return './Anonimus.png';
                    case '2': return './Naruton.png';
                    case '3': return './Fredi.png';
                    case '4': return './Ironman.png';
                }
            }
            res.render('home', { username: req.cookies.userID, slika: ikonica(req.cookies.icon)})
        } else { res.redirect('/login?status=NoCookie'); }
    }
})

app.get('/upit', (req, res) => {
    var upit = req.query.query
    db.all('CREATE TABLE Objave(naslov VARCHAR(20) NOT NULL,komentar VARCHAR(300) NOT NULL,datum DATETIME NOT NULL,objavio VARCHAR(20) NOT NULL, kategorija VARCHAR(20) NOT NULL);', (err, result) => {
        if(err) {
            console.log(err)
            res.redirect('/')
        } else {
            res.redirect('/?status=uspjesno')
        }
    })
})

app.post('/posaljiobrazac',urlencodedParser ,function(req, res) {
    var currentdate = new Date(); 
    var datetime = currentdate.getDate() + "/" + (currentdate.getMonth()+1)  + "/" + currentdate.getFullYear() + "@"+ currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
    var podaci = [req.body.naslov, req.body.komentar, req.body.kategorija, datetime, req.cookies.userID]
    
    var upit = 'INSERT INTO Objave(naslov, komentar, kategorija, datum, objavio) VALUES (?,?,?,?,?)'
    db.all(upit, podaci, (err, result) => {
        if (err) {
            console.log(err)
            res.redirect('/')
        } else {
            res.redirect('/?status=objavaUspjesna')
        }
    })
})

app.post('/ObjaveApi', urlencodedParser,(req, res) => {
    var upit
    switch(req.body.kategorija){
        case '1' : {
            upit = 'SELECT * FROM Objave WHERE kategorija = ' + 1 + ' ORDER BY datum'
            break
        }

        case '2' : {
            upit = 'SELECT * FROM Objave WHERE kategorija = ' + 2 + ' ORDER BY datum' 
            break
        }

        case '3' : {
            upit = 'SELECT * FROM Objave WHERE kategorija = ' + 3 + ' ORDER BY datum'
            break
        }
        case '4' : {
            upit = 'SELECT * FROM Objave WHERE kategorija = ' + 4 + ' ORDER BY datum'
            break
        }
        case '5' : {
            upit = 'SELECT * FROM Objave ORDER BY datum'
            break
        }
    }
    var rezultat = ``
    console.log(upit)
    db.all(upit, (err, result) => {
        if(err) res.send(`<h3>Error: ${err.message}</h3>`);
        else {
            result.forEach((value, key) => {
                rezultat+= `=<div>
                <div>
                    <h5>${value.naslov}</h5>
                    <h5>${value.objavio}</h5>
                </div>
                <div>
                    <p>${value.komentar}</p>
                </div>
                <div>
                    <p>${value.lajkovi}</p>
                    <button>Lajkaj</button>
                    <p>${value.datum}</p>
                </div>
            </div>`
            })
            res.send(rezultat)
        }   
    })
})

app.get('/odjava', (req, res) => {
    res.clearCookie('uniqueID')
    res.clearCookie('user')
    res.clearCookie('userID')
    res.redirect('/login?status=LoggedOut')
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
                    res.redirect('/odaberisliku')
                }
            })
        } 
    })  
})

app.get('/odaberisliku', (req, res) => {
    if(!req.cookies.userID){
        console.log('No cookies')
        res.redirect('/login?status=NoCookie');
    } else {
        res.render('imageSelect', {username: req.cookies.userID})
    }
})



app.get('/imageSelectRoute', (req, res) =>{
    const user = req.cookies.userID
    console.log(req.query.num)
    console.log("Radi image Select")
    db.all('UPDATE Korisnici SET icon=? WHERE username=?',[req.query.num, user], (err, result) =>{
        if(err) {
            console.log(err)
        } else {
            console.log(result)
            res.cookie('icon', req.query.num)
            res.redirect('/')
        }
    })
})

app.listen(5000, ()=>{
    console.log("Server radi")
})

"CREATE TABLE Korisnici (	id INT PRIMARY KEY IDENTITY(1,1),	username VARCHAR(20) NOT NULL,pass VARCHAR(20),icon NVARCHAR(MAX));"

