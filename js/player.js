import $ from "jquery";

class Player {
  constructor(sync) {
    this.sync = sync;
    this.channels = {};
  }

  sync(id, timestamp, realtime) {
    var channel = this.channels[id];
    if(channel == null) return;

    // sync.getTime(); // accurate time
    // realtime // realtime should match accurate time
    // timestamp // music timestamp
  }

  play(id, url) {
    var sound = document.createElement('audio');
    sound.id = id;
    sound.src = url;//'dankstorm.mp3';
    sound.type = 'audio/mpeg';
    document.body.appendChild(sound);

    sound.play();

    this.channels[id] = {
      id: id,
      url: url,
      sound: sound
    }
  }

  stop(id) {
    var channel = this.channels[id];
    if(channel == null) return;

    channel.sound.pause();
    //document.body.removeChild(chanel.sound);
  }

  setVolume(id, volume) {
      if(volume >= 1){
        volume = 1;

        }
    var channel = this.channels[id];
    if(channel == null) return;

    channel.sound.volume = volume;
  }
}

export { Player as default}
