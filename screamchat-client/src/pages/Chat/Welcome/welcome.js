import React, { Component } from "react";
import PropTypes from "prop-types";
import "./welcome.css";

class welcome extends Component {
  render() {
    return (
      <div className="viewWelcomeBoard">
        <img
          className="avatarWelcome"
          src={this.props.currentUserPhoto}
          alt="Profile Picture"
        />
        <span className="textTitleWelcome">{`Welcome, ${this.props.currentUserName}`}</span>
        <span className="textDescriptionWelcome">
          Let's bring people together
        </span>
      </div>
    );
  }
}

welcome.propTypes = {
  currentUserName: PropTypes.string.isRequired,
  currentUserPhoto: PropTypes.string.isRequired,
};

export default welcome;
