import '../css/app.scss';
import $ from "jquery";
import './player'

$(function() {


    var img = new Image();
    img.onload = function(){
        ctx.drawImage(img, 0,0);
    };

    img.src = "http://images.christmastimeclipart.com/images/2/1271716593176_1788/img_1271716593176_17881.jpg";

    var canvas=document.getElementById("canvas");

    handleResize();

    var ctx=canvas.getContext("2d");
    var canvasOffset=$("#canvas").offset();
    var offsetX=canvasOffset.left;
    var offsetY=canvasOffset.top;
    var canvasWidth=canvas.width;
    var canvasHeight=canvas.height;
    var isDragging=false;
    var canMouseX, canMouseY;



    function handleMouseDown(e){
        canMouseX=parseInt(e.clientX-offsetX);
        canMouseY=parseInt(e.clientY-offsetY);
        // set the drag flag
        isDragging=true;
    }

    function handleMouseUp(e){
        canMouseX=parseInt(e.clientX-offsetX);
        canMouseY=parseInt(e.clientY-offsetY);
        // clear the drag flag
        isDragging=false;
    }

    function handleMouseOut(e){
        canMouseX=parseInt(e.clientX-offsetX);
        canMouseY=parseInt(e.clientY-offsetY);
        // user has left the canvas, so clear the drag flag
        //isDragging=false;
    }

    function handleMouseMove(e){
        canMouseX=parseInt(e.clientX-offsetX);
        canMouseY=parseInt(e.clientY-offsetY);
        // if the drag flag is set, clear the canvas and draw the image
        if(isDragging){
            ctx.clearRect(0,0,canvasWidth,canvasHeight);
            ctx.drawImage(img,canMouseX-128/2,canMouseY-120/2,128,120);
        }
    }

    function handleClick(e)
    {
        canMouseX=parseInt(e.clientX-offsetX);
        canMouseY=parseInt(e.clientY-offsetY);
        ctx.clearRect(0,0,canvasWidth,canvasHeight);
        ctx.drawImage(img,canMouseX-128/2,canMouseY-120/2,128,120);
    }

    function handleResize(e)
    {
        if(window.innerHeight<=window.innerWidth){
            canvas.width = window.innerHeight - 20;
            canvas.height = window.innerHeight - 20;
        }
        else {
            canvas.width = window.innerWidth - 20;
            canvas.height = window.innerWidth - 20;
        }

        // canvas.marginLeft = -(canvas.width/2)+ "px";
        $("#canvas").css('margin-left',-(canvas.width/2)+ "px");
        $("#canvas").css('margin-top',-(canvas.height/2)+ "px");

        canvasOffset=$("#canvas").offset();
        offsetX=canvasOffset.left;
        offsetY=canvasOffset.top;
    }

    function handleTapMove(e)
    {
        canMouseX=parseInt(e.clientX-offsetX);
        canMouseY=parseInt(e.clientY-offsetY);
        ctx.clearRect(0,0,canvasWidth,canvasHeight);
        ctx.drawImage(img,canMouseX-128/2,canMouseY-120/2,128,120);
    }

    $("#canvas").mousedown(function(e){handleMouseDown(e);});
    $("#canvas").mousemove(function(e){handleMouseMove(e);});
    $("#canvas").mouseup(function(e){handleMouseUp(e);});
    $("#canvas").mouseout(function(e){handleMouseOut(e);});
    $("#canvas").click(function(e) {handleClick(e);});
    $("#canvas").on("touchmove",function(e){handleTapMove(e);});

    $(window).resize(function(e){handleResize(e)});

});
