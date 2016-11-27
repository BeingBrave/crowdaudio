import $ from "jquery";

$(function() {
  var sound      = document.createElement('audio');
  sound.id       = 'audio-player';
  sound.src      = 'dankstorm.mp3';
  sound.type     = 'audio/mpeg';
  document.body.appendChild(sound);

  sound.play();
  sound.volume=0.1;
//playing music in sync,  play pause buttons, event onto listeners
});
