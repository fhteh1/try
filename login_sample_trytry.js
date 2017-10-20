var express = require('express');
 var session = require('express-session');
 var bodyParser=require('body-parser');
 var MySQLStore = require('express-mysql-session')(session);
 var mysql=require('mysql');
 var multer  = require('multer');
 /*
 var _storage = multer.diskStorage({      //객체
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
*/

var upload = multer({ dest: 'uploads/' })
  var fs=require('fs');
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
  app.set('views','./views_file');
  app.set('view engine','jade');
  app.get('/upload',function(req,res){
    res.render('upload');
  });
  app.post('/upload',upload.single('userfile'),function(req,res){
    res.send('Uploaded : '+req.file.filename);
  });
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


  app.get('/upload',function(req, res){
    res.render('uploadform');
  });
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
     //var user = results[0];
     if(err){
       res.send('query fail <a href="/auth/login">login</a>');

       //return done('There is no user.');
      }
      var user = results[0];
      if(user==null){
        res.send('No User <a href="/auth/login">login</a>');
      }
      else {
           //var user = results[0];
        //return hasher({password:pwd}, function(err, pass, hash){

          if(pwd == user.password){    //user.password
            console.log('LocalStrategy', user);
            req.session.displayName = user.name; //user.name
             res.redirect('/welcome'); ///////////////////////
          } else {
            res.send('Wrong password! <a href="/auth/login">login</a>');
          }
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

/*  upload
app.get('/upload',function(req,res){
  res.render('upload');
});
app.post('/upload',upload.single('userfile'),function(req,res){
  res.send('Uploaded : '+req.file.filename);
});
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


app.get('/upload',function(req, res){
  res.render('uploadform');
});
*/



app.post('/auth/join', upload.single('userfile'), function(req, res){
//  hasher({password:req.body.password}, function(err, pass, salt, hash){
console.log(req.file);
console.log(req.file.filename);
var fname=req.file.filename;
var floc=req.file.destination;
    var user = {
      id:req.body.id,
      //password:hash,
      password:req.body.password,
      name:req.body.username,
      Email:req.body.email,
      phone:req.body.phone,
      //file_name:req.body.userfile,
      //file_location:req.body.userfile
      file_name:fname,
      file_location:floc
    };

    //console.log(req.body.userfile);
    //console.log(req.file.originalname);
    //console.log(req.body.userfile.destination);
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
  <form action="/auth/join" method="post" enctype="multipart/form-data">
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
</p>
<h5>image :
<input type="file" name="userfile" placeholder="userfile" >
</h5>
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
