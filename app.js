
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var flash    = require('connect-flash');
var users = {};
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server,{log: false });


// sending email
var dotenv = require('dotenv');
dotenv.load();

var nodemailer = require('nodemailer');
var smtpapi    = require('smtpapi');

var sendgrid_username   = 'sendGridEmailer';
var sendgrid_password   = 'password';
var fromSender          = 'tcscharlottelab@tcs.com';

// Build the smtpapi header
var header = new smtpapi.Header();
header.addSubstitution('%how%', ['Owl']);

// Add the smtpapi header to the general headers
var headers    = { 'x-smtpapi': header.jsonString() };

// Use nodemailer to send the email
var settings  = {
  host: "smtp.sendgrid.net",
  port: parseInt(587, 10),
  requiresAuth: true,
  auth: {
    user: sendgrid_username,
    pass: sendgrid_password 
  }
};
var smtpTransport = nodemailer.createTransport("SMTP", settings);
//

server.listen(process.env.PORT || 5000);

// all environments
//app.set('port', process.env.PORT || 3000);
app.set('views', __dirname, '/views');
app.set('view engine', 'ejs');






app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(app.router);
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://heroku:97aa100aa71b190805c41b70bed0e20b@troup.mongohq.com:10097/app22192444');
//mongoose.connect('mongodb://root:root@novus.modulusmongo.net:27017/qy7nyXog');


var Schema = new mongoose.Schema({
	
	id     : Number,
	name   : String,
	from   : Date,
	to     : Date,
	reason : String,
	mc     : Number
	
});
var User = mongoose.model('reservation',Schema);


var Schema = new mongoose.Schema({
	
	id     : Number,
	
});
var likeDB = mongoose.model('like',Schema);



io.sockets.on('connection', function(socket){
	socket.on('new user', function(mcNumber, fromDate, toDate, callback){
		//console.log("fromDate=" + fromDate);
		//console.log("ToDate= " + toDate);
		//console.log(mcNumber);
		//User.find({to: {"$gte":fromDate},from: {"$lte":toDate},mc: mcNumber},function(err,docs){
		User.find({to: {"$gte":fromDate},from: {"$lte":toDate},mc: mcNumber}).sort({from:1}).exec(function(err,docs){
			if(err) console.log(err);
			if(!docs){
				callback(false);
			}
			else {
				//docs.sort({from: 1});
				callback(true);
				docs.forEach( function(doc){
					//console.log(doc.from)
					socket.emit('usernames',{timeFrom: doc.from.toString(), timeTo: doc.to.toString()});
				});
			}
			
			
		
		});
	});
	



	
	socket.on('feedback', function(name, empID, feedback1, callback){
		
		new feedBack({
			id : empID,
			name : name,
			feedback : feedback1,
			postedON : new Date()
			
		}).save(function(err,doc){
			if(err) {
				console.log(err);
				callback(false);
			}
			else {
				callback(true);
				socket.emit('thanks',{message: "Your feedback is successfully recorded"});
			}
		});
	});
	
	socket.on('like', function(callback){
		likeDB.findOne(function(err,doc){
			if(err) console.log(err);
			if(!doc) {
				new likeDB({
					id : 1
					
				}).save(function(err,doc){
					if(err) {
						console.log(err);
						callback(false);
					}
					else {
						callback(true);
						socket.emit('thankYou',{message: "Thank You"});
					}
				});
			
			}
			if(doc){
				var updatedLikeCount = doc.id + 1;
				//console.log(updatedLikeCount);
				
				likeDB.update({id: doc.id},{$set: {id: updatedLikeCount}},function(err){
						
					if(err) {
						callback(false);
						console.log(err);
					}
					else{
						callback(true);
						socket.emit('thankYou',{message: "Thank You"});
					}
				});
				
			}
		
		});
	});
	
});

var Schema = new mongoose.Schema({
	
	EmployeeID : String,
	password   : String,
	EmailID   	: String,
	FullName    : String

	
},{ collection : 'charlottelabauthentication' });
	
