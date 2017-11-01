var socket = io.connect('http://localhost:1337');
var input = document.getElementById("myinput");
var firstTime = true;
var flowChart = [];
var keyWords = [];
var groups = [];
var topics = [];
var names = [];
var state;

$(document).ready(function(){
    var input = document.getElementById("myinput");
    var awesomplete = new Awesomplete(input);
    var adventurePrompt = document.getElementById("adventure_prompt");
    var name;
    socket.on('adventures', function(val){
        flowChart = val;
    });

    $('form').submit(function(){
        if ( $('#myinput').val() == "help"){
            $(adventurePrompt).append("<br>" + "This is a general self-help website designed for IMA in the style of a text-based adventure game. Some useful commands are 'reset', which can be inputted as the shortcut 'r'." + "<br>");
        }

        else if( $('#myinput').val() == "reset" || $('#myinput').val() == "r" ){
            if( firstTime == false ){
                $(adventurePrompt).append("<br>" + "'Hello again " + name +", do you have a different question?'" + '<br>');
            }else{
                $(adventurePrompt).append("<br>" + "You find yourself sitting at a table in a smoky room, a psychic taking his place on the other end. A crystal ball partially blocks your view of the mysterious mystic, prompting you to comment on the stereotypical nature of the whole set up when he interrupts, 'What is your name?'" + '<br>');
            }
        }

        else if (firstTime == true){
            name = $('#myinput').val();
            $(adventurePrompt).append("<br>" + "'Hello " + name +", are you one of the students? Or someone else?'" + '<br>');
            for ( var i = 0; i < flowChart.length; i++ ){
                groups.push(flowChart[i].group);
            }
            groups = arrayDuplicateRemover(groups);
            awesomplete.list = groups;
            firstTime = false;
        }

        else if( isInArray($('#myinput').val(), groups) == true){
            group = $('#myinput').val();
            $(adventurePrompt).append("<br>" + "'Ahh I see you are part of the " + group + "." + " What do you have a question about?'" + "<br>");
            for( var i = 0; i < flowChart.length; i++){
                if ( group == flowChart[i].group ){
                    topics.push(flowChart[i].topic);
                }
            }
            awesomplete.evaluate();
            awesomplete.list = topics;
        }

        else if( isInArray($('#myinput').val(), topics) == true){
            topic = $('#myinput').val();
            $(adventurePrompt).append("<br>" + "'Ahh a question about " + topic + ".'" + "<br>");
            for( var i = 0; i < flowChart.length; i++){
                if ( group == flowChart[i].group && topic == flowChart[i].topic){
                    console.log(flowChart[i].website);
                    if ( flowChart[i].names.length == 1 ){
                        $(adventurePrompt).append("You must first go to " + flowChart[i].names + "<br>");
                      } else if( flowChart[i].names.length == 2 ){
                        $(adventurePrompt).append("You must first go to " + flowChart[i].names[0] + ". And if they are occupied go to " + flowChart[i].names[1] + "." + "<br>");
                      } else if( flowChart[i].names.length == 3 ){
                        $(adventurePrompt).append("You must first go to " + flowChart[i].names[0] + ". And if they are occupied go to " + flowChart[i].names[1] + ". And finally try " + flowChart[i].names[2] + "." + "<br>");
                      } else if( flowChart[i].names.length == 4 ){
                        $(adventurePrompt).append("You must first go to " + flowChart[i].names[0] + ". And if they are occupied go to " + flowChart[i].names[1] + ". And finally try " + flowChart[i].names[2] + "." + "But, never got to " + flowChart[i].names[3] + "." + "<br>");
                      }
                    if ( flowChart[i].website != undefined || flowChart[i].website != null ){
                        $(adventurePrompt).append("<br>" + "For more information go to this website: " + "<a href = '" + flowChart[i].website + "'>" + flowChart[i].website + "</a>" + "<br>");
                    }
                }
            }
        }



        else{
            $(adventurePrompt).append("<br>" + "I don't understand." + "<br>");
        }

        $('#myinput').val('');
        return false;
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
});

