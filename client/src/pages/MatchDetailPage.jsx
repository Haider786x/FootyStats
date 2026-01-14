import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../api.js';
import { useAuth } from '../state/AuthContext.jsx';

function StatCard({ label, home, away }) {
  const parse = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'string' && value.endsWith('%')) {
      return Number(value.replace('%', ''));
    }
    return Number(value) || 0;
  };
  const homeVal = parse(home);
  const awayVal = parse(away);
  const total = homeVal + awayVal || 1;
  const homePct = Math.min(100, Math.round((homeVal / total) * 100));

  return (
    <div className="stat-card">
      <h4>{label}</h4>
      <div className="stat-values">
        <span>{home ?? '-'}</span>
        <span>{away ?? '-'}</span>
      </div>
      <div className="stat-bar">
        <div className="fill" style={{ width: `${homePct}%` }} />
      </div>
    </div>
  );
}

const formatTime = (utcDate) => {
  if (!utcDate) return 'TBD';
  const date = new Date(utcDate);
  return date.toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export default function MatchDetailPage() {
  const { fixtureId } = useParams();
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [favLoading, setFavLoading] = useState(false);
  const [favMessage, setFavMessage] = useState('');
  const [error, setError] = useState('');
  const [lineups, setLineups] = useState([]);

  useEffect(() => {
    apiClient
      .get(`/matches/${fixtureId}`)
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load match detail'));
    apiClient
      .get(`/matches/${fixtureId}/lineups`)
      .then((res) => setLineups(res.data?.response || []))
      .catch(() => setLineups([]));
  }, [fixtureId]);

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!data) {
    return <div className="panel">Loading match...</div>;
  }

  const fixture = data.fixture?.response?.[0]?.fixture || data.fixture?.response?.fixture || {};
  const league = data.fixture?.response?.[0]?.league || data.fixture?.response?.league || {};
  const teams = data.fixture?.response?.[0]?.teams || data.fixture?.response?.teams || {};
  const goals = data.fixture?.response?.[0]?.goals || data.fixture?.response?.goals || {};
  const statsArray = data.statistics?.response || [];

  const homeStats = statsArray.find((s) => s.team?.id === teams.home?.id);
  const awayStats = statsArray.find((s) => s.team?.id === teams.away?.id);

  const getStat = (sideStats, type) => {
    if (!sideStats) return '-';
    const item = sideStats.statistics?.find((st) => st.type === type);
    return item ? item.value : '-';
  };

  const addFavorite = async () => {
    if (!isAuthenticated) return;
    setFavLoading(true);
    setFavMessage('');
    try {
      await apiClient.post('/favorites', {
        teamApiId: teams.home?.id,
        teamName: teams.home?.name
      });
      setFavMessage('Added home team to favorites');
    } catch {
      setFavMessage('Could not add to favorites');
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <div className="panel">
      <div className="section-header">
        <div>
          <p className="muted">{league.name}</p>
          <h2 className="headline">
            {teams.home?.name} vs {teams.away?.name}
          </h2>
          <p className="muted">{formatTime(fixture.date)}</p>
        </div>
        <div className="actions">
          {isAuthenticated && (
            <button onClick={addFavorite} disabled={favLoading} className="button-secondary">
              {favLoading ? 'Adding...' : 'Favorite Home'}
            </button>
          )}
        </div>
      </div>

      {favMessage && <div className="info">{favMessage}</div>}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="teams">
          <span>{teams.home?.name}</span>
          <div className="score-block">
            <div className="score">
              {goals.home ?? '-'} <span className="versus">:</span> {goals.away ?? '-'}
            </div>
            <div className="status">
              {fixture.status?.short} {fixture.status?.elapsed ? `• ${fixture.status.elapsed}'` : ''}
            </div>
          </div>
          <span>{teams.away?.name}</span>
        </div>
        <div className="match-meta">
          <span className="pill">{fixture.venue?.name}</span>
          <span className="pill">{fixture.referee || 'Ref TBD'}</span>
        </div>
      </div>

      <h3>Momentum stats</h3>
      <div className="stat-grid">
        <StatCard
          label="Shots on target"
          home={getStat(homeStats, 'Shots on Goal')}
          away={getStat(awayStats, 'Shots on Goal')}
        />
        <StatCard
          label="Total shots"
          home={getStat(homeStats, 'Total Shots')}
          away={getStat(awayStats, 'Total Shots')}
        />
        <StatCard
          label="Possession"
          home={getStat(homeStats, 'Ball Possession')}
          away={getStat(awayStats, 'Ball Possession')}
        />
        <StatCard
          label="Corners"
          home={getStat(homeStats, 'Corner Kicks')}
          away={getStat(awayStats, 'Corner Kicks')}
        />
        <StatCard
          label="Fouls"
          home={getStat(homeStats, 'Fouls')}
          away={getStat(awayStats, 'Fouls')}
        />
      </div>

      {lineups.length > 0 && (
        <>
          <h3 style={{ marginTop: '1.25rem' }}>Projected lineups</h3>
          <div className="grid">
            {lineups.map((side) => (
              <div key={side.team?.id} className="card-compact">
                <div className="stat-values">
                  <strong>{side.team?.name}</strong>
                  <span className="muted">{side.formation}</span>
                </div>
                <ul className="list">
                  {side.startXI?.map((p) => (
                    <li key={p.player?.id} className="list-item">
                      <span>
                        #{p.player?.number} {p.player?.name}
                      </span>
                      <span className="muted">{p.player?.pos}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

