import {
  SET_MESSAGE,
  SET_PEER_MESSAGE,
  UPDATE_PEER_MESSAGE,
  SET_FETCHDONE_TO_NONE,
  SET_FETCHDONE_TO_TRUE,
} from "../types";
import axios from "axios";

export const sendMessages = (groupChatId, itemMessage) => (dispatch) => {
  axios
    .post(`/messages/${groupChatId}`, itemMessage)
    .then((res) => {
      dispatch({
        type: SET_MESSAGE,
        payload: res.data,
      });
    })
    .catch((err) => console.log("Errors: ", err));
};

export const receiveCurrentPeerUserMessage = (currentPeerUserName) => (
  dispatch
) => {
  dispatch({
    type: SET_FETCHDONE_TO_NONE,
  });

  axios.get(`/user/${currentPeerUserName}/messages`).then((res) => {
    dispatch({
      type: SET_PEER_MESSAGE,
      payload: res.data,
    });
  });
};

export const updatePeerUserNotification = (
  currentPeerUserName,
  notificationMessages
) => (dispatch) => {
  axios
    .put(`/chat/${currentPeerUserName}`, notificationMessages)
    .then(() => {
      dispatch({
        type: UPDATE_PEER_MESSAGE,
        payload: notificationMessages,
      });
    })
    .catch((err) => console.log(err));
};

export const turnFetchDoneToTrue = () => (dispatch) => {
  dispatch({
    type: SET_FETCHDONE_TO_TRUE,
  });
};
