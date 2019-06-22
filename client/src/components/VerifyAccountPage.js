import React, { Component } from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import isEmpty from "is-empty";
import {
  checkVerifyAccountToken,
  resendValidationEmail
} from "../actions/authActions";
import { clearErrors } from "../actions/errorActions";

class ValidateAccountPage extends Component {
  state = { email: "" };

  displayAdditionalErrors({ invalidAccountToken, accountNotVerified }) {
    if (invalidAccountToken || accountNotVerified) {
      return (
        <p
          className={classnames("", {
            error: invalidAccountToken || accountNotVerified
          })}
        >
          {invalidAccountToken}
          {accountNotVerified}
        </p>
      );
    }
  }

  handleChange = e => {
    const { name, value } = e.target;

    this.setState({ [name]: value });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { clearErrors, history, resendValidationEmail } = this.props;
    const data = { email: this.state.email };

    clearErrors();
    resendValidationEmail(data, history);
  };

  createEmailForm = () => {};

  componentDidMount() {
    const {
      checkVerifyAccountToken,
      history,
      isAuthenticated,
      match
    } = this.props;
    const { token } = match.params;

    if (isAuthenticated) {
      history.push("/home");
    }

    if (!isEmpty(token)) {
      checkVerifyAccountToken(token, history);
    }
  }

  render() {
    const { errors, message } = this.props;
    const { accountIsVerified, email, emailNotFound } = errors;

    const nonInputFieldErrors = this.displayAdditionalErrors(errors);

    return (
      <div className="VerifyAccountPage">
        <h1>Validate Account</h1>
        {message && <p className="message">{message}</p>}
        {nonInputFieldErrors}
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            name="email"
            value={this.state.email}
            onChange={this.handleChange}
            className={classnames("", {
              error: email || emailNotFound || accountIsVerified
            })}
          />
          <p className="error">
            {email}
            {emailNotFound}
          </p>
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
}

const mapStateToProps = ({ auth, errors, info }) => ({
  isAuthenticated: auth.isAuthenticated,
  errors,
  message: info.message
});
export default connect(
  mapStateToProps,
  { checkVerifyAccountToken, clearErrors, resendValidationEmail }
)(ValidateAccountPage);
