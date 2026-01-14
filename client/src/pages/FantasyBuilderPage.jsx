import React, { useMemo, useState } from 'react';
import { apiClient } from '../api.js';

const currentYear = new Date().getFullYear();

export default function FantasyBuilderPage() {
  const [teamId, setTeamId] = useState('');
  const [season, setSeason] = useState(currentYear);
  const [pool, setPool] = useState([]);
  const [squad, setSquad] = useState([]);
  const [budget, setBudget] = useState(100);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadPlayers = async () => {
    if (!teamId) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get(`/teams/${teamId}/players`, { params: { season } });
      const players = res.data?.response || [];
      // assign mock price by position to keep purely deterministic (non-AI)
      const priced = players.map((p) => {
        const pos = p.player?.position || 'SUB';
        const base = pos.startsWith('G') ? 6 : pos.startsWith('D') ? 7 : pos.startsWith('M') ? 8 : 9;
        return { ...p, price: base + Math.floor((p.player?.age || 25) % 3) };
      });
      setPool(priced);
    } catch (e) {
      setError('Could not load players');
    } finally {
      setLoading(false);
    }
  };

  const addPlayer = (player) => {
    if (squad.find((p) => p.player.id === player.player.id)) return;
    if (squad.length >= 11) return;
    const totalCost = squad.reduce((sum, p) => sum + (p.price || 0), 0) + (player.price || 0);
    if (totalCost > budget) {
      setError('Budget exceeded');
      return;
    }
    setError('');
    setSquad([...squad, player]);
  };

  const removePlayer = (id) => {
    setSquad((prev) => prev.filter((p) => p.player.id !== id));
  };

  const byPosition = useMemo(() => {
    return squad.reduce(
      (acc, p) => {
        const pos = p.player?.position || 'SUB';
        acc[pos] = (acc[pos] || 0) + 1;
        return acc;
      },
      {}
    );
  }, [squad]);

  const spent = squad.reduce((sum, p) => sum + (p.price || 0), 0);

  return (
    <div className="panel">
      <div className="section-header">
        <div>
          <h2 className="headline">Fantasy builder</h2>
          <p className="muted">Assemble your XI from real squads. No AI, just your picks.</p>
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
            placeholder="Season"
            value={season}
            onChange={(e) => setSeason(Number(e.target.value))}
            style={{ width: 120 }}
          />
          <button type="button" onClick={loadPlayers} disabled={!teamId || loading}>
            {loading ? 'Loading...' : 'Load squad'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="stat-values">
          <strong>Budget: {budget} pts</strong>
          <span className="muted">Spent: {spent} pts</span>
          <span className="muted">Remaining: {Math.max(0, budget - spent)} pts</span>
        </div>
        <p className="muted">Positions: {JSON.stringify(byPosition)}</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="grid">
        <div className="card">
          <h4>Your XI ({squad.length}/11)</h4>
          {squad.length === 0 && <div className="empty">Add players from the pool.</div>}
          <ul className="list">
            {squad.map((p) => (
              <li key={p.player.id} className="list-item">
                <div className="stack">
                  <strong>{p.player.name}</strong>
                  <span className="muted">
                    {p.player.position} • Age {p.player.age}
                  </span>
                </div>
                <div className="actions">
                  <span className="badge">{p.price} pts</span>
                  <button className="button-danger" onClick={() => removePlayer(p.player.id)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h4>Player pool</h4>
          {pool.length === 0 && <div className="empty">Load a squad to draft from.</div>}
          <div className="grid">
            {pool.slice(0, 50).map((p) => (
              <div key={p.player.id} className="card-compact">
                <div className="stat-values">
                  <strong>{p.player.name}</strong>
                  <span className="muted">{p.player.position}</span>
                </div>
                <div className="stat-values">
                  <span className="muted">Age {p.player.age}</span>
                  <span className="badge">{p.price} pts</span>
                </div>
                <button type="button" onClick={() => addPlayer(p)} disabled={squad.length >= 11}>
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
