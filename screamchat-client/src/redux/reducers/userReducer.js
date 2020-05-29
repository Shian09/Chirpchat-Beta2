import {
  SET_USER,
  SET_AUTHENTICATED,
  SET_UNAUTHENTICATED,
  LOADING_USER,
  LIKE_SCREAM,
  UNLIKE_SCREAM,
  MARK_NOTIFICATIONS_READ,
  ERASE_NOTIFICATION,
} from "../types";

const initialState = {
  authenticated: false,
  loading: false,
  credentials: {},
  likes: [], //Details of my given likes and the userHandle is mine. ScreamId is the scream I have liked.
  notifications: [],
};

export default function (state = initialState, actions) {
  switch (actions.type) {
    case SET_AUTHENTICATED:
      return {
        ...state,
        authenticated: true,
      };
    case SET_UNAUTHENTICATED:
      return initialState;

    case SET_USER:
      return {
        authenticated: true,
        loading: false,
        ...actions.payload, //payload e ase credentials, likes and notifications. See Backend.
      };
    case LOADING_USER:
      return {
        ...state,
        loading: true,
      };
    case LIKE_SCREAM:
      return {
        ...state,
        likes: [
          ...state.likes,
          {
            userHandle: state.credentials.handle,
            screamId: actions.payload.screamId,
          },
        ],
      };
    case UNLIKE_SCREAM:
      return {
        ...state,
        likes: state.likes.filter(
          (like) => like.screamId !== actions.payload.screamId
        ),
      };
    case MARK_NOTIFICATIONS_READ:
      state.notifications.forEach((not) => (not.read = true));
      return {
        ...state,
      };
    case ERASE_NOTIFICATION:
      return {
        ...state,
        credentials: {
          messages: actions.payload,
        },
      };
    default:
      return state;
  }
}
