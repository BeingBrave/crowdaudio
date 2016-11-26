import $ from "jquery";

class Sync {
  constructor(url) {
    this.url = url;
    this.offset = 0;
    this.retentionValue = 0;
  }

  update() {
    let start = performance.now();
    let that = this;
    $.get(this.url, function (body) {
      let rtt = performance.now()-start;
      let serverTime = parseInt(body) / 1000;

      var offset = new Date().getTime() - (serverTime + rtt/2);
      that.offset = (that.offset * that.retentionValue) + (offset * (1-that.retentionValue));
    })
  }

  getTime() {
    let time = new Date();

    time.setTime(time.getTime() - this.offset);

    return time;
  }

  start() {
    this.interval = setInterval(this.update.bind(this), 500);
  }

  stop() {
    clearInterval(this.interval);
  }
}

export { Sync as default}
