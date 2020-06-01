import {
  SET_MESSAGE,
  SET_PEER_MESSAGE,
  UPDATE_PEER_MESSAGE,
  SET_FETCHDONE_TO_NONE,
  SET_FETCHDONE_TO_TRUE,
} from "../types";

const initialState = {
  recentMessagesFromCurrentUser: {},
  peerUserMessages: [],
  fetchDone: false,
};

export default function (state = initialState, actions) {
  switch (actions.type) {
    case SET_MESSAGE:
      return {
        ...state,
        fetchDone: false,
        recentMessagesFromCurrentUser: actions.payload,
      };
    case SET_PEER_MESSAGE:
      return {
        ...state,
        fetchDone: false,
        peerUserMessages: actions.payload,
      };
    case UPDATE_PEER_MESSAGE:
      return {
        ...state,
        fetchDone: false,
        peerUserMessages: actions.payload,
      };
    case SET_FETCHDONE_TO_NONE:
      return {
        ...state,
        fetchDone: false,
      };
    case SET_FETCHDONE_TO_TRUE:
      return {
        ...state,
        fetchDone: true,
      };
    default:
      return state;
  }
}
