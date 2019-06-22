import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { checkResetPasswordToken, resetPassword } from "../actions/authActions";
import classnames from "classnames";

class ResetPasswordPage extends Component {
  state = {
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

    const { password, password2 } = this.state;
    const { resetPassword, history } = this.props;
    const { token } = this.props.match.params;

    const data = {
      password,
      password2,
      token
    };

    resetPassword(data, history);
  };

  componentDidMount() {
    const { checkResetPasswordToken, history, match } = this.props;
    const { token } = match.params;

    checkResetPasswordToken(token, history);
  }
  render() {
    if (!this.state.loading) {
      const {
        errors: { genericError, password, password2 }
      } = this.props;

      return (
        <div>
          <h1>Reset Password</h1>
          {genericError && <p className="error">{genericError}</p>}
          <form onSubmit={this.handleSubmit}>
            <label htmlFor="password">Password</label>
            <p>Use at least 10 characters</p>
            <input
              type="password"
              id="password"
              name="password"
              onChange={this.handleChange}
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
              className={classnames("", {
                error: password2
              })}
            />
            <p className="error">{password2}</p>
            <button type="submit">Submit</button>
          </form>
          <Link to="/">Return to login</Link>
        </div>
      );
    }

    return <div>Loading</div>;
  }
}

ResetPasswordPage.propTypes = {
  checkResetPasswordToken: PropTypes.func.isRequired,
  resetPassword: PropTypes.func.isRequired,
  errors: PropTypes.object,
  loading: PropTypes.bool
};

const mapStateToProps = ({ errors, info }) => ({
  errors,
  loading: info.loading
});

export default connect(
  mapStateToProps,
  { checkResetPasswordToken, resetPassword }
)(ResetPasswordPage);
