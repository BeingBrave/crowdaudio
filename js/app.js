import '../css/app.scss';
import $ from "jquery";
import Player from './player';
import Sync from './sync';
import Network from './network';

$(function() {
    var img = new Image();
    img.src = "http://images.clipartpanda.com/speaker-clipart-speaker9.png";

    let sync = new Sync("/sync");
    sync.start();
    let network = new Network();
    let player = new Player(sync);

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var canvasOffset = $("#canvas").offset();
    var offsetX = canvasOffset.left;
    var offsetY = canvasOffset.top;
    var isDragging = false;
    var canMouseX, canMouseY;
    var isDirty = true;
    var selectedId = network.getId();

    function handleMouseDown(e) {
        updateSelected(e);
        // set the drag flag
        isDragging=true;
    }

    function handleMouseUp(e) {
        // clear the drag flag
        isDragging=false;
    }

    function handleMouseOut(e){ isDragging = false; }

    function handleMouseMove(e){
        if(isDragging) updateNode(e);
    }


    function handleClick(e) {
        updateSelected(e);
    }

    function updateSelected(e) {
        if(!network.isAdmin()) return;

        canMouseX = parseInt(e.clientX-offsetX);
        canMouseY = parseInt(e.clientY-offsetY);
        var x = canMouseX/canvas.width;//x value between 0-1
        var y = canMouseY/canvas.height;//y value between 0-1
        var node = network.findNodeByCoord(x, y);

        if(node != null) selectedId = node.id;
    }

    function handleTapDown(e) {
        updateSelected(e);
    }

    function handleTapMove(e) {
        e.preventDefault();
        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        var elm = $(this).offset();
        var x = touch.pageX - elm.left;
        var y = touch.pageY - elm.top;
        if(x < $(this).width() && x > 0){
            if(y < $(this).height() && y > 0){
                updateNode({
                    clientX: touch.pageX,
                    clientY: touch.pageY
                });
            }
        }
    }

    function updateNode(e){
        canMouseX = parseInt(e.clientX-offsetX);
        canMouseY = parseInt(e.clientY-offsetY);
        var selectedNode = network.findNodeById(selectedId);
        if(selectedNode != null) {
          selectedNode.x = canMouseX/canvas.width;
          selectedNode.y = canMouseY/canvas.height;
          network.updateNode(selectedNode);
        }
    }

    function redraw() {
        if(!isDirty) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var imageWidth = 0.1 * canvas.width;
        var imageHeight = 0.1 * canvas.height;

        var nodes = network.getNodes();
        for(var nodeId in nodes) {
            if(!nodes.hasOwnProperty(nodeId)) continue;
            var node = nodes[nodeId];
            var pixelX = node.x*canvas.width;
            var pixelY = node.y*canvas.height;

            ctx.drawImage(img, pixelX-imageWidth/2,pixelY-imageHeight/2, imageWidth, imageHeight);
            ctx.fillText(node.id, pixelX - imageWidth/2, pixelY + imageHeight, imageWidth);
        }

        isDirty = false;
    }

    function handleResize(e) {
        var size = window.innerHeight <= window.innerWidth ? window.innerHeight : window.innerWidth;
        canvas.width = size - 20;//takes smallest value and makes square
        canvas.height = size - 20;

        $("#canvas").css('margin-left',-(canvas.width/2)+ "px");//canvas is red box
        $("#canvas").css('margin-top',-(canvas.height/2)+ "px");

        canvasOffset = $("#canvas").offset();
        offsetX = canvasOffset.left;
        offsetY = canvasOffset.top;

        isDirty = true;
    }

    function startSong(e)
    {

    }

    function pauseSong(e)
    {

    }

    function stopSong(e)
    {

    }

    $("#canvas").mousedown(function(e){handleMouseDown(e);});
    $("#canvas").mousemove(function(e){handleMouseMove(e);});
    $("#canvas").mouseup(function(e){handleMouseUp(e);});
    $("#canvas").mouseout(function(e){handleMouseOut(e);});
    $("#canvas").click(function(e) {handleClick(e);});
    $("#canvas").on("touchstart", handleTapDown);
    $("#canvas").on("touchmove",handleTapMove);

    if(network.isAdmin())
    {
        $("#play").onclick(function(e) {startSong(e);});
        $("#pause").onclick(function(e) {pauseSong(e);});
        $("#stop").onclick(function(e) {stopSong(e);});
    }
    else
    {
        $("#play").hide();
        $("#pause").hide();
        $("#stop").hide();
    }



    $(window).resize(function(e){handleResize(e)});

    handleResize();
    
         //function that takes a node and it finds the distance to all other nodes for loop to get distance from node i to all other
     function distanceFromNodes(node1,node2){
//       for (var i = 0; i < nodes.length; i++){
         //diff in x sqrt diff in y sqrt
//         if(node.id != nodes[i].id){
    
         var diffx = Math.pow(node1.x - nodes2.x,2)
         var diffy = Math.pow(node1.y - nodes2.y,2)
         var distance = Math.sqrt(diffx + diffy)
         return distance;
       }
     


    network.onUpdate(function(movedNode) { //say moving node 5
       //when a node is changed this is called, is dirty needs to be there
       //code where if the node is a source then calculate distance of it reference it with network.findNodeById(selectedId)
       //depending on distance calclulate volume sqrt distance, may need to mulitply by constant before sqrt see what works best
       isDirty = true; //if are node 5 need to recalculate distance to all sources
       //if node is the same as selected id, then get all sources and recompute all volumes
       // else if node is a source, recalculate distance to that source only
       var nodes = network.getSourceNodes();
       if (movedNode.id == network.getMe().id) {
           for (var i = 0; i < nodes.length; i++) {
               var diffx = Math.pow(movedNode.x - nodes[i].x, 2)
               var diffy = Math.pow(movedNode.y - nodes[i].y, 2)
               var distance = Math.sqrt(diffx + diffy)
               var volumeChange = distance * 10;
           }
       } else {
           var distance = distanceFromNodes(movedNode, network.getMe())
           var volumeChange = distance * 10;
       }

   })

    function tick() {
        redraw();
        window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick)
});
