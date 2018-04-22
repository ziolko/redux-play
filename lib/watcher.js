export default class Watcher {
  constructor(filter) {
    this.filter = filter;
    this.buffered = [];
    this.nextPromise = null;
  }

  _next(action) {
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

  hasAny() {
    return this.buffered.length > 0;
  }

  getNext() {
    return this.buffered.length === 0 ? null : this.buffered.shift();
  }

  getNextAsync() {
    if (this.hasAny()) return this.getNext();
    if (!this.nextPromise) this.nextPromise = new Promise(resolve => (this.resolveNextPromise = resolve));

    return this.nextPromise;
  }
}
