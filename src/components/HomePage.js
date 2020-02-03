import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="container-fluid">
      <h1>Free DFS Tools</h1>

      <h2>Get Started</h2>
      <ol>
        <li>These are the tools that I use personally to improve my DFS lineups, video tutorials coming soon</li>
        <li>This is my first and most important tool, the <Link to="/projection-normalizer">Projection Normalizer</Link></li>
      </ol>
    </div>
  );
};

export default HomePage;
