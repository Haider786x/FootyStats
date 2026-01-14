import React from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './state/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LiveMatchesPage from './pages/LiveMatchesPage.jsx';
import MatchDetailPage from './pages/MatchDetailPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import TeamExplorerPage from './pages/TeamExplorerPage.jsx';
import FantasyBuilderPage from './pages/FantasyBuilderPage.jsx';
import PredictorPage from './pages/PredictorPage.jsx';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function NavLink({ to, children }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link className={active ? 'nav-link active' : 'nav-link'} to={to}>
      {children}
    </Link>
  );
}

export default function App() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="app">
      <div className="app-gradient" />
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">FS</div>
          <div>
            <h1>Footstat Radar</h1>
            <p className="sub">Live football intelligence dashboard</p>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/">Live</NavLink>
          <NavLink to="/predictor">Predictor</NavLink>
          <NavLink to="/teams">Teams</NavLink>
          <NavLink to="/fantasy">Fantasy</NavLink>
          {isAuthenticated && <NavLink to="/favorites">Favorites</NavLink>}
          {!isAuthenticated && <NavLink to="/login">Login</NavLink>}
          {!isAuthenticated && <NavLink to="/register">Create account</NavLink>}
          {isAuthenticated && (
            <button className="chip ghost" onClick={logout}>
              Logout
              <span className="chip-dot" />
              <span className="chip-user">{user?.fullName}</span>
            </button>
          )}
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<LiveMatchesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/favorites"
            element={
              <PrivateRoute>
                <FavoritesPage />
              </PrivateRoute>
            }
          />
          <Route path="/teams" element={<TeamExplorerPage />} />
          <Route path="/fantasy" element={<FantasyBuilderPage />} />
          <Route path="/predictor" element={<PredictorPage />} />
          <Route path="/matches/:fixtureId" element={<MatchDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}

