import React, { Component } from "react";
import PropTypes from "prop-types";
import { Card } from "react-bootstrap";
import ReactLoading from "react-loading";
import { images } from "../../../emojiImages/ProfileImages";
import * as moment from "moment";
import firebase from "../../../Services/firebase";
import "./chatBox.css";
import LoginString from "../../LoginStrings";
import MyButton from "../../../util/MyButton";
import getGifImageValue from "./getGifImageValue";

//Redux Stuff
import {
  receiveCurrentPeerUserMessage,
  updatePeerUserNotification,
} from "../../../redux/actions/messageActions";
import { sendMessages } from "../../../redux/actions/messageActions";
import { connect } from "react-redux";

//Icons
import SendIcon from "@material-ui/icons/SendOutlined";
import PhotoIcon from "@material-ui/icons/Photo";
import EmojiIcon from "@material-ui/icons/EmojiEmotions";

class chatBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isShowSticker: false,
      inputValue: "",
    };

    //Local Storage Stuff
    this.currentUserName = localStorage.getItem(LoginString.Name);
    this.currentUserId = localStorage.getItem(LoginString.userId);
    this.currentUserPhoto = localStorage.getItem(LoginString.PhotoURL);
    this.currentUserDocumentId = localStorage.getItem(
      LoginString.FirebaseDocumentId
    );
    this.stateChanged = localStorage.getItem(LoginString.UPLOAD_CHANGED);

    //Global
    this.currentPeerUser = this.props.currentPeerUser;
    this.groupChatId = null;
    this.listMessageListen = [];
    this.removeListener = null;
    this.currentPhotoFile = null;
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  componentWillReceiveProps(newProps) {
    if (newProps.currentPeerUser) {
      this.currentPeerUser = newProps.currentPeerUser;
      if (this.props.message.fetchDone) {
        this.getListHistory();
      }
    }
  }

  componentDidMount() {
    this.getListHistory();
  }

  componentWillUnmount() {
    if (this.removeListener) {
      this.removeListener();
    }
  }

  getListHistory = () => {
    if (this.removeListener) {
      this.removeListener();
    }

    this.listMessageListen.length = 0;

    this.setState({ isLoading: true });

    if (
      this.hashString(this.currentUserId) <=
      this.hashString(this.currentPeerUser.id)
    ) {
      this.groupChatId = `${this.currentUserId} - ${this.currentPeerUser.id}`;
    } else {
      this.groupChatId = `${this.currentPeerUser.id} - ${this.currentUserId}`;
    }

    //Get history and listen new data added
    this.removeListener = firebase
      .firestore()
      .collection("messages")
      .doc(this.groupChatId)
      .collection(this.groupChatId)
      .onSnapshot(
        (Snapshot) => {
          Snapshot.docChanges().forEach((change) => {
            if (change.type === LoginString.DOC) {
              this.listMessageListen.push(change.doc.data());
            }
          });
          this.setState({ isLoading: false });
        },
        (err) => {
          console.log("Error in listener: ", err);
        }
      );
  };

  onSendMessage = (content, type) => {
    let notificationMessages = [];

    if (this.state.isShowSticker && type === 2) {
      this.setState({ isShowSticker: false });
    }
    if (content.trim() === "") {
      return;
    }
    const timestamp = new moment().valueOf().toString();

    let actualType = "";

    if (type === 0) {
      actualType = "textMessage";
    } else if (type === 1) {
      actualType = "photoMessage";
    } else if (type === 2) {
      actualType = "stickerMessage";
    }

    const itemMessage = {
      idFrom: this.currentUserId,
      nameFrom: this.currentUserName,
      idTo: this.currentPeerUser.id,
      nameTo: this.currentPeerUser.name,
      timestamp: timestamp,
      content: content.trim(),
      type: actualType,
    };

    this.props.sendMessages(this.groupChatId, itemMessage);

    this.setState({ inputValue: "" });

    const { message } = this.props;

    if (message.peerUserMessages) {
      let isCurrentUserAlreadyPresent = false;

      message.peerUserMessages.map((item) => {
        if (message.peerUserMessages.length === 1) {
          if (item.notificationId === this.currentUserId) {
            isCurrentUserAlreadyPresent = true;
            notificationMessages.push({
              notificationId: item.notificationId,
              number: item.number + 1,
            });
          } else if (
            item.notificationId !== this.currentUserId &&
            item.notificationId !== ""
          ) {
            notificationMessages.push({
              notificationId: item.notificationId,
              number: item.number,
            });
            notificationMessages.push({
              notificationId: this.currentUserId,
              number: 1,
            });
            isCurrentUserAlreadyPresent = true;
          } else if (item.notificationId === "") {
            notificationMessages.push({
              notificationId: this.currentUserId,
              number: 1,
            });
            isCurrentUserAlreadyPresent = true;
          }
        } else {
          if (item.notificationId === this.currentUserId) {
            isCurrentUserAlreadyPresent = true;
            notificationMessages.push({
              notificationId: item.notificationId,
              number: item.number + 1,
            });
          } else {
            notificationMessages.push({
              notificationId: item.notificationId,
              number: item.number,
            });
          }
        }
      });

      if (isCurrentUserAlreadyPresent === false) {
        notificationMessages.push({
          notificationId: this.currentUserId,
          number: 1,
        });
      }

      this.props.updatePeerUserNotification(
        this.currentPeerUser.name,
        notificationMessages
      );
    }
  };

  scrollToBottom = () => {
    if (this.messagesEnd) {
      this.messagesEnd.scrollIntoView({});
    }
  };

  onKeyboardPress = (event) => {
    if (event.key === "Enter") {
      this.onSendMessage(this.state.inputValue, 0);
    }
  };

  openListSticker = () => {
    this.setState({ isShowSticker: !this.state.isShowSticker });
  };

  render() {
    this.currentPeerUser = this.props.currentPeerUser;
    return (
      <Card className="viewChatBoard">
        <div className="headerChatBoard">
          <img
            className="viewAvatarItem1"
            src={this.currentPeerUser.URL}
            alt=""
          />
          <span className="textHeaderChatBoard">
            <p style={{ fontSize: "20px" }}>{this.currentPeerUser.name}</p>
          </span>
        </div>

        <div className="viewListContentChat">
          {this.renderListMessage()}
          <div
            style={{ float: "left", clear: "both" }}
            ref={(el) => {
              this.messagesEnd = el;
            }}
          />
        </div>

        {this.state.isShowSticker ? this.renderStickers() : null}

        <div className="viewBottom">
          <MyButton
            tip="Open Files"
            onClick={() => {
              this.refInput.click();
            }}
            btnClassName="icOpenGallery"
          >
            <PhotoIcon color="primary" />
          </MyButton>
          <input
            ref={(el) => {
              this.refInput = el;
            }}
            className="viewInputGallery"
            accept="images/*"
            type="file"
            onChange={this.onChoosePhoto}
          />
          <MyButton
            tip="Open Stickers"
            onClick={this.openListSticker}
            btnClassName="icOpenSticker"
          >
            <EmojiIcon color="primary" />
          </MyButton>

          <input
            className="viewInput"
            placeholder="Type a message"
            value={this.state.inputValue}
            onChange={(event) => {
              this.setState({ inputValue: event.target.value });
            }}
            onKeyPress={this.onKeyboardPress}
          />
          <MyButton
            tip="Send"
            onClick={() => {
              this.onSendMessage(this.state.inputValue, 0);
            }}
            btnClassName="icSend"
          >
            <SendIcon color="primary" />
          </MyButton>
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
      </Card>
    );
  }

  onChoosePhoto = (event) => {
    if (event.target.files && event.target.files[0]) {
      this.setState({ isLoading: true });
      const prefixFileType = event.target.files[0].type.toString();
      if (prefixFileType.indexOf("image/") === 0) {
        this.currentPhotoFile = event.target.files[0];
        this.uploadPhoto();
      } else {
        this.setState({ isLoading: false });
        console.log("This file is not an image");
      }
    } else {
      this.setState({ isLoading: false });
      console.log("Something wrong with input file");
    }
  };

  uploadPhoto = () => {
    if (this.currentPhotoFile) {
      const timestamp = new moment().valueOf().toString();

      const uploadTask = firebase
        .storage()
        .ref()
        .child(timestamp)
        .put(this.currentPhotoFile);

      uploadTask.on(
        LoginString.UPLOAD_CHANGED,
        null,
        (err) => {
          this.setState({ isLoading: false });
          console.log("Error: ", err.message);
        },
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            this.setState({ isLoading: false });
            this.onSendMessage(downloadURL, 1);
          });
        }
      );
    } else {
      this.setState({ isLoading: false });
      console.log("File is null");
    }
  };

  renderListMessage = () => {
    if (this.listMessageListen.length > 0) {
      let viewListMessage = [];

      this.listMessageListen.forEach((item, index) => {
        if (item.idFrom === this.currentUserId) {
          if (item.type === "textMessage") {
            viewListMessage.push(
              <div className="viewItemRight" key={item.timestamp}>
                <span className="textContentItem">{item.content}</span>
              </div>
            );
          } else if (item.type === "photoMessage") {
            viewListMessage.push(
              <div className="viewItemRight2" key={item.timestamp}>
                <img
                  className="imgItemRight"
                  src={item.content}
                  alt="Please send image"
                />
              </div>
            );
          } else {
            viewListMessage.push(
              <div className="viewItemRight3" key={item.timestamp}>
                <img
                  className="imgItemRight"
                  src={this.getGifImage(item.content)}
                  alt="content message"
                />
              </div>
            );
          }
        } else {
          if (item.type === "textMessage") {
            viewListMessage.push(
              <div className="viewWrapItemLeft" key={item.timestamp}>
                {this.isLastMessageLeft(index) ? (
                  <span className="textTimeLeft">
                    <div className="time">
                      {new moment(Number(item.timestamp)).format("LLL")}
                    </div>
                  </span>
                ) : null}
                <div className="viewWrapItemLeft3">
                  <img
                    src={this.currentPeerUser.URL}
                    alt="avatar"
                    className="peerAvatarLeft"
                  />

                  <div className="viewItemLeft">
                    <span className="textContentItem">{item.content}</span>
                  </div>
                </div>
              </div>
            );
          } else if (item.type === "photoMessage") {
            viewListMessage.push(
              <div className="viewWrapItemLeft2" key={item.timestamp}>
                {this.isLastMessageLeft(index) ? (
                  <span className="textTimeLeft">
                    <div className="time">
                      {new moment(Number(item.timestamp)).format("LLL")}
                    </div>
                  </span>
                ) : null}
                <div className="viewWrapItemLeft3">
                  <img
                    src={this.currentPeerUser.URL}
                    alt="avatar"
                    className="peerAvatarLeft"
                  />

                  <div className="viewItemLeft2">
                    <img
                      className="imgItemLeft"
                      src={item.content}
                      alt="content message"
                    />
                  </div>
                </div>
              </div>
            );
          } else {
            viewListMessage.push(
              <div className="viewWrapItemLeft2" key={item.timestamp}>
                {this.isLastMessageLeft(index) ? (
                  <span className="textTimeLeft">
                    <div className="time">
                      {new moment(Number(item.timestamp)).format("LLL")}
                    </div>
                  </span>
                ) : null}
                <div className="viewWrapItemLeft3">
                  <img
                    src={this.currentPeerUser.URL}
                    alt="avatar"
                    className="peerAvatarLeft"
                  />

                  <div className="viewItemLeft3" key={item.timestamp}>
                    <img
                      className="imgItemRight"
                      src={this.getGifImage(item.content)}
                      alt="content message"
                    />
                  </div>
                </div>
              </div>
            );
          }
        }
      });
      return viewListMessage;
    } else {
      return (
        <div className="viewWrapSayHi">
          <span className="textSayHi">Wave for the first time, chirper</span>
          <img className="imgWaveHand" src={images.wave} alt="wave hand" />
        </div>
      );
    }
  };

  renderStickers = () => {
    return (
      <div className="viewStickers">
        <img
          className="imgSticker"
          src={images.e1}
          alt="Sticker"
          onClick={() => {
            this.onSendMessage("e1", 2);
          }}
        />
        <img
          className="imgSticker"
          src={images.e2}
          alt="Sticker"
          onClick={() => {
            this.onSendMessage("e2", 2);
          }}
        />
        <img
          className="imgSticker"
          src={images.e3}
          alt="Stickers"
          onClick={() => {
            this.onSendMessage("e3", 2);
          }}
        />
        <img
          className="imgSticker"
          src={images.e4}
          alt="Sticker"
          onClick={() => {
            this.onSendMessage("e4", 2);
          }}
        />
        <img
          className="imgSticker"
          src={images.e5}
          alt="Sticker"
          onClick={() => {
            this.onSendMessage("e5", 2);
          }}
        />
        <img
          className="imgSticker"
          src={images.e6}
          alt="Sticker"
          onClick={() => {
            this.onSendMessage("e6", 2);
          }}
        />
        <img
          className="imgSticker"
          src={images.e7}
          alt="Sticker"
          onClick={() => {
            this.onSendMessage("e7", 2);
          }}
        />
        <img
          className="imgSticker"
          src={images.e8}
          alt="Sticker"
          onClick={() => {
            this.onSendMessage("e8", 2);
          }}
        />
        <img
          className="imgSticker"
          src={images.e9}
          alt="Sticker"
          onClick={() => {
            this.onSendMessage("e9", 2);
          }}
        />
        <img
          className="imgSticker"
          src={images.e10}
          alt="Sticker"
          onClick={() => {
            this.onSendMessage("e10", 2);
          }}
        />
        <img
          className="imgSticker"
          src={images.e11}
          alt="Sticker"
          onClick={() => {
            this.onSendMessage("e11", 2);
          }}
        />
        <img
          className="imgSticker"
          src={images.e12}
          alt="Sticker"
          onClick={() => {
            this.onSendMessage("e12", 2);
          }}
        />
        <img
          className="imgSticker"
          src={images.e13}
          alt="Sticker"
          onClick={() => {
            this.onSendMessage("e13", 2);
          }}
        />
        <img
          className="imgSticker"
          src={images.e14}
          alt="Sticker"
          onClick={() => {
            this.onSendMessage("e14", 2);
          }}
        />
        <img
          className="imgSticker"
          src={images.e15}
          alt="Sticker"
          onClick={() => {
            this.onSendMessage("e15", 2);
          }}
        />
        <img
          className="imgSticker"
          src={images.e16}
          alt="Sticker"
          onClick={() => {
            this.onSendMessage("e16", 2);
          }}
        />
        <img
          className="imgSticker"
          src={images.e17}
          alt="Sticker"
          onClick={() => {
            this.onSendMessage("e17", 2);
          }}
        />
        <img
          className="imgSticker"
          src={images.e18}
          alt="Sticker"
          onClick={() => {
            this.onSendMessage("e18", 2);
          }}
        />
        <img
          className="imgSticker"
          src={images.e19}
          alt="Sticker"
          onClick={() => {
            this.onSendMessage("e19", 2);
          }}
        />
        <img
          className="imgSticker"
          src={images.e20}
          alt="Sticker"
          onClick={() => {
            this.onSendMessage("e20", 2);
          }}
        />
      </div>
    );
  };

  getGifImage = (value) => {
    return getGifImageValue(value);
  };

  hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash += Math.pow(str.charCodeAt(i) * 31, str.length - i);
      hash = hash & hash;
    }
    return hash;
  };

  isLastMessageLeft(index) {
    if (
      (index + 1 < this.listMessageListen.length &&
        this.listMessageListen[index + 1].idFrom === this.currentUserId) ||
      index === this.listMessageListen.length - 1
    ) {
      return true;
    } else {
      return false;
    }
  }

  isLastMessageRight(index) {
    if (
      (index + 1 < this.listMessageListen.length &&
        this.listMessageListen[index + 1].idFrom !== this.currentUserId) ||
      index === this.listMessageListen.length - 1
    ) {
      return true;
    } else {
      return false;
    }
  }
}

chatBox.propTypes = {
  currentPeerUser: PropTypes.object.isRequired,
  sendMessages: PropTypes.func.isRequired,
  message: PropTypes.object.isRequired,
  receiveCurrentPeerUserMessage: PropTypes.func.isRequired,
  updatePeerUserNotification: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  message: state.messages,
});

const mapActionsToProps = {
  sendMessages,
  receiveCurrentPeerUserMessage,
  updatePeerUserNotification,
};

export default connect(mapStateToProps, mapActionsToProps)(chatBox);
