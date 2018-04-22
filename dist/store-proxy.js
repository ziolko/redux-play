"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _watcher = require("./watcher");

var _watcher2 = _interopRequireDefault(_watcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (playInstance, store) {
  return {
    dispatch: function dispatch(action) {
      var playName = playInstance.playName;
      if (playInstance.isDone) console.error("Calling dispatch from a finished play", playName);
      if (playInstance.isHotReloaded) console.warn("Calling dispatch from play that has been hot reloaded", playName);

      store.dispatch(action);
    },
    getState: function getState() {
      var playName = playInstance.playName;
      if (playInstance.isDone) console.error("Calling getState from a finished play", playName);
      if (playInstance.isHotReloaded) console.warn("Calling getState from play that has been hot reloaded", playName);

      return store.getState();
    },
    watch: function watch(filter) {
      var playName = playInstance.playName;
      if (playInstance.isDone) console.error("Calling watch from a finished play", playName);
      if (playInstance.isHotReloaded) console.warn("Calling watch from play that has been hot reloaded", playName);

      var watcher = new _watcher2.default(filter);
      playInstance.watchers.push(watcher);
      return watcher;
    }
  };
};