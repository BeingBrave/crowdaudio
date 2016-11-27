//import io from 'socket.io-client';

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

    this.admin = false;
    this.accessManager;
    this.syncClient;
    this.syncList;
    this.nodes = [];

    let that = this;

    that.fetchToken(function(data) {
      that.admin = data.isAdmin;

      that.syncClient = new Twilio.Sync.Client(data.token);

      that.syncClient.list('nodes' + data.id).then(function(list) {
        //Lets store it in our global variable
        that.syncList = list;

        list.on('itemAdded', function(item) {
          that.nodes[item.index] = item.value;
          that.handleUpdate();
        });

        list.on('itemUpdated', function(item) {
          that.nodes[item.index] = item.value;
          that.handleUpdate();
        });

        list.getItems().then(function(page) {
          if(page.items != null) {
            that.nodes = page.items;
          }
          that.handleUpdate();

          that.addNode(that.clientId, 0.5, 0.5);
        });
      });

      that.accessManager = new Twilio.AccessManager(data.token);

      that.accessManager.on('tokenExpired', refreshToken);

      function refreshToken() {
        that.fetchToken(setNewToken);
      }

      //Give Access Manager the new token
      function setNewToken(tokenResponse) {
        that.accessManager.updateToken(tokenResponse.token);
      }
      //Need to update the Sync Client that the accessManager has a new token
      that.accessManager.on('tokenUpdated', function() {
        that.syncClient.updateToken(data.token);
      });

    })


  }

  fetchToken(handler) {
    $.getJSON('/token', {
      clientId: this.clientId
    }, function (tokenResponse) {
      handler(tokenResponse);
    });
  }

  handleUpdate() {
    if(this.updateCb != null) this.updateCb(this.nodes);
  }

  onUpdate(cb) {
    this.updateCb = cb;
  }

  addNode(id, x, y) {
    if(this.findNodeById(id) != null) return;
    var node = {
      id: id,
      x: x,
      y: y
    };
    this.nodes.push(node);
    this.syncList.push(node).then(function(item) {
      console.log('Added: ', item.index);
    }).catch(function(err) {
      console.error(err);
    });
  }

  updateNode(id, x, y) {
    var i, foundNode;
    for(i = 0; i < this.nodes.length; i++) {
      var node = this.nodes[i];
      if(id == node.id) {
        foundNode = node;
        break;
      }
    }
    foundNode.x = x;
    foundNode.y = y;
    this.syncList.update(i,{x: x, y: y});
  }

  getNodes() {
    return this.nodes;
  }

  findNodeById(id) {
    for(var i = 0; i < this.nodes.length; i++) {
      var node = this.nodes[i];
      if(id == node.id) return node;
    }
    return null;
  }

  findNodeByCoord(x, y) {
    let marginOfError = 0.1;
    for(var i = 0; i < this.nodes.length; i++) {
        var node = this.nodes[i];
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
