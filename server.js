var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

var express = require("express");
var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var row,
  rows = [];
var flowChart = [];
var keyWords = []; //keyWords should always by the groups, and then the topics included in it
var name = "";
var adventurePrompt = "You find yourself sitting at a table in a smoky room, a psychic taking his place on the other end. A crystal ball partially blocks your view of the mysterious mystic, prompting you to comment on the stereotypical nature of the whole set up when he interrupts, 'Who are you?'";

//Each instance of the helpFlow class is a line of help.
//The group is what group the user belongs in. The topic is
//what help the user is looking for. The names are the people
//who can provide help concerning the topic. neverGoTo is a
//warning given to the user telling them who not to go to.
//website is just a simple URL that can offer more help and
//support to the user
function helpFlow(group, topic, names, neverGoTo, website){
  this.group = group;
  this.topic = topic;
  this.names = names;
  this.neverGoTo = neverGoTo;
  this.website = website;
}

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

// Load client secrets from a local file and then call the API
//(it's called getAdventures cause the help is going to be based on a
//text based adventure game, woo!~)
function getAdventures(){
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Google Sheets API.
    authorize(JSON.parse(content), listFlowChart);
  });
}

//Authorization for the API
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
        oauth2Client.credentials = JSON.parse(token);
        callback(oauth2Client);
      }
  });
}

//Calls the Google Sheets API and returns the rows of the spreadsheet in a matrix
//rows is the matrix, and each row should be seen as a line of help.
function listFlowChart(auth) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: '1f7l3uXyHlUlCR8d-ynxoJ4B49EBXcfrpu3tBWgLMkvs',
    range: 'Sheet1!2:38',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    rows = response.values;
    if (rows.length == 0) {
      console.log('No data found.');
    } else {
      for (var i = 0; i < rows.length; i++) {
          row = rows[i];
          flowChart.push(new helpFlow(row[0], row[1], [row[2], row[3], row[4]], row[5], row[6]));
          keyWords.push(row[0]);
          cleanObject(flowChart[i]);
        }
        keyWords = arrayDuplicateRemover(keyWords);
        console.log(keyWords);
    }
  });
}

//Checks if a value is an array
function isInArray(val, array){
  return array.indexOf(val) > -1;
}

//Populates an array with keywords that are needed for the choose your own adventure
function arrayDuplicateRemover(arr){
  arr.sort();
  for ( var i = arr.length; i > 0; i--){
    if ( arr[i] == arr[i-1] ){
      arr.splice(i,1);
    }
   }
   return arr;
}

//Looks for undefined or null properties in the helpFlow object
function cleanObject(obj){
  for ( var propName in obj ){
    if(obj[propName] === null || obj[propName] === undefined || obj[propName] === ''){
      delete obj[propName];
    }
    if(propName == "names"){
      obj[propName] = cleanArray(obj[propName]);
    }
  }
}

//Looks for null, whitespace, or undefined objects inside the array
function cleanArray(arr){
  if(arr == null){
    console.log("No data yet");
  }else{
    for(var i = arr.length; i > 0; i--){
      if(arr[i] == null || arr[i] == '' || arr[i] == "undefined"){
        arr.splice(i,1);
      }
    }
  }
  return arr;
}

//Serve the HTML
app.get('/',function(req,res){
  res.sendFile(__dirname + '/views/index.html');
});
app.use(express.static(__dirname + '/public'));
app.set("views", __dirname + '/views');
app.set('view engine', 'html');

//Start the server listening on port 1337 (l33thaxxor)
http.listen(1337, function(){
  console.log("Server has started listening on PORT 1337 COMMANDAH!");
  getAdventures();
});

io.on('connection', function(socket){
  //initial connection
  console.log('CONNECTION ACCOMPLISHED');
  if ( flowChart.length == 0 ){
    console.log("No data found");
  }else{
    io.emit('adventures', true, adventurePrompt);
  }

  socket.on('progress adventure', function(val){
    if (isInArray(val, keyWords) == true ){
      keyWords = [];
      for ( var i = 0; i <flowChart.length; i++ ){
        if( val == flowChart[i].group ){
          keyWords.push(flowChart[i].topic);
        }else if( val == flowChart[i].topic ){
          keyWords.push(flowChart[i].names);
        }
      }
      keyWords = arrayDuplicateRemover(keyWords);
      io.emit('adventures', keyWords, adventurePrompt);
    }else{
      io.emit('adventures', false, adventurePrompt);
    }
    console.log(keyWords);
  });

  // socket.on('name', function(val){
  //   name = val;
  //   adventurePrompt = "'Hello " + name + "'";
  //   console.log(adventurePrompt);
  //   io.emit('adventures', keyWords, adventurePrompt)
  //   console.log(name);
  // });

  socket.on("disconnect",function(){
    console.log("User disconnected");
  });
});