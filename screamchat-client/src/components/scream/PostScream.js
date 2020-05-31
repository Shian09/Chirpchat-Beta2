import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import MyButton from "../../util/MyButton";
import * as moment from "moment";
import LoginString from "../../pages/LoginStrings";
import firebase from "../../Services/firebase";
import ReactLoading from "react-loading";

//Redux Stuff
import { connect } from "react-redux";
import { postScream, clearErrors } from "../../redux/actions/dataActions";

//MUI Stuff
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";

//Icons
import AddIcon from "@material-ui/icons/Add";
import CloseIcon from "@material-ui/icons/Close";
import PhotoIcon from "@material-ui/icons/Photo";

const styles = {
  textField: {
    margin: "10px auto 10px auto",
  },
  submitButton: {
    position: "relative",
    float: "right",
    marginTop: 10,
    marginBottom: 10,
  },

  uploadImageBtn: {
    position: "relative",
    float: "left",
    marginTop: 10,
    marginBottom: 10,
  },

  progressSpinner: {
    position: "absolute",
  },
  closeButton: {
    position: "absolute",
    left: "91%",
    top: "4%",
  },
  textModify: {
    weight: "bold",
    fontSize: "1px",
    color: "#00bcd4",
  },
  viewInputGallery: {
    opacity: 0,
    position: "absolute",
    zIndex: -1,
    left: "10px",
    width: "30px",
  },
};

class PostScream extends Component {
  state = {
    open: false,
    body: "",
    errors: {},
    isLoading: false,
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.UI.errors) {
      this.setState({ errors: nextProps.UI.errors });
    }
    if (!nextProps.UI.errors && !nextProps.UI.loading) {
      this.setState({ body: "", open: false, errors: {} });
    }
  }
  handleOpen = () => {
    this.setState({
      open: true,
    });
  };
  handleClose = () => {
    this.props.clearErrors();
    this.setState({
      open: false,
      errors: {},
    });
  };
  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };
  handleSubmit = (event) => {
    event.preventDefault();
    this.props.postScream({ body: this.state.body, type: "text" });
  };

  onChoosePhoto = (event) => {
    let currentPhotoFile = null;
    if (event.target.files && event.target.files[0]) {
      this.setState({ isLoading: true });
      const prefixFileType = event.target.files[0].type.toString();
      if (prefixFileType.indexOf("image/") === 0) {
        currentPhotoFile = event.target.files[0];
        this.uploadPhoto(currentPhotoFile);
      } else {
        this.setState({ isLoading: false });
        console.log("This file is not an image");
      }
    } else {
      this.setState({ isLoading: false });
      console.log("Something wrong with input file");
    }
  };

  uploadPhoto = (currentPhotoFile) => {
    if (currentPhotoFile) {
      const timestamp = new moment().valueOf().toString();
      const uploadTask = firebase
        .storage()
        .ref()
        .child(timestamp)
        .put(currentPhotoFile);

      uploadTask.on(
        LoginString.UPLOAD_CHANGED,
        null,
        (err) => {
          this.setState({ isLoading: false });
          console.log("Error: ", err.message);
        },
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            this.setState({ body: downloadURL, isLoading: false });
            this.props.postScream({ body: this.state.body, type: "image" });
          });
        }
      );
    } else {
      this.setState({ isLoading: false });
      console.log("File is null");
    }
  };

  render() {
    const { errors } = this.state;
    const {
      classes,
      UI: { loading },
    } = this.props;
    return (
      <Fragment>
        <MyButton onClick={this.handleOpen} tip="Post a Chirp!">
          <AddIcon />
        </MyButton>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          fullWidth
          maxWidth="sm"
        >
          <MyButton
            tip="Close"
            onClick={this.handleClose}
            tipClassName={classes.closeButton}
          >
            <CloseIcon />
          </MyButton>
          <DialogTitle className={classes.textModify}>
            Post a new chirp
          </DialogTitle>
          <DialogContent>
            <form onSubmit={this.handleSubmit}>
              <TextField
                name="body"
                type="text"
                label="Chirp!"
                multiline
                rows="3"
                placeholder="It's time to Chirp"
                error={errors.body ? true : false}
                helperText={errors.body}
                className={classes.textField}
                onChange={this.handleChange}
                fullWidth
              />

              <MyButton
                tip="Post a picture"
                onClick={() => {
                  this.refInput.click();
                }}
                btnClassName="uploadImageBtn"
              >
                <PhotoIcon color="primary" />
              </MyButton>

              <span>Upload your image</span>

              <input
                ref={(el) => {
                  this.refInput = el;
                }}
                className="viewInputGallery"
                accept="images/*"
                type="file"
                onChange={this.onChoosePhoto}
              />

              {this.state.isLoading ? (
                <div className="viewLoading">
                  <ReactLoading
                    type={"spin"}
                    color={"#00bcd4"}
                    height={"10%"}
                    width={"10%"}
                  />
                </div>
              ) : null}

              <Button
                type="submit"
                variant="contained"
                color="secondary"
                className={classes.submitButton}
                disabled={loading}
              >
                Submit
                {loading && (
                  <CircularProgress
                    size={30}
                    className={classes.progressSpinner}
                  />
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </Fragment>
    );
  }
}

PostScream.propTypes = {
  postScream: PropTypes.func.isRequired,
  clearErrors: PropTypes.func.isRequired,
  UI: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  UI: state.UI,
});

export default connect(mapStateToProps, { postScream, clearErrors })(
  withStyles(styles)(PostScream)
);
