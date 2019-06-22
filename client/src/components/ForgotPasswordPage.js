import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import classnames from "classnames";
import isEmpty from "is-empty";
import { requestPasswordReset } from "../actions/authActions";
import { clearErrors } from "../actions/errorActions";
import { clearMessage } from "../actions/infoActions";

class ForgotPasswordPage extends Component {
  state = {
    email: ""
  };

  clearUI(errors, message) {
    const { clearErrors, clearMessage } = this.props;
    if (!isEmpty(errors)) {
      clearErrors();
    }

    if (!isEmpty(message)) {
      clearMessage();
    }
  }

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = e => {
    e.preventDefault();

    const data = { email: this.state.email };
    const {
      errors,
      history,
      info: { message }
    } = this.props;

    this.clearUI(errors, message);
    this.props.requestPasswordReset(data, history);
    this.setState({ email: "" });
  };

  handleLinkClick = e => {
    const {
      errors,
      info: { message }
    } = this.props;

    this.clearUI(errors, message);
  };

  render() {
    const {
      errors,
      info: { message }
    } = this.props;

    return (
      <div>
        <h1>Forgot Password</h1>
        <p className="error">{errors.invalidPasswordReset}</p>
        <p>
          Enter your email address and we'll send you a password reset link.
        </p>
        {message && <h3>{message}</h3>}
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            name="email"
            onChange={this.handleChange}
            value={this.state.email}
            className={classnames("", {
              error: errors.email || errors.emailNotFound
            })}
          />
          <p className="error">
            {errors.email}
            {errors.emailNotFound}
          </p>
          <button type="submit">Submit</button>
        </form>
        <Link to="/" onClick={this.handleLinkClick}>
          Back to login
        </Link>
      </div>
    );
  }
}

ForgotPasswordPage.propTypes = {
  clearErrors: PropTypes.func.isRequired,
  clearMessage: PropTypes.func.isRequired,
  requestPasswordReset: PropTypes.func.isRequired,
  message: PropTypes.string
};

const mapStateToProps = ({ errors, info }) => ({
  errors,
  info
});

export default connect(
  mapStateToProps,
  { clearErrors, clearMessage, requestPasswordReset }
)(ForgotPasswordPage);
