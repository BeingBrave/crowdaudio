import '../css/app.scss';
import $ from "jquery";
import './network';
import Sync from './sync';

$(function() {

  let sync = new Sync("/sync");
  sync.start();

});
