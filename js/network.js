import io from 'socket.io-client';

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

class Network {
  constructor(url) {
    this.clientId = localStorage.getItem('clientId');

    if(!this.clientId) {
      this.clientId = guid();
      localStorage.setItem('clientId', this.clientId);
    }

    let that = this;

    this.socket = io();
    this.admin = false;
    this.nodes = {};
    this.toUpdate = [];
    this.lastUpdate = -1;

    // Send on load
    this.socket.emit('join', {
      clientId: this.clientId
    })

    // List of all
    this.socket.on('nodes', function(data) {
      if(data != null) {
        that.nodes = data;
      }
      that.handleUpdate();
    });

    // One joined
    this.socket.on('joined', function(data) {
      that.nodes[data.id] = data;
      that.handleUpdate();
    });

    // One updated
    this.socket.on('updated', function(data) {
      var node = that.nodes[data.id];
      if(node != null) {
        node.x = data.x;
        node.y = data.y;
        that.handleUpdate();
      }
    });
  }

  handleUpdate() {
    if(this.updateCb != null) this.updateCb(this.nodes);
  }

  onUpdate(cb) {
    this.updateCb = cb;
  }

  // addNode(id, x, y) {
  //   if(this.findNodeById(id) != null) return;
  //   var node = {
  //     id: id,
  //     x: x,
  //     y: y
  //   };
  //   this.nodes.push(node);
  //   this.socket.emit("joined", node);
  // }#

  updateNode(node) {
    this.toUpdate.push(node.id);
    let now = new Date().getTime();
    if(this.lastUpdate < now - 60) {
      this.lastUpdate = now;

      for(var id in this.toUpdate) {
        this.socket.emit("updated", this.nodes[this.toUpdate[id]]);
      }
      this.toUpdate = [];
    }
  }

  getNodes() {
    return this.nodes;
  }

  findNodeById(id) {
    for(var nodeId in this.nodes) {
      if(!this.nodes.hasOwnProperty(nodeId)) continue;
      var node = this.nodes[nodeId];
      if(id == node.id) return node;
    }
    return null;
  }

  findNodeByCoord(x, y) {
    let marginOfError = 0.1;
    for(var nodeId in this.nodes) {
      if(!this.nodes.hasOwnProperty(nodeId)) continue;
      var node = this.nodes[nodeId];
      if((x - marginOfError <= node.x  && x + marginOfError >= node.x)
          && (y - marginOfError <= node.y && y + marginOfError >= node.y))
        return node;
    }
    return null;
  }

  isAdmin() {
    return this.admin;
  }

  getId() {
    return this.clientId;
  }

}

export { Network as default}
