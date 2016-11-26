import io from 'socket.io-client';

class Network {
  constructor(url) {
    this.clientId = Math.floor(Math.random() * 100);
    this.socket = io({
      id: this.clientId
    });
  }

  updateNode(node) {
    // update node with id, x and y to server
  }

  updateDistance(sourceId, callback) {
    // when this id's distance to source changes callback
  }

}

export { Network as default}
