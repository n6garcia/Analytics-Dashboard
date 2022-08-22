// Imports
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mysql = require("mysql");
const bcrypt = require("bcrypt");

// init express
const app = express();


/* Database Setup */

// DB connect Options
const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'noel',
    password : 'pOpminge43!',
    database : 'login'
});

// Attempt to Connect To DB
db.connect((err) => {
    if(err) {
        throw err;
    }
    console.log("Success DB Connected!");
});


/* Local Strategy */

const authenticateUser = async (username, password, done) => {
    console.log("username: " + username);
    console.log("password: " + password);

    // Potential SQL injection by username
    let sql = `SELECT * FROM users WHERE username = '${username}'`;
    db.query(sql, async (err, result) => {
        if (err) {
            throw err;
        }

        if (result.length != 0){
            const validPassword = await bcrypt.compare(password, result[0].hash);
            
            if (validPassword){
                return done(null, result[0]);
            } else {
                return done(null, false);
            }
        } else {
            return done(null, false);
        }
        
    });
}

passport.use(new LocalStrategy(
    {
        // Form Field var names
        usernameField: "username",
        passwordField: "password"
    },
    authenticateUser
));

// store id as cookie data 
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// fetch user data on server side
passport.deserializeUser((id, done) => { 
    let sql = `SELECT * FROM users WHERE id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        done(null, result[0]);
    });
});


/* Middleware */

// set up reading form vars
app.use(express.urlencoded({ extended: false }))

// auto parse json
app.use(express.json());

// setup static file serving (public folder)
app.use(express.static("public"));

// set up express-session
app.use(session({
    secret : 'my secret',
    resave : false,
    saveUninitialized : false,
    cookie : {
        maxAge: 1000*60*60*24 // one day 
    }
}));

// init passport
app.use(passport.initialize());
app.use(passport.session());

// check if authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("login");
}

// check not authenticated
function ensureNotAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("home");
    }
    next();
}

// check if user has admin rights
function ensureAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.admin){
            return next();
        } else {
            return res.redirect("home");
        }
    }
    res.redirect("login");
}


/* Dashboard Routes */

// GET /authapp 
app.get("/", (req,res) => {
    res.redirect("login");
});

// Public
app.get("/login", ensureNotAuth, function(req, res) {
    // headers to ensure page isn't cached (no back button)
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    
    res.sendFile("pages/login.html", { root : __dirname });
});

// Public
app.post("/login", passport.authenticate('local', 
    { successRedirect : 'home', failureRedirect: 'login'}
));

// In Between
app.get("/logout", ensureAuthenticated, function(req, res){
    // headers to ensure page isn't cached (no back button)
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    // req.logout requires callback? does throw err work?
    req.logout(req.user, err => {
        if(err) throw err;
        res.sendFile("pages/logout.html", { root : __dirname });
    });
});

// Private
app.get("/home", ensureAuthenticated, function(req, res) {
    // headers to ensure page isn't cached (no back button)
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    res.sendFile("pages/home.html", { root : __dirname });
});

// Private
app.get("/report", ensureAuthenticated, function(req, res) {
    // headers to ensure page isn't cached (no back button)
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    res.sendFile("pages/report.html", { root : __dirname });
});

// Private
app.get("/users", ensureAdmin, function(req, res) {
    // headers to ensure page isn't cached (no back button)
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    res.sendFile("pages/users.html", { root : __dirname });
});


/* CRUD Routes */

// GET /authapp/crud
app.get("/crud", (req,res) => {
    let sql = "SELECT * FROM users";
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        }
        
        res.send(result);
    });
});

// POST /authapp/crud
app.post("/crud", async (req,res) => {
    let sql = 'INSERT INTO users '
        + '(username, '
        + 'hash, ' 
        + 'admin) '
        + 'VALUES (?,?,?)';


    hashedPass = await bcrypt.hash(req.body.hash ? req.body.hash : "",10);

    let vars = [req.body.username ? req.body.username : "",
                hashedPass,
                req.body.admin ? req.body.admin : 0];

    db.query(sql, vars, (err, result) => {
        if (err) {
            console.log(err);
        }
        

        let sql = "SELECT * FROM users";
        db.query(sql, (err2, result2) => {
            if (err2) {
                throw err2;
            }
            
            res.send(result2);
        });

    });
});

// DELETE /authapp/crud/{id}
app.delete("/crud/:id", (req,res) => {
    let sql = 'DELETE FROM users WHERE id = ' 
                + req.params.id;
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        }
        console.log(result)
        res.send(result);
    });
});


// PUT /authapp/crud/{id}
app.put("/crud/:id", async (req,res) => {
    let sql = 'UPDATE users SET ' +
                'username = ?,' +
                'hash = ?,' +
                'admin = ? ' +
                'WHERE id =' + req.params.id;

    hashedPass = await bcrypt.hash(req.body.hash ? req.body.hash : "",10);
        
    let vars = [req.body.username ? req.body.username : "",
                hashedPass,
                req.body.admin ? req.body.admin : 0];

    db.query(sql, vars, (err, result) => {
        if (err) {
            console.log(err);
        }
        res.send(result);
    });
});


// start express server
app.listen(3003);