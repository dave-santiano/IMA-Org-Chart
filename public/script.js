var socket = io.connect('http://localhost:1337');
var input = document.getElementById("myinput");
var flowChart = [];
var groups = [];
var topics = [];
var names = [];

$(document).ready(function(){
    var input = document.getElementById("myinput");
    var awesomplete = new Awesomplete(input);
    var adventurePrompt = document.getElementById("adventure_prompt");
    var name;

    focusOnInput();


    socket.on('adventures', function(val){
        flowChart = val;
        for ( var i = 0; i < flowChart.length; i++ ){
            groups.push(flowChart[i].group);
        }
        groups = arrayDuplicateRemover(groups);
        awesomplete.list = groups;
    });



    $('form').submit(function(){

        $(adventurePrompt).append("<br>>>" + $('#myinput').val());
        if ( $('#myinput').val().toLowerCase() == "help"){
            $(adventurePrompt).append("<br>" + "This is a general self-help website designed for IMA in the style of a text-based adventure game. Just start typing and the auto-complete can give you suggestions if you are unsure. Some useful commands are 'reset', which can be inputted as the shortcut 'r'. If you have a suggestion for new topics that can be covered, please submit one here: www.placeholder.gov" + "<br>");
        }

        else if( $('#myinput').val().toLowerCase() == "reset" || $('#myinput').val().toLowerCase() == "r" ){
            $(adventurePrompt).append("<br>" + "'Hello again, do you have a different question?" + "Maybe about another group?'" + '<br>');
            for ( var i = 0; i < flowChart.length; i++ ){
                groups.push(flowChart[i].group);
            }
            topics = [];
            groups = arrayDuplicateRemover(groups);
            awesomplete.evaluate();
            awesomplete.list = groups;
        }

        else if( isInArray($('#myinput').val().toLowerCase(), groups) == true){
            group = $('#myinput').val().toLowerCase();
            for( var i = 0; i < flowChart.length; i++ ){
                if ( group == flowChart[i].group ){
                    topics.push(flowChart[i].topic);
                }
            }
            var capitalizedGroup = capitalizeFirstLetter(group);
            $(adventurePrompt).append("<br>" + "'" + capitalizedGroup + "? Interesting... "
            + " What do you have a question about?'" + "<br>");
            awesomplete.evaluate();
            awesomplete.list = topics;
        }

        else if( isInArray($('#myinput').val().toLowerCase(), topics) == true){
            topic = $('#myinput').val().toLowerCase();
            $(adventurePrompt).append("<br>" + "'Ahh a question about " + topic + ".'" + "<br>");
            console.log("group: " + group);
            console.log("topic: " + topic);
            for( var i = 0; i < flowChart.length; i++){
                if ( group == flowChart[i].group && topic == flowChart[i].topic){
                    if ( flowChart[i].names.length == 1 ){
                        $(adventurePrompt).append("'You must go to " +
                        flowChart[i].names + ".'<br>");
                      } else if( flowChart[i].names.length == 2 ){
                        $(adventurePrompt).append("'You must first go to " +
                        flowChart[i].names[0] + ". And if they are occupied go to " +
                        flowChart[i].names[1] + ".'<br>");
                      } else if( flowChart[i].names.length == 3 ){
                        $(adventurePrompt).append("'You must first go to " +
                        flowChart[i].names[0] + ". And if they are occupied go to " +
                        flowChart[i].names[1] + ". And finally try " +
                        flowChart[i].names[2] + ".'<br>");
                      }else{
                        console.log("No names present.");
                      }
                    if( flowChart[i].neverGoTo != undefined ){
                        $(adventurePrompt).append("<br>" +
                        "'BUT! Never go to " +
                        flowChart[i].neverGoTo + ".'<br>");
                    }
                    if ( flowChart[i].website != undefined ){
                        $(adventurePrompt).append("<br>" + "For more information go to this website: " +
                        "<a href = '" + flowChart[i].website + "'>" +
                        flowChart[i].website + "</a>" + "<br>");
                        $(adventurePrompt).append("");
                    }
                }
            awesomplete.evaluate();
            awesomplete.list = [];
            topics = [];
            }
        }else{
            $(adventurePrompt).append("<br>" + "I don't understand." + "<br>");
        }
        adventurePrompt.scrollTop = adventurePrompt.scrollHeight;
        $('#myinput').val('');
        return false;
    });


});

function arrayDuplicateRemover(arr){
  arr.sort();
  for ( var i = arr.length; i > 0; i--){
    if ( arr[i] == arr[i-1] ){
      arr.splice(i,1);
    }
   }
   return arr;
}

function isInArray(val, array){
  return array.indexOf(val) > -1;
}

function capitalizeFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function focusOnInput(){
     document.getElementById("myinput").focus();
}