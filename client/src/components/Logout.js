import { Component } from "react";
import { connect } from "react-redux";
import { logoutUser } from "../actions/authActions";

class Logout extends Component {
  constructor(props) {
    super(props);
    this.props.logoutUser();
    this.props.history.push("/");
  }

  render() {
    return null;
  }
}

const mapDispatchToProps = {
  logoutUser
};

export default connect(
  null,
  mapDispatchToProps
)(Logout);
