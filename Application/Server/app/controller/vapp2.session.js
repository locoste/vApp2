const uuid = require('uuid/v4')
var session = require('express-session');
var cookieParser = require('cookie-parser');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var request = require('../database/requestToDatabase.js')

	passport.use(new LocalStrategy(
		{ usernameField: 'email' },
		(email, password, done) => {
		var query = 'SELECT * FROM users;'	
		request.getRequestdb(query, function(result){
			for (var i = 0; i < result.length; i++){
				if(result[i].login==email && result[i].password==password){
					var user = '{"id":' + result[i].user_id + ',"email":"' + result[i].email + '", "login":"' + result[i].login + '", "password":"' + result[i].password + '", "role":"'+result[i].role+'"}';
					console.log('user: '+user)
					return done(null, JSON.parse(user));
				}
			}
		});
		  console.log('Local strategy returned true')
		}
	));

	// tell passport how to serialize the user
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		var query = 'SELECT * FROM users WHERE user_id = ' + id;
		request.getRequestdb(query, function(result){
			if (result[0].user_id === id){
				var user='{"id":'+result[0].user_id+', "login":"'+result[0].login+'","password":"'+result[0].password+'","customer":'+result[0].customer+',"role":"'+result[0].role+'"}'
				var user =  JSON.parse(user);
			} else {
				var user = false;
			}
			done(null, user);
		})
	});

    exports.redirecting = function(req, res) {
    	console.log('go Home page');
    	res.redirect('/Vapp2/Accueil.html');
    }

    exports.loginUser = function(req, res, next){
    	console.log('Inside POST /login callback') // 1
    	passport.authenticate('local', (err, user, info) => {
	    /*console.log('Inside passport.authenticate() callback'); //2
	    console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`) // 3*/
	    console.log(`req.user: ${JSON.stringify(req.user)}`) // 4
	    req.logIn(user, (err) => {
	      console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`) //7
	      console.log(`req.user: ${JSON.stringify(req.user)}`) // 8
	      //console.log('expires: ' + req.session.cookie.expires)
	      //console.log('req.session:' + JSON.stringify(req.session))
	      if(err) {console.log('err on login');return next(err);}
	      req.session.save(() => {console.log('save');})
	    })
	  })(req, res, next);
    }

    exports.logoutUser = function(req, res) {
    	console.log('logout')
    	/*req.session.cookie.expires = new Date(Date.now());
    	req.user = undefined;
    	req.session.passport = {}*/
    	req.logOut();
    	/*req.session.destroy();*/
    	req.session.save(() => {console.log('save');})
    	res.redirect('/');
    }

    exports.authrequired = function(req, res, next){
	    /*console.log('Inside GET /authrequired callback')*/
	    /*
	    console.log(req.session.passport)
	    console.log(req.session.cookie._expires.toString())*/
	    if(req.isAuthenticated()){
	      return next();
	    }
	    console.log('redirect to login.html');
    	res.redirect('/login.html')
    }