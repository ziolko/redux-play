import Watcher from "./watcher";

export default (playInstance, store) => ({
  dispatch: action => {
    const playName = playInstance.playName;
    if (playInstance.isDone) console.error(`Calling dispatch from a finished play`, playName);
    if (playInstance.isHotReloaded) console.warn("Calling dispatch from play that has been hot reloaded", playName);

    store.dispatch(action);
  },
  getState: () => {
    const playName = playInstance.playName;
    if (playInstance.isDone) console.error(`Calling getState from a finished play`, playName);
    if (playInstance.isHotReloaded) console.warn("Calling getState from play that has been hot reloaded", playName);

    return store.getState();
  },
  watch(filter) {
    const playName = playInstance.playName;
    if (playInstance.isDone) console.error(`Calling watch from a finished play`, playName);
    if (playInstance.isHotReloaded) console.warn("Calling watch from play that has been hot reloaded", playName);

    const watcher = new Watcher(filter);
    playInstance.watchers.push(watcher);
    return watcher;
  }
});
