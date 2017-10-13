var express = require('express');
 var session = require('express-session');
 var bodyParser=require('body-parser');
 var MySQLStore = require('express-mysql-session')(session);
 var mysql=require('mysql');
 var bkfd2Password = require("pbkdf2-password");
var passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var hasher = bkfd2Password();

 var conn=mysql.createConnection({
   host : 'localhost',
   user : 'root',
   password : '111111',
   database : 'TestLOGIN'
 });

 var app = express();
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(session({
    secret: '1234DSFs@adf1234!@#$asd',
    resave: false,
    saveUninitialized: true,
    store:new MySQLStore({
      host:'localhost',
      port:3306,
      user:'root',
      password:'111111',
      database:'TestLOGIN'
    })
  }));
 app.get('/count', function(req, res){
   if(req.session.count) {
     req.session.count++;
   } else {
     req.session.count = 1;
   }
   res.send('count : '+req.session.count);
 });
app.get('/auth/logout',function(req,res){
  delete req.session.displayName;
  res.redirect('/welcome');
});
app.get('/welcome', function(req, res){
  if(req.session.displayName) {
    res.send(`
      <h1>Hello, ${req.session.displayName}</h1>
      <a href="/auth/logout">logout</a>
    `);
  } else {
    res.send(`
      <h1>Welcome</h1>
       <ul>
         <li><a href="/auth/login">Login</a></li>
         <li><a href="/auth/join">join</a></li>
       </ul>
    `);
  }
});
///
/*
passport.serializeUser(function(user, done) {
   console.log('serializeUser', user);
   done(null, user.authId);
 });
 passport.deserializeUser(function(id, done) {
   console.log('deserializeUser', id);
  var sql = 'SELECT * FROM users WHERE authId=?';
  conn.query(sql, [id], function(err, results){
    if(err){
      console.log(err);
      done('There is no user.');
    } else {
      done(null, results[0]);
     }
  });
 });
 passport.use(new LocalStrategy(
   function(username, password, done){
     var uname = username;
     var pwd = password;

    var sql = 'SELECT * FROM users WHERE authId=?';
    conn.query(sql, ['local:'+uname], function(err, results){
      if(err){
        return done('There is no user.');
       }
      var user = results[0];
      return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
        if(hash === user.password){
          console.log('LocalStrategy', user);
          done(null, user);
        } else {
          done(null, false);
        }
      });
    });
   }
 ));
 */
///
app.post('/auth/login', function(req, res){
    var uname = req.body.id;
    var pwd = req.body.password;

   var sql = 'SELECT * FROM login WHERE id=?';
   conn.query(sql, [uname], function(err, results){
     if(err){
       res.send('No Data <a href="/auth/login">login</a>');
      }
     var user = results[0];
     //return hasher({password:pwd}, function(err, pass, hash){
       if(pwd === user.password){
         console.log('LocalStrategy', user);
         req.session.displayName = user.name;
          res.redirect('/welcome'); ///////////////////////
       } else {
         res.send('No Data <a href="/auth/login">login</a>');
       }
     });
   });

app.get('/auth/login', function(req, res){
  var output = `
  <h1>Login</h1>
  <form action="/auth/login" method="post">
    <p>
      <input type="text" name="id" placeholder="id">
   </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="submit" value="Log In">  <input type="submit" value="Join">
    </p>
  </form>
  `;
  res.send(output);
});

app.post('/auth/join', function(req, res){
//  hasher({password:req.body.password}, function(err, pass, salt, hash){
    var user = {
      id:req.body.id,
      //password:hash,
      password:req.body.password,
      name:req.body.username,
      Email:req.body.email,
      phone:req.body.phone
    };
    var sql = 'INSERT INTO login SET ?';
    conn.query(sql, user, function(err, results){
      if(err){
        console.log(err);
        res.status(500);
      } else {
        res.redirect('/welcome');

      }
    });
    // req.login(user, function(err){
    //   req.session.save(function(){
    //     res.redirect('/welcome');
    //   });
    // });
//  });
});
app.get('/auth/join', function(req, res){
  var output = `
  <h1>Join</h1>
  <form action="/auth/join" method="post">
    <p>
      <input type="text" name="id" placeholder="id">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="text" name="username" placeholder="username">
    </p>
    <input type="text" name="email" placeholder="email">
  </p>
  <input type="text" name="phone" placeholder="phone">
</p>
    <p>
      <input type="submit" value="submit">
    </p>
  </form>
  `;
  res.send(output);
});

 app.listen(3003, function(){
   console.log('Connected 3003 port!!!');
 });
