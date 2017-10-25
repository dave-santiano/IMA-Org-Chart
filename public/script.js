var socket = io.connect('http://localhost:1337');
var row = [];
var input = document.getElementById("myinput");
var selections = [];
var oldSelection;

$(document).ready(function(){
    var input = document.getElementById("myinput");
    var awesomplete = new Awesomplete(input);
    var adventurePrompt = document.getElementById("adventure_prompt");

    $('form').submit(function(){
        socket.emit('progress adventure', $('#myinput').val());
        $('#myinput').val('');
        return false;
    })

    socket.on('adventures', function(selection){
        if (selection == oldSelection){}
        else{
            selections.push(selection);
        }
        oldSelection = selection;
        awesomplete.list = selections;
    });
});
