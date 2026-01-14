import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../api.js';

const currentYear = new Date().getFullYear();

export default function TeamExplorerPage() {
  const [teamId, setTeamId] = useState('');
  const [season, setSeason] = useState(currentYear);
  const [team, setTeam] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [players, setPlayers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadTeam = async () => {
    if (!teamId) return;
    setLoading(true);
    setError('');
    try {
      const [teamRes, fixtureRes, playerRes, statRes] = await Promise.all([
        apiClient.get(`/teams/${teamId}`),
        apiClient.get(`/teams/${teamId}/fixtures`, { params: { season } }),
        apiClient.get(`/teams/${teamId}/players`, { params: { season } }),
        apiClient.get('/analysis/season-stats', { params: { teamId, season } })
      ]);
      setTeam(teamRes.data?.response?.[0] || null);
      setFixtures(fixtureRes.data?.response || []);
      setPlayers(playerRes.data?.response || []);
      setStats(statRes.data || null);
    } catch (e) {
      setError('Unable to load team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // auto reload on change if valid
    if (teamId) {
      loadTeam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season]);

  const lastFive = useMemo(() => fixtures.slice(0, 5), [fixtures]);

  return (
    <div className="panel">
      <div className="section-header">
        <div>
          <h2 className="headline">Team explorer</h2>
          <p className="muted">Deep-dive into any club: fixtures, squad, season form.</p>
        </div>
        <div className="filters">
          <input
            type="number"
            placeholder="Team ID"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            style={{ width: 120 }}
          />
          <input
            type="number"
            placeholder="Season (yyyy)"
            value={season}
            onChange={(e) => setSeason(Number(e.target.value))}
            style={{ width: 140 }}
          />
          <button type="button" onClick={loadTeam} disabled={!teamId || loading}>
            {loading ? 'Loading...' : 'Fetch'}
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {team && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="section-header">
            <div>
              <p className="muted">{team.league?.name || 'League'}</p>
              <h3 style={{ margin: 0 }}>{team.team?.name}</h3>
              <p className="muted">{team.venue?.name}</p>
            </div>
            <div className="badge">Season {season}</div>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid" style={{ marginBottom: '1rem' }}>
          <div className="card">
            <h4>Season record</h4>
            <div className="stat-values">
              <span>W {stats.wins}</span>
              <span>D {stats.draws}</span>
              <span>L {stats.losses}</span>
            </div>
            <p className="muted">Played {stats.played} • {stats.points} pts</p>
          </div>
          <div className="card">
            <h4>Goals</h4>
            <div className="stat-values">
              <span>GF {stats.goalsFor}</span>
              <span>GA {stats.goalsAgainst}</span>
              <span>GD {stats.goalDifference}</span>
            </div>
            <p className="muted">Avg F {stats.avgGoalsFor?.toFixed?.(2)} / A {stats.avgGoalsAgainst?.toFixed?.(2)}</p>
          </div>
          <div className="card">
            <h4>Clean sheets</h4>
            <div className="stat-values">
              <span>{stats.cleanSheets}</span>
              <span className="muted">across season</span>
            </div>
          </div>
        </div>
      )}

      {lastFive.length > 0 && (
        <div className="card">
          <h4>Recent fixtures</h4>
          <ul className="list">
            {lastFive.map((fx) => {
              const f = fx.fixture || {};
              const t = fx.teams || {};
              const g = fx.goals || {};
              return (
                <li key={f.id} className="list-item">
                  <div className="stack">
                    <strong>
                      {t.home?.name} vs {t.away?.name}
                    </strong>
                    <span className="muted">{new Date(f.date).toLocaleString()}</span>
                  </div>
                  <div className="badge">
                    {g.home ?? '-'} : {g.away ?? '-'}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {players.length > 0 && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h4>Squad</h4>
          <div className="grid">
            {players.slice(0, 30).map((p) => (
              <div key={`${p.player?.id}-${p.statistics?.[0]?.team?.id}`} className="card-compact">
                <div className="stat-values">
                  <strong>{p.player?.name}</strong>
                  <span className="muted">{p.player?.position}</span>
                </div>
                <p className="muted">
                  Age {p.player?.age} • {p.statistics?.[0]?.team?.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
