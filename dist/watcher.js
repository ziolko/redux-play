"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Watcher = function () {
  function Watcher(filter) {
    _classCallCheck(this, Watcher);

    this.filter = filter;
    this.buffered = [];
    this.nextPromise = null;
  }

  _createClass(Watcher, [{
    key: "_next",
    value: function _next(action) {
      if (this.filter && !this.filter(action)) {
        return;
      }

      if (!this.nextPromise) {
        this.buffered.push(action);
        return;
      }

      this.resolveNextPromise(action);
      this.nextPromise = this.resolveNextPromise = null;
    }
  }, {
    key: "hasAny",
    value: function hasAny() {
      return this.buffered.length > 0;
    }
  }, {
    key: "getNext",
    value: function getNext() {
      return this.buffered.length === 0 ? null : this.buffered.shift();
    }
  }, {
    key: "getNextAsync",
    value: function getNextAsync() {
      var _this = this;

      if (this.hasAny()) return this.getNext();
      if (!this.nextPromise) this.nextPromise = new Promise(function (resolve) {
        return _this.resolveNextPromise = resolve;
      });

      return this.nextPromise;
    }
  }]);

  return Watcher;
}();

exports.default = Watcher;