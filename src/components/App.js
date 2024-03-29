/* eslint-disable import/no-named-as-default */
import { NavLink, Route, Switch } from "react-router-dom";
import FuelSavingsPage from "./containers/FuelSavingsPage";
import HomePage from "./HomePage";
import ProjectionNormalizer from "./ProjectionNormalizer";
import NotFoundPage from "./NotFoundPage";
import PropTypes from "prop-types";
import React from "react";
import { hot } from "react-hot-loader";

// This is a class-based component because the current
// version of hot reloading won't hot reload a stateless
// component at the top-level.

class App extends React.Component {
  render() {
    const activeStyle = { color: 'blue', fontWeight: 'bold' };
    return (
      <div className='container-fluid'>
        <div>
          <NavLink exact to="/" activeStyle={activeStyle}>Home</NavLink>
          {' | '}
          {/* <NavLink to="/fuel-savings" activeStyle={activeStyle}>Demo App</NavLink>
          {' | '} */}
          <NavLink to="/projection-normalizer" activeStyle={activeStyle}>Projection Normalizer</NavLink>
        </div>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/fuel-savings" component={FuelSavingsPage} />
          <Route path="/projection-normalizer" component={ProjectionNormalizer} />
          <Route component={NotFoundPage} />
        </Switch>
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.element
};

export default hot(module)(App);
