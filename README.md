## Installation

```
npm i --save redux-play
```

## Introduction
redux-play organizes side effects in so called *plays* - functions called
every time an action is dispatched. The *play* listed below logs type of
every dispatched action:
```
async function logger(action) {
  console.info("[action]", action.type);
}
```  

Assuming this function is exported from a fille called `plays.js` you can register 
it in redux-play with the following lines of code:
```
import { createStore, applyMiddleware } from "redux";
import { createPlayMiddleware } from "redux-play";

import rootReducer from "./reducers";
import * as rootPlay from "./plays";

const playMiddleware = createPlayMiddleware(rootPlay);
const store = createStore(rootReducer, applyMiddleware(playMiddleware));
```  

## How it works

*Plays* are called after reducers (like in redux-observable). They are 
asynchronous function that have signature `async playFunction(action, store)`.

First parameter is the dispatched action. Second parameter is an object with 
the following methods:
- `getState()` - returns current state from redux
- `dispatch(action)` - dispatches a redux action
- `watch(filter)` - creates an action watcher - more details below  
 
## Watchers

Watchers allow to respond to actions dispatched while the current action 
is processed. An obvious use case for this is cancellation. 

The *play* below handles action of type `FETCH_VIDEO_DETAILS`. The result
is only relevant if no other `FETCH_VIDEO_DETAILS` action has been dispatched.
 

```
import { FETCH_VIDEO_DETAILS, SAVE_VIDEO_DETAILS } from "./actions";

async function fetchVideoDetails(action, store) {
    if (action.type !== FETCH_VIDEO_DETAILS) {
        return;
    }
    
    const watcher = store.watch(action => action.type === FETCH_VIDEO_DETAILS);
    const result = axios.get(`/video/${action.videoId}`);
    
    if(!watcher.hasAny()) {
        store.dispatch({ type: SAVE_VIDEO_DETAILS });
    }
}
```

The benefit of using this approach over reading from redux state 
with `store.getState()` is that there is no need to know the state structure.

## Examples

Real life examples of *plays* can be found 
[here](https://github.com/ziolko/roombelt/tree/master/src/apps/device/store/plays).

## License

redux-play is licensed under permissive [ISC license](https://github.com/ziolko/roombelt/blob/master/LICENSE.txt).
