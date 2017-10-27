var express = require('express');
 var session = require('express-session');
 var bodyParser=require('body-parser');
 var MySQLStore = require('express-mysql-session')(session);
 var mysql=require('mysql');
 var multer  = require('multer');
 //var serveStatic = require('serve-static')


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
////////////공백검사 함수 ///오류// 사용자 정의 모듈...?
var blankCheck=function(str){
   for(i=0; i<str.lenght();i++){
     if(str.charAt(i)==' '){
       return true;
     }
   }
  return false;
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
});
var upload = multer({ storage: storage });
//var upload = multer({ dest: 'uploads/' })
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
 app.use(express.static('uploads'));    /////////////fggdfgdfg
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
  delete req.session.file_location;
  delete req.session.file_name;
  res.redirect('/welcome');
});
app.get('/welcome', function(req, res){
  if(req.session.displayName) {
console.log(req.session.file_location);
      console.log(req.session.file_name);
    var imagefile="/"+req.session.file_name;
    res.send(`
      <h1>Hello, ${req.session.displayName}</h1>
      <img src=${req.session.file_name}>
      <p>
      <a href="/auth/logout">logout</a>
      </p>
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
            req.session.file_location = user.file_location;
            req.session.file_name = user.file_name;
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
      <input type="submit" value="Log In"> <input type="button" value="Join" onclick="movepage()">
    </p>
    <script type="text/javascript">
      function movepage(){
        location.href="/auth/join";
      }
      </script>
  </form>
  `;
  res.send(output);
});



app.post('/auth/join', upload.single('userfile'), function(req, res){
  var uname = req.body.id;
  var pwd = req.body.password;

  if(req.body.id==null || req.body.password==null || req.body.username==null ||
  req.body.email==null || req.body.phone==null || req.file==null){
    res.send('There should be no empty space <a href="/auth/join">join</a>');
  }
  else if(blankCheck(req.body.id)==true){
    res.send('There should be no empty space in id<a href="/auth/join">join</a>');
  }
  else if(blankCheck(req.body.password)==true){
    res.send('There should be no empty space in password<a href="/auth/join">join</a>');
  }
  else if(blankCheck(req.body.username)==true){
    res.send('There should be no empty space in username<a href="/auth/join">join</a>');
  }
  else if(blankCheck(req.body.email)==true){
    res.send('There should be no empty space in email<a href="/auth/join">join</a>');
  }
  else if(blankCheck(req.body.phone)==true){
    res.send('There should be no empty space in phone number<a href="/auth/join">join</a>');
  }
  else if(blankCheck(req.body.file.originalname)==true){
    res.send('There should be no empty space in id<a href="/auth/join">join</a>');
  }
  else{
    var sql = 'SELECT * FROM login WHERE id=?';

    conn.query(sql, [uname], function(err, results){
     //var user = results[0];
     if(err){
       res.send('query fail <a href="/auth/login">login</a>');

       //return done('There is no user.');
      }
      var user = results[0];
      if(user==null){
        console.log(req.file);
        console.log(req.file.filename);
        var fname=req.file.originalname;
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
        var sql = 'INSERT INTO login SET ?';
        conn.query(sql, user, function(err, results){
              if(err){
                console.log(err);
                res.status(500);
              } else {
                res.redirect('/welcome');

              }

        });

      }
      else {
        res.send('Already there is User <a href="/auth/join">join</a>');
      }

  });
  }

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
