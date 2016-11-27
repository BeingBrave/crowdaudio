import io from 'socket.io-client';

function generateUUID(){
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

class Network {
  constructor(url) {
    this.clientId = localStorage.getItem('clientId');

    if(!this.clientId) {
      this.clientId = generateUUID();
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

    this.socket.on('isAdmin', function(data) {
      that.admin = true;
      if(that.adminCb != null) that.adminCb(data);
    });

    this.socket.on('play', function(data) {
      if(that.playCb != null) that.playCb(data);
    });

    this.socket.on('stop', function(data) {
      if(that.stopCb != null) that.stopCb(data);
    });

    // List of all
    this.socket.on('nodes', function(data) {
      if(data != null) {
        that.nodes = data;
        for(var nodeId in data) {
          if(!that.nodes.hasOwnProperty(nodeId)) continue;
          that.handleUpdate(that.nodes[nodeId]);
        }
      }
    });

    // One joined
    this.socket.on('joined', function(data) {
      that.nodes[data.id] = data;
      that.handleUpdate(data);
    });

    // One updated
    this.socket.on('updated', function(data) {
      var node = that.nodes[data.id];
      if(node != null) {
        node.type = data.type;
        node.x = data.x;
        node.y = data.y;
        that.handleUpdate(node);
      }
    });
  }

  handleUpdate(node) {
    if(this.updateCb != null) this.updateCb(node);
  }

  onAdmin(cb) {
    this.adminCb = cb;
  }

  onUpdate(cb) {
    this.updateCb = cb;
  }

  onPlay(cb) {
    this.playCb = cb;
  }

  onStop(cb) {
    this.stopCb = cb;
  }

  updateNode(node) {
    this.toUpdate.push(node.id);
    this.handleUpdate(node);
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

  getSourceNodes() {
    let res = {};
    for(var nodeId in this.nodes) {
      if(!this.nodes.hasOwnProperty(nodeId)) continue;
      var node = this.nodes[nodeId];
      if(node.type == "source") res[nodeId] = node;
    }
    return res;
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

  getMe() {
    return this.nodes[this.clientId];
  }

  playNode(node) {
    this.socket.emit('play', {
      sourceId: node.id
    })
  }

  stopNode(node) {
    this.socket.emit('stop', {
      sourceId: node.id
    })
  }

  createSource() {
    var node = {
      id: generateUUID(),
      type: "source",
      x: 0.5,
      y: 0.5
    };
    this.socket.emit("create_source", node);
    that.nodes[node.id] = node;
    that.handleUpdate(node);
    return node;
  }

}

export { Network as default }
