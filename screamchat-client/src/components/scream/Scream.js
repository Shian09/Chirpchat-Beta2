import React, { Component } from "react";
import { Link } from "react-router-dom";
import withStyles from "@material-ui/core/styles/withStyles";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import PropTypes from "prop-types";
import MyButton from "../../util/MyButton";
import DeleteScream from "./DeleteScream";
import ScreamDialog from "./ScreamDialog";
import LikeButton from "./LikeButton";

//MUI card Stuff
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";

//Icons
import CommentIcon from "@material-ui/icons/CommentOutlined";

//Redux
import { connect } from "react-redux";

const styles = {
  card: {
    position: "relative",
    display: "flex",
    marginBottom: 20,
  },
  image: {
    position: "relative",
    minWidth: "18%",
    onjectFit: "cover",
  },
  content: {
    padding: 25,
    objectFit: "contain",
  },
  changeLinkColor: {
    "&:hover": {
      cursor: "pointer",
      color: "#ffab00",
    },
  },
  contentImage: {
    marginTop: "10px",
    marginBottom: "5px",
    height: "150px",
    objectFit: "cover",
    marginLeft: "20px",
    display: "flex",
    flexDirection: "row",
    "& .loadOriginal": {
      borderRadius: "10%",
      display: "block",
      height: "100%",
    },
  },
};

class Scream extends Component {
  render() {
    dayjs.extend(relativeTime);
    const {
      classes,
      scream: {
        body,
        type,
        createdAt,
        userImage,
        userHandle,
        screamId,
        likeCount,
        commentCount,
      },
      user: {
        authenticated,
        credentials: { handle },
      },
    } = this.props;

    const deleteButton =
      authenticated && userHandle === handle ? (
        <DeleteScream screamId={screamId} />
      ) : null;

    return (
      <Card className={classes.card}>
        <CardMedia
          image={userImage}
          title="Profile image"
          className={classes.image}
        />
        <CardContent className={classes.content}>
          <Typography
            variant="h5"
            component={Link}
            to={`/users/${userHandle}`}
            color="primary"
            className={classes.changeLinkColor}
          >
            {userHandle}
          </Typography>
          {deleteButton}
          <Typography variant="body2" color="textSecondary">
            {dayjs(createdAt).fromNow()}
          </Typography>
          {body.includes("https://") || body.includes("http://") ? (
            <div className={classes.contentImage}>
              <img src={body} className="loadOriginal" />
            </div>
          ) : (
            <Typography variant="body1">{body}</Typography>
          )}
          <span> </span>
          <LikeButton screamId={screamId} />
          <span>{likeCount} likes</span>
          <MyButton tip="Comments">
            <CommentIcon color="primary" />
          </MyButton>
          <span>{commentCount} comments</span>
          <ScreamDialog
            screamId={screamId}
            userHandle={userHandle}
            openDialog={this.props.openDialog}
          />
        </CardContent>
      </Card>
    );
  }
}

Scream.propTypes = {
  user: PropTypes.object.isRequired,
  scream: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  openDialog: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps)(withStyles(styles)(Scream));
