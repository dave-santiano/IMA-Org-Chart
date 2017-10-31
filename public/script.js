var socket = io.connect('http://localhost:1337');
var row = [];
var input = document.getElementById("myinput");
var selections = [];
var firstTime = true;
var oldSelection;

$(document).ready(function(){
    var input = document.getElementById("myinput");
    var awesomplete = new Awesomplete(input);
    var adventurePrompt = document.getElementById("adventure_prompt");
    var name;

    $('form').submit(function(){
        if (firstTime == true){
            name = $('#myinput').val();
            $(adventurePrompt).append("<br>" + "<br>" + "'Hello " + name +", are you one of the students? Or someone else?'" + '<br>' + '<br>');
            socket.emit('progress adventure', '|')
            firstTime = false;
        }else{
            socket.emit('progress adventure', $('#myinput').val());
        }
        $('#myinput').val('');
        return false;
    });

    socket.on('adventures', function(selections, prompt){
        if ( selections != false ){
            awesomplete.list = selections;
            if( prompt ){
                $(adventurePrompt).append(prompt + '<br>' + '<br>');
            }
        }else{
            $(adventurePrompt).append("I don't understand." + '<br>' + '<br>');
        }
    });
});
