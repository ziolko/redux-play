import flatten from "flat";
import StoreProxy from "./store-proxy";

export const PLAY_HOT_RELOAD = "PLAY_HOT_RELOAD";

export const createPlayMiddleware = (initialPlaysObject, { context, errorHandler } = {}) => {
  let playDefinitions = new Map(Object.entries(flatten(initialPlaysObject)));
  const runningPlayInstances = new Set();

  const playMiddleware = store => next => action => {
    next(action);

    runningPlayInstances.forEach(playInstance => playInstance.watchers.forEach(watcher => watcher._next(action)));

    playDefinitions.forEach((playFunction, playName) => {
      const playInstance = {
        playFunction,
        playName,
        isDone: false,
        isHotReloaded: false,
        isActive: true,
        watchers: []
      };

      runningPlayInstances.add(playInstance);

      const playResult = playFunction(action, StoreProxy(playInstance, store), context);

      Promise.resolve(playResult).then(null, errorHandler).finally(() => {
        playInstance.isDone = true;
        runningPlayInstances.delete(playInstance);
      });
    });
  };

  playMiddleware.replacePlay = function (newPlaysObject) {
    runningPlayInstances.forEach(instance =>
      instance.watchers.forEach(watcher => watcher._next({ type: PLAY_HOT_RELOAD }))
    );

    // Give plays a chance to finish before performing replace
    setTimeout(() => {
      const newPlayDefinitions = new Map(Object.entries(flatten(newPlaysObject)));

      const playNames = Array.from(new Set([...playDefinitions.keys(), ...newPlayDefinitions.keys()]));
      const alteredPlays = playNames.filter(name => playDefinitions.get(name) !== newPlayDefinitions.get(name));

      for (let playName of alteredPlays) {
        const oldDefinition = playDefinitions[playName];
        const newDefinition = newPlayDefinitions[playName];

        if ((oldDefinition && oldDefinition.hotReload === false) || (newDefinition && newDefinition.hotReload === false)) {
          console.warn(`Play "${playName}" is marked as incapable of hot reloading - refreshing`);
          window.location.reload();
          return;
        }
      }

      for (let instance of runningPlayInstances) {
        if (alteredPlays.includes(instance.playName)) {
          console.warn(`Play "${instance.playName}" is running and cannot be hot reloaded - refreshing`);
          window.location.reload();
          return;
        }
      }

      playDefinitions = newPlayDefinitions;

      if (alteredPlays.length) {
        console.warn(`Hot reloaded ${alteredPlays.length} play(s):`, ...alteredPlays.map(name => `\n - ${name}`));
      }
    }, 4);
  };

  return playMiddleware;
};
