import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactLoading from "react-loading";
import "./chat.css";
import axios from "axios";
import { Link } from "react-router-dom";
import LoginString from "../LoginStrings";
import ChatBox from "./ChatBox/chatBox";
import Welcome from "./Welcome/welcome";

//Material-UI
import Typography from "@material-ui/core/Typography";

//Redux Stuff
import { connect } from "react-redux";
import { logoutUser, updaterenderList } from "../../redux/actions/userActions";
import {
  receiveCurrentPeerUserMessage,
  turnFetchDoneToTrue,
} from "../../redux/actions/messageActions";

class chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isOpenDialogConfirmLogout: false,
      currentPeerUser: null,
      displayedContactSwitchedNotification: [],
      displayedContacts: [],
    };

    //Local Storage Stuff
    this.currentUserName = localStorage.getItem(LoginString.Name);
    this.currentUserId = localStorage.getItem(LoginString.userId);
    this.currentUserPhoto = localStorage.getItem(LoginString.PhotoURL);
    this.currentUserDocumentId = localStorage.getItem(
      LoginString.FirebaseDocumentId
    );

    this.currentUserMessages = [];
    this.searchUsers = [];
  }

  logoutUser = () => {
    this.props.logoutUser();
  };

  componentDidMount() {
    axios
      .get(`/user/${this.currentUserName}/messages`)
      .then((res) => {
        res.data.map((item) => {
          this.currentUserMessages.push(item);
        });

        this.setState({
          displayedContactSwitchedNotification: this.currentUserMessages,
        });

        this.getListUser();
      })
      .catch((err) => {
        console.log("Errors in chat: ", err);
      });
  }

  getListUser = async () => {
    const res = await axios.get("/users");
    if (res.data.length > 0) {
      res.data.map((item) => {
        this.searchUsers.push(item);
      });
      this.setState({ isLoading: false });
    }
    this.renderListUser();
  };

  getClassNameforUserandNotification = (itemId) => {
    let number = 0;
    let className = "";
    let check = false;
    if (
      this.state.currentPeerUser &&
      this.state.currentPeerUser.id === itemId
    ) {
      className = "viewWrapItemFocused";
    } else {
      this.state.displayedContactSwitchedNotification.forEach((item) => {
        if (item.notificationId.length > 0) {
          if (item.notificationId === itemId) {
            check = true;
            number = item.number;
          }
        }
      });
      if (check === true) {
        className = "viewWrapItemNotification";
      } else {
        className = "viewWrapItem";
      }
    }
    return { className, number };
  };

  notificationErase = (itemId, fromSearch) => {
    let notificationMessagesErase = [];

    if (
      this.state.displayedContactSwitchedNotification.length === 1 &&
      this.state.displayedContactSwitchedNotification[0].notificationId ===
        itemId
    ) {
      notificationMessagesErase.push({
        notificationId: "",
        number: 0,
      });
    } else if (
      this.state.displayedContactSwitchedNotification.length === 1 &&
      this.state.displayedContactSwitchedNotification[0].notificationId === ""
    ) {
      notificationMessagesErase.push({
        notificationId: "",
        number: 0,
      });
    } else {
      this.state.displayedContactSwitchedNotification.forEach((el) => {
        if (el.notificationId.length > 0) {
          if (el.notificationId !== itemId) {
            notificationMessagesErase.push({
              notificationId: el.notificationId,
              number: el.number,
            });
          }
        }
      });
    }

    this.props.updaterenderList(
      notificationMessagesErase,
      this.currentUserName
    );

    this.setState({
      displayedContactSwitchedNotification: notificationMessagesErase,
    });

    if (fromSearch) {
      this.displaySearchedContacts();
    } else {
      this.renderListUser();
    }
  };

  renderListUser = () => {
    if (this.searchUsers.length > 0) {
      let viewListUser = [];
      let classname = "";
      this.searchUsers.map((item) => {
        if (item.id !== this.currentUserId) {
          classname = this.getClassNameforUserandNotification(item.id);
          viewListUser.push(
            <button
              className="viewIndividual"
              key={item.key}
              id={item.key}
              onClick={() => {
                this.notificationErase(item.id, false);
                this.props.receiveCurrentPeerUserMessage(item.name);
                this.setState({
                  currentPeerUser: item,
                });
                this.props.turnFetchDoneToTrue();

                // document.getElementById(item.key).style.backgroundColor =
                //("#d4f0f0");
                //  document.getElementById(item.key).style.color = "#d4f0f0";
              }}
            >
              <img className="viewAvatarItem" src={item.URL} alt="" />
              <div className="viewWrapContentItem">
                <span className="textItem">{` ${item.name}`}</span>
              </div>
              {classname.className === "viewWrapItemNotification" ? (
                <div className="notificationparagraph" id={item.key}>
                  <p className="newmessages" id={item.key}>
                    {classname.number} New Messages
                  </p>
                </div>
              ) : null}
            </button>
          );
        }
      });
      this.setState({
        displayedContacts: viewListUser,
      });
    } else {
      console.log("No user is present");
    }
  };

  searchHandler = (event) => {
    let searchQuery = event.target.value.toLowerCase(),
      displayedContacts = this.searchUsers.filter((data) => {
        let usersLowerCase = data.name.toLowerCase();
        return usersLowerCase.indexOf(searchQuery) !== -1;
      });
    this.displayedContacts = displayedContacts;
    this.displaySearchedContacts();
  };

  displaySearchedContacts = () => {
    if (this.displayedContacts.length > 0) {
      let viewListUser = [];
      let classname = "";
      this.displayedContacts.map((item) => {
        if (item.id !== this.currentUserId) {
          classname = this.getClassNameforUserandNotification(item.id);
          viewListUser.push(
            <button
              className="viewIndividual"
              key={item.key}
              id={item.key}
              onClick={() => {
                this.notificationErase(item.id, true);
                this.props.receiveCurrentPeerUserMessage(item.name);
                this.setState({
                  currentPeerUser: item,
                });
                this.props.turnFetchDoneToTrue();
                // document.getElementById(item.key).style.backgroundColor =
                //  "#fff";
                //  document.getElementById(item.key).style.color = "#fff";
              }}
            >
              <img className="viewAvatarItem" src={item.URL} alt="" />
              <div className="viewWrapContentItem">
                <span className="textItem">{`${item.name}`}</span>
              </div>
              {classname.className === "viewWrapItemNotification" ? (
                <div className="notificationparagraph" id={item.key}>
                  <p id={item.key} className="newmessages">
                    {classname.number} New Messages
                  </p>
                </div>
              ) : null}
            </button>
          );
        }
      });
      this.setState({
        displayedContacts: viewListUser,
      });
    } else {
      console.log("No user is present");
    }
  };

  render() {
    return (
      <div className="root">
        <div className="body">
          <div className="viewListUser">
            <div className="profileviewleftside">
              <div className="profileAlign">
                <img
                  className="ProfilePicture"
                  alt=""
                  src={this.currentUserPhoto}
                />

                <Typography
                  variant="h6"
                  component={Link}
                  to={`/users/${this.currentUserName}`}
                  className="profileName"
                >
                  {this.currentUserName}
                </Typography>
                <Typography variant="body2" className="profileDesc">
                  You
                </Typography>
              </div>
            </div>
            <div className="rootsearchbar">
              <div className="input-container">
                <input
                  className="input-field"
                  type="text"
                  onChange={this.searchHandler}
                  placeholder="Search"
                />
              </div>
            </div>
            {this.state.isLoading ? (
              <div className="viewLoading">
                <ReactLoading
                  type={"spin"}
                  color={"#203152"}
                  height={"3%"}
                  width={"3%"}
                />
              </div>
            ) : null}

            {this.state.displayedContacts}
          </div>

          <div className="viewBoard">
            {this.state.currentPeerUser !== null ? (
              <ChatBox currentPeerUser={this.state.currentPeerUser} />
            ) : (
              <Welcome
                currentUserName={this.currentUserName}
                currentUserPhoto={this.currentUserPhoto}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

chat.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  updaterenderList: PropTypes.func.isRequired,
  receiveCurrentPeerUserMessage: PropTypes.func.isRequired,
  turnFetchDoneToTrue: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapActionsToProps = {
  logoutUser,
  updaterenderList,
  receiveCurrentPeerUserMessage,
  turnFetchDoneToTrue,
};

export default connect(mapStateToProps, mapActionsToProps)(chat);