var CLTlab = mongoose.model('charlottelabauthentication',Schema);








app.post('/new',function(req,res){
	
	//User.findOne({to: {"$gt":req.body.from},from: {"$lt":req.body.to},id: req.body.id},function(err,docs){
	User.findOne({to: {"$gt":req.body.from},from: {"$lt":req.body.to},id: req.body.empID},function(err,docs){
		//console.log(req.body.empID);
		if(err){
			console.log(err);
			res.end("There is some DB system error");
		}
		if(docs){
			//console.log(docs);
			//console.log("already have a machine");
			res.render("./views/index_already_have_another_reservation",{R:docs});
		}
		else {
			//console.log(docs);
			User.findOne({to: {"$gt":req.body.from},from: {"$lt":req.body.to},mc: req.body.mc},function(err,user){
			if (err) {
				console.log(err);
				res.end("There is some DB system error");
			}
			if(user) {
				//console.log(user);
				res.render("./views/index_no_slot",{R:user});
			}
			else{
				
				
				//console.log("From_reservation =" + req.body.from);
				//console.log("To_reservation =" + req.body.to);
				
				
				new User({
							
							id   : req.body.empID,
							name : req.body.name,
							from : req.body.from,
							to   : req.body.to,
							reason : req.body.reason,
							mc     : req.body.mc
						}).save(function(err, doc){
							if(err) {
							console.log(err);
								res.end("There is some system error");
							}
								
								else {
									console.log(doc.from);
									var emp = (req.body.empID).toString();
									htmlBody = "Dear "+ req.body.name+ ",<br><br> Your reservation has been confirmed.<br> M/C# <strong>" + req.body.mc + "</strong>"+". " + " FROM : <u>" + req.body.from + "</u> TO : <u>" + req.body.to +"</u>.";
									htmlBody = htmlBody + "<br><br>Thanks,<br> TCS Charlotte Lab Team.<br><br>P.S. This is system-generated email. Please do not reply."; 
									CLTlab.findOne({employeeID : emp },function(err,docs){
										if(err) console.log(err);
										if(docs) {
											//console.log("Entered");
											
											//console.log(docs.EmailID);
											
											if (docs.EmailID) {
											
												var mailOptions = {
												  from:     fromSender,
												  to:       docs.EmailID,
												  subject:  "Reservation Confirmation",
												  text:     "hello",
												  html:     htmlBody,
												  headers:  headers
												}
												
												
												smtpTransport.sendMail(mailOptions, function(error, response) {
												smtpTransport.close();

													if (error) { 
														console.log(error);
													} else {
														console.log("Message sent: " + response.message);
													}
												});
											}
											else{
												console.log("Can't send email since email ID is not present");
											}
										}
										
										if(!docs){
											console.log("Can't send email since records is not present in Collection");
										}
										//res.render("./views/index_successful_reservation",{R: doc, f: req.body.from, t: req.body.to});
									});
									res.render("./views/index_successful_reservation",{R: doc, f: req.body.from, t: req.body.to});
								}
						});
				}
			});
			
		}

	});
});

var feedSchema = new mongoose.Schema({
	id       : Number,
	name     : String,
	feedback : String,
	postedON : Date
	
	
});



var feedBack = mongoose.model('feedBack',feedSchema);


/*
app.post('/feedback',function(req,res){
	
	new feedBack({
		id : req.body.empID,
		name : req.body.name,
		feedback : req.body.feedback,
		postedON : new Date()
		
	}).save(function(err,doc){
		if(err) console.log(err);
		else
			res.render("./views/Thanks");
	});
});

	


app.get('/dateError1',function(req,res){
	res.render('login.ejs');
});
*/
app.get('/',function(req,res){
	res.render('./views/index');
});
var aboutDate = new Date(2014,02,16,23,59,00,00);

app.get('/about',function(req,res){
	var newDate = new Date();
	res.render('./views/about',{msg: aboutDate.toString()}) ;
});

/*
app.get('/reserveBack',function(req,res){
	
	res.render('./views/index');
});
*/	

/*
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
*/