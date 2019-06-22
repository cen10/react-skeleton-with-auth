import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./LoginPage.scss";
import PropTypes from "prop-types";
import isEmpty from "is-empty";
import { connect } from "react-redux";
import { loginUser } from "../actions/authActions";
import { clearErrors } from "../actions/errorActions";
import { clearMessage } from "../actions/infoActions";
import classnames from "classnames";

class LoginPage extends Component {
  state = {
    email: "",
    password: "",
    errors: {}
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

  displayAdditionalErrors({
    invalidAccountToken,
    genericError,
    accountLocked
  }) {
    if (invalidAccountToken || genericError || accountLocked) {
      return (
        <p className="error">
          {invalidAccountToken}
          {genericError}
          {accountLocked}
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

    const { email, password } = this.state;

    const {
      errors,
      history,
      info: { message },
      loginUser
    } = this.props;

    const data = {
      email,
      password
    };

    this.clearUI(errors, message);
    loginUser(data, history);
  };

  handleLinkClick = e => {
    const {
      errors,
      info: { message }
    } = this.props;

    this.clearUI(errors, message);
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.isAuthenticated) {
      this.props.history.push("/home");
    }
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors
      });
    }
  }

  componentDidMount() {
    const {
      auth: { isAuthenticated },
      history
    } = this.props;

    if (isAuthenticated) {
      history.push("/home");
    }
  }

  render() {
    const {
      errors,
      info: { message }
    } = this.props;

    const nonInputFieldErrors = this.displayAdditionalErrors(errors);

    return (
      <div className="LoginPage">
        <h1>Login</h1>
        {message && <p className="message">{message}</p>}
        {nonInputFieldErrors}
        <form action="/" onSubmit={this.handleSubmit}>
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
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            onChange={this.handleChange}
            value={this.state.password}
            className={classnames("", {
              error: errors.password || errors.passwordIncorrect
            })}
          />
          <p className="error">
            {errors.password}
            {errors.passwordIncorrect}
          </p>
          <button type="submit">Login</button>
        </form>
        <Link to="/forgot-password" onClick={this.handleLinkClick}>
          Forgot Password?
        </Link>
        <Link to="/signup" onClick={this.handleLinkClick}>
          Sign up here!
        </Link>
      </div>
    );
  }
}

LoginPage.propTypes = {
  clearErrors: PropTypes.func.isRequired,
  clearMessage: PropTypes.func.isRequired,
  loginUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};
const mapStateToProps = ({ auth, errors, info }) => ({
  auth,
  errors,
  info
});
export default connect(
  mapStateToProps,
  { clearErrors, clearMessage, loginUser }
)(LoginPage);
