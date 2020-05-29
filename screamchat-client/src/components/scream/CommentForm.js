import React, { Component } from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";

//MUI
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

//Redux
import { connect } from "react-redux";
import { submitComment } from "../../redux/actions/dataActions";

const styles = {
  textField: {
    margin: "auto auto 10px auto",
  },
  button: {
    marginTop: 20,
    position: "relative",
  },
  visibleSeparatorTop: {
    width: "70%",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
    marginBottom: 1,
  },
  visibleSeparatorBottom: {
    width: "50%",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
    marginBottom: 20,
  },
  commentText: {
    marginBottom: 2,
    fontWeight: "bold",
  },
};

class CommentForm extends Component {
  state = {
    body: "",
    errors: "",
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.UI.errors) {
      this.setState({ errors: nextProps.UI.errors });
    }
    if (!nextProps.UI.error && !nextProps.UI.loading) {
      this.setState({ body: "" });
    }
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.submitComment(this.props.screamId, { body: this.state.body });
  };

  render() {
    const { classes, authenticated } = this.props;
    const errors = this.state.errors;

    const commentFormMarkup = authenticated ? (
      <Grid item sm={12} style={{ textAlign: "center", marginTop: -20 }}>
        <form onSubmit={this.handleSubmit}>
          <TextField
            name="body"
            type="text"
            label="Comment on chirp"
            error={errors.error ? true : false}
            helperText={errors.error}
            value={this.state.body}
            onChange={this.handleChange}
            fullWidth
            className={classes.textField}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.button}
          >
            Submit
          </Button>
        </form>
        <hr className={classes.visibleSeparatorTop} />
        <hr className={classes.visibleSeparatorBottom} />
        <Typography variant="h6" className={classes.commentText} align="center">
          Comments
        </Typography>
      </Grid>
    ) : null;

    return commentFormMarkup;
  }
}

CommentForm.propTypes = {
  submitComment: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  UI: PropTypes.object.isRequired,
  authenticated: PropTypes.bool.isRequired,
  screamId: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  UI: state.UI,
  authenticated: state.user.authenticated,
});

export default connect(mapStateToProps, { submitComment })(
  withStyles(styles)(CommentForm)
);
