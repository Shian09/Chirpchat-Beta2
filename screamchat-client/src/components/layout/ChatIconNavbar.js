import React, { Component } from "react";
import MyButton from "../../util/MyButton";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";

//MUI
import Badge from "@material-ui/core/Badge";

//Icons
import ChatIcon from "@material-ui/icons/ChatBubble";

class ChatIconNavbar extends Component {
  render() {
    let chatIcon = [];

    const messages = this.props.messages;

    if (
      messages &&
      messages.length > 0 &&
      messages[0].notificationId.length !== 0
    ) {
      chatIcon.push(
        <Link to="/chat">
          <MyButton tip="Chat">
            <Badge badgeContent={messages.length} color="error">
              <ChatIcon />
            </Badge>
          </MyButton>
        </Link>
      );
    } else {
      chatIcon.push(
        <Link to="/chat">
          <MyButton tip="Chat">
            <ChatIcon />
          </MyButton>
        </Link>
      );
    }
    return chatIcon;
  }
}

ChatIconNavbar.propTypes = {
  messages: PropTypes.array,
};

const mapStateToProps = (state) => ({
  messages: state.user.credentials.messages,
});

export default connect(mapStateToProps)(ChatIconNavbar);
