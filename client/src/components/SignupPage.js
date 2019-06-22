import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classnames from "classnames";
import { createAccount } from "../actions/authActions";
import { clearErrors } from "../actions/errorActions";
import "./SignupPage.scss";

class SignupPage extends Component {
  state = {
    name: "",
    email: "",
    password: "",
    password2: ""
  };

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = e => {
    e.preventDefault();

    const { name, email, password, password2 } = this.state;
    const { clearErrors, errors, history } = this.props;

    const data = {
      name,
      email,
      password,
      password2
    };

    clearErrors(errors);
    this.props.createAccount(data, history);
  };

  handleLinkClick = () => {
    const { clearErrors, errors } = this.props;

    clearErrors(errors);
  };

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
    const { errors: { name, email, password, password2} } = this.props;

    return (
      <div className="SignupPage">
        <h1>Account Creation</h1>
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            onChange={this.handleChange}
            value={this.state.name}
            className={classnames("", {
              error: name
            })}
          />
          <p className="error">{name}</p>
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            name="email"
            onChange={this.handleChange}
            value={this.state.email}
            className={classnames("", {
              error: email
            })}
          />
          <p className="error">{email}</p>
          <label htmlFor="password">Create Password</label>
          <p>Use at least 10 characters</p>
          <input
            type="password"
            id="password"
            name="password"
            onChange={this.handleChange}
            value={this.state.password}
            className={classnames("", {
              error: password
            })}
          />
          <p className="error">{password}</p>
          <label htmlFor="password2">Confirm Password</label>
          <input
            type="password"
            id="password2"
            name="password2"
            onChange={this.handleChange}
            value={this.state.password2}
            className={classnames("", {
              error: password2
            })}
          />
          <p className="error">{password2}</p>
          <button type="submit">Sign Up</button>
        </form>
        <Link to="/" onClick={this.handleLinkClick}>
          Back to login
        </Link>
      </div>
    );
  }
}

SignupPage.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  clearErrors: PropTypes.func.isRequired,
  createAccount: PropTypes.func.isRequired
};

const mapStateToProps = ({ auth, errors }) => ({
  auth,
  errors
});

export default connect(
  mapStateToProps,
  { clearErrors, createAccount }
)(withRouter(SignupPage));
