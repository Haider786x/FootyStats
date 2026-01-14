import React, { useState } from 'react';
import { apiClient } from '../api.js';

const currentYear = new Date().getFullYear();

export default function PredictorPage() {
  const [form, setForm] = useState({ homeTeamId: '', awayTeamId: '', season: currentYear });
  const [result, setResult] = useState(null);
  const [h2h, setH2h] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const run = async () => {
    if (!form.homeTeamId || !form.awayTeamId) return;
    setLoading(true);
    setError('');
    try {
      const [predictRes, h2hRes] = await Promise.all([
        apiClient.get('/analysis/predict', {
          params: {
            homeTeamId: form.homeTeamId,
            awayTeamId: form.awayTeamId,
            season: form.season
          }
        }),
        apiClient.get('/analysis/head-to-head', {
          params: { homeTeamId: form.homeTeamId, awayTeamId: form.awayTeamId, last: 3 }
        })
      ]);
      setResult(predictRes.data);
      setH2h(h2hRes.data?.response || []);
    } catch (e) {
      setError('Could not compute prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <div className="section-header">
        <div>
          <h2 className="headline">Match predictor</h2>
          <p className="muted">Form + goal delta from last 3 matches. No AI fluff.</p>
        </div>
        <div className="filters">
          <input
            name="homeTeamId"
            placeholder="Home team ID"
            value={form.homeTeamId}
            onChange={handleChange}
            style={{ width: 130 }}
          />
          <input
            name="awayTeamId"
            placeholder="Away team ID"
            value={form.awayTeamId}
            onChange={handleChange}
            style={{ width: 130 }}
          />
          <input
            name="season"
            type="number"
            placeholder="Season"
            value={form.season}
            onChange={handleChange}
            style={{ width: 120 }}
          />
          <button onClick={run} disabled={loading || !form.homeTeamId || !form.awayTeamId}>
            {loading ? 'Crunching...' : 'Predict'}
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="grid" style={{ marginBottom: '1rem' }}>
          <div className="card">
            <h4>Probabilities</h4>
            <div className="stat-values">
              <span>Home: {result.homeWinProbability}%</span>
              <span>Draw: {result.drawProbability}%</span>
              <span>Away: {result.awayWinProbability}%</span>
            </div>
            <p className="muted">Method: {result.method}</p>
          </div>
          <div className="card">
            <h4>Form score</h4>
            <div className="stat-values">
              <span>Home form: {result.homeFormScore}%</span>
              <span>Away form: {result.awayFormScore}%</span>
            </div>
            <p className="muted">Season {result.season}</p>
          </div>
        </div>
      )}

      {h2h && h2h.length > 0 && (
        <div className="card">
          <h4>Recent head-to-head (last 3)</h4>
          <ul className="list">
            {h2h.map((fx) => {
              const f = fx.fixture || {};
              const t = fx.teams || {};
              const g = fx.goals || {};
              return (
                <li key={f.id} className="list-item">
                  <div className="stack">
                    <strong>
                      {t.home?.name} vs {t.away?.name}
                    </strong>
                    <span className="muted">{new Date(f.date).toLocaleDateString()}</span>
                  </div>
                  <span className="badge">
                    {g.home ?? '-'} : {g.away ?? '-'}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
