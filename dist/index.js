"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPlayMiddleware = exports.PLAY_HOT_RELOAD = undefined;

var _flat = require("flat");

var _flat2 = _interopRequireDefault(_flat);

var _storeProxy = require("./store-proxy");

var _storeProxy2 = _interopRequireDefault(_storeProxy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var PLAY_HOT_RELOAD = exports.PLAY_HOT_RELOAD = "PLAY_HOT_RELOAD";

var createPlayMiddleware = exports.createPlayMiddleware = function createPlayMiddleware(initialPlaysObject) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      context = _ref.context,
      errorHandler = _ref.errorHandler;

  var playDefinitions = new Map(Object.entries((0, _flat2.default)(initialPlaysObject)));
  var runningPlayInstances = new Set();

  var playMiddleware = function playMiddleware(store) {
    return function (next) {
      return function (action) {
        next(action);

        runningPlayInstances.forEach(function (playInstance) {
          return playInstance.watchers.forEach(function (watcher) {
            return watcher._next(action);
          });
        });

        playDefinitions.forEach(function (playFunction, playName) {
          var playInstance = {
            playFunction: playFunction,
            playName: playName,
            isDone: false,
            isHotReloaded: false,
            isActive: true,
            watchers: []
          };

          runningPlayInstances.add(playInstance);

          function done() {
            playInstance.isDone = true;
            runningPlayInstances.delete(playInstance);
          }

          Promise.resolve().then(function () {
            return playFunction(action, (0, _storeProxy2.default)(playInstance, store), context);
          }).then(null, errorHandler).then(null, function (error) {
            return console.error(error);
          }).then(done, done); // Promise.finally is not available in older browsers
        });
      };
    };
  };

  playMiddleware.replacePlay = function (newPlaysObject) {
    runningPlayInstances.forEach(function (instance) {
      return instance.watchers.forEach(function (watcher) {
        return watcher._next({ type: PLAY_HOT_RELOAD });
      });
    });

    // Give plays a chance to finish before performing replace
    setTimeout(function () {
      var newPlayDefinitions = new Map(Object.entries((0, _flat2.default)(newPlaysObject)));

      var playNames = Array.from(new Set([].concat(_toConsumableArray(playDefinitions.keys()), _toConsumableArray(newPlayDefinitions.keys()))));
      var alteredPlays = playNames.filter(function (name) {
        return playDefinitions.get(name) !== newPlayDefinitions.get(name);
      });

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = alteredPlays[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var playName = _step.value;

          var oldDefinition = playDefinitions.get(playName);
          var newDefinition = newPlayDefinitions.get(playName);

          if (oldDefinition && oldDefinition.hotReload === false || newDefinition && newDefinition.hotReload === false) {
            console.warn("Play \"" + playName + "\" is marked as incapable of hot reloading - refreshing");
            window.location.reload();
            return;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = runningPlayInstances[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var instance = _step2.value;

          if (alteredPlays.includes(instance.playName)) {
            console.warn("Play \"" + instance.playName + "\" is running and cannot be hot reloaded - refreshing");
            window.location.reload();
            return;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      playDefinitions = newPlayDefinitions;

      if (alteredPlays.length) {
        var _console;

        (_console = console).warn.apply(_console, ["Hot reloaded " + alteredPlays.length + " play(s):"].concat(_toConsumableArray(alteredPlays.map(function (name) {
          return "\n - " + name;
        }))));
      }
    }, 4);
  };

  return playMiddleware;
};