import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";

class HomePage extends Component {
  render() {
    const { message } = this.props;
    return (
      <div className="HomePage">
        {message && <p className="message">{message}</p>}
        <Link to="/logout">Logout</Link>
      </div>
    );
  }
}
HomePage.propTypes = {
  auth: PropTypes.object.isRequired,
  message: PropTypes.string
};
const mapStateToProps = ({ auth, info }) => ({
  auth,
  message: info.message
});
export default connect(mapStateToProps)(HomePage);
