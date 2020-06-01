import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import userReducer from "./reducers/userReducer";
import dataReducer from "./reducers/dataReducer";
import uiReducer from "./reducers/uiReducer";
import messageReducer from "./reducers/messageReducer";

const initialState = {};

const middleWare = [thunk];

const reducers = combineReducers({
  user: userReducer, //user ekta object
  data: dataReducer, //data ekta object
  UI: uiReducer, //UI ekta object
  messages: messageReducer,
});

const store = createStore(
  reducers,
  initialState,
  compose(
    applyMiddleware(...middleWare),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);

export default store;
