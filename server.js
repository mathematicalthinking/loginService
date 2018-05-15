var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http');
var needle = require('needle');
var cookies = require('cookie-parser');

app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use( cookies() );

const LOGIN_COOKIE = 'loginSessionUser';

app.get('/', function (req, res) {
  res.send('Hello World!');
});

//app.get('/login', function (req, res) {
app.get('/NCTM-TMF-Login-Page', function (req, res) {
  //console.log('Login, then go back to ' + req.params.returnUrl );
  var loggedInUser = req.cookies[LOGIN_COOKIE];

  if( loggedInUser ){
    var redirectUrl = req.query.SsoReturnUrl + '?token=s87af97auo8fj9' + "&tmfUserName=" + loggedInUser;
    console.log("found cookie, sending back to " + redirectUrl);
    res.redirect( redirectUrl );
    return;
  }

  console.log('Login, then go back to ' + req.query.SsoReturnUrl );
  res.render('login', { message: 'Login in so you can go back to ' + req.query.SsoReturnUrl, redirect: req.query.SsoReturnUrl});
});

app.post('/doLogin', function(req,res) {
  var username = req.body.username;
  var pass = req.body.password;
  console.log( "Login attempt by " + username + " with pass: " + pass );
  console.log( "Need to send them to: " + req.body.redirectUrl);
  var token = 's87af97auo8fj9';
  res.cookie( LOGIN_COOKIE, username );
  //res.redirect( req.body.redirectUrl + "?token=" + token + "&userId=" + username  );
  var redirectUrl = req.body.redirectUrl + "?token=" + token + "&tmfUserName=" + username;
  //console.log("NEED AN ACCOUNT LINK: " + redirectUrl );
  //var tempRedirect ="http://localhost:8080/products/fulfiller/linkNctmAccount.htm?redirectUrl=" + encodeURIComponent(redirectUrl); 
  //console.log("Link redirect: " + tempRedirect );
  //res.redirect( tempRedirect  );
  res.redirect( redirectUrl );
});

app.post('/SSO/TmfCheckToken.ashx', function(req, res) {
  var token = req.body.token;

  console.log("Validating token " + token);
  if( token === 's87af97auo8fj9' ){
    res.send('<status>Success</status>');
  } else {
    res.send('failed');
  }
});

app.post('/linkTmf', function(req, res){
  var nctmUserId = req.body.nctmId;
  var tmfUserName = req.body.tmfId;

  console.log("Recieved link for " + nctmUserId + " to " + tmfUserName );

  res.sendStatus(200);
});

app.get('/logout', function(req, res){
  res.clearCookie( LOGIN_COOKIE );
  needle.get('http://localhost:8080/pows/logout.htm?token=s87af97auo8fj9&tmfUserName=arm353', function(error, response) {
    console.log("Send get request to pow logout " + response.statusCode );
    console.log(response.body);
  });

  console.log("returning to pows");
  res.redirect("http://localhost:8080/");
});

function handleError( req ){
  req.on('error', function(e) {
    console.log('ERROR: ' + e.message);
  });
}

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
