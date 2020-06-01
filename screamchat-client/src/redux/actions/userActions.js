import {
  SET_USER,
  SET_ERRORS,
  CLEAR_ERRORS,
  LOADING_UI,
  SET_UNAUTHENTICATED,
  LOADING_USER,
  MARK_NOTIFICATIONS_READ,
  ERASE_NOTIFICATION,
} from "../types";
import axios from "axios";
import LoginString from "../../pages/LoginStrings";

/************************LoginUser Action********************/
export const loginUser = (userData, history) => (dispatch) => {
  dispatch({ type: LOADING_UI });
  axios
    .post("/login", userData)
    .then((res) => {
      setAuthorizationHeader(res.data.token);
      dispatch(getUserData());
      dispatch({ type: CLEAR_ERRORS });
      history.push("/home");
    })
    .catch((err) => {
      console.log("Error: ", err);
      dispatch({
        type: SET_ERRORS,
        payload: err.response.data,
      });
    });
};

/******************SignupUser Action************************/
export const signupUser = (newUserData, history) => (dispatch) => {
  dispatch({ type: LOADING_UI });
  axios
    .post("/signup", newUserData)
    .then((res) => {
      setAuthorizationHeader(res.data.token);
      dispatch(getUserData());
      dispatch({ type: CLEAR_ERRORS });
      history.push("/");
    })
    .catch((err) => {
      console.log("Errors: ", err);
      dispatch({
        type: SET_ERRORS,
        payload: err.response.data,
      });
    });
};

/************LogOut*************/
export const logoutUser = () => (dispatch) => {
  localStorage.removeItem("FBIdToken");
  delete axios.defaults.headers.common["Authorization"];
  dispatch({ type: SET_UNAUTHENTICATED });
};

/************Get logged in User Data just after logging in. Authenticated user*************/
export const getUserData = () => (dispatch) => {
  dispatch({ type: LOADING_USER });
  axios
    .get("/user")
    .then((res) => {
      localStorage.setItem(LoginString.userId, res.data.credentials.userId);
      localStorage.setItem(LoginString.Name, res.data.credentials.handle);
      localStorage.setItem(LoginString.Email, res.data.credentials.email);
      localStorage.setItem(LoginString.PhotoURL, res.data.credentials.imageUrl);
      localStorage.setItem(LoginString.UPLOAD_CHANGED, "state_changed");
      localStorage.setItem(LoginString.Description, res.data.credentials.bio);
      localStorage.setItem(
        LoginString.FirebaseDocumentId,
        res.data.credentials.handle
      );

      dispatch({
        type: SET_USER,
        payload: res.data,
      });
    })
    .catch((err) => console.log(err));
};

/******************Upload Image*******************/
export const uploadImage = (formData) => (dispatch) => {
  dispatch({ type: LOADING_USER });
  axios
    .post("/user/image", formData)
    .then((res) => {
      dispatch(getUserData());
    })
    .catch((err) => console.log(err));
};

/************Update list of users inside chat after erasing notifications****************/
export const updaterenderList = (notificationMessageErase, handle) => (
  dispatch
) => {
  axios
    .put(`/chat/${handle}`, notificationMessageErase)
    .then(() => {
      dispatch({
        type: ERASE_NOTIFICATION,
        payload: notificationMessageErase,
      });
    })
    .catch((err) => console.log(err));
};

/*******************Edit User Details *****************/
export const editUserDetails = (userDetails) => (dispatch) => {
  dispatch({ type: LOADING_USER });
  axios
    .post("/user", userDetails)
    .then(() => {
      dispatch(getUserData());
    })
    .catch((err) => console.log(err));
};

export const markNotificationsRead = (notificationIds) => (dispatch) => {
  axios
    .post("/notifications", notificationIds)
    .then((res) => {
      dispatch({
        type: MARK_NOTIFICATIONS_READ,
      });
    })
    .catch((err) => console.log(err));
};

const setAuthorizationHeader = (token) => {
  const FBIdToken = `Bearer ${token}`;
  //Storing token to localStorage so that refreshing or closing browser doesn't cause problems
  localStorage.setItem("FBIdToken", FBIdToken);
  axios.defaults.headers.common["Authorization"] = FBIdToken;
};
