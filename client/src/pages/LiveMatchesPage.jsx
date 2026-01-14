import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { apiClient } from '../api.js';
import { useAuth } from '../state/AuthContext.jsx';

const SKELETONS = Array.from({ length: 6 });

function formatKickoff(utcDate) {
  if (!utcDate) return 'TBD';
  const date = new Date(utcDate);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function LiveMatchesPage() {
  const { isAuthenticated } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [liveOnly, setLiveOnly] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    apiClient
      .get('/matches', { params: { date: today } })
      .then((res) => {
        setMatches(res.data?.response || []);
      })
      .catch(() => setError('Could not load fixtures'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000
    });

    client.onConnect = () => {
      client.subscribe('/topic/live-matches', (message) => {
        try {
          const payload = JSON.parse(message.body);
          setMatches(payload.response || []);
        } catch (e) {
          // ignore malformed messages
        }
      });
    };

    client.activate();
    return () => client.deactivate();
  }, []);

  const displayed = useMemo(() => {
    const lower = query.toLowerCase();
    return matches
      .filter((m) => {
        const teams = m.teams || {};
        const league = m.league || {};
        const status = m.fixture?.status?.short || '';
        const hasLive = status.startsWith('1H') || status.startsWith('2H') || status === 'HT' || status === 'LIVE';
        if (liveOnly && !hasLive) return false;
        const text = `${teams.home?.name || ''} ${teams.away?.name || ''} ${league.name || ''}`.toLowerCase();
        return text.includes(lower);
      })
      .sort((a, b) => {
        const aLive = a.fixture?.status?.short === 'LIVE';
        const bLive = b.fixture?.status?.short === 'LIVE';
        if (aLive && !bLive) return -1;
        if (bLive && !aLive) return 1;
        return 0;
      });
  }, [matches, query, liveOnly]);

  const quickFavorite = async (team) => {
    if (!isAuthenticated || !team?.id) return;
    try {
      await apiClient.post('/favorites', {
        teamApiId: team.id,
        teamName: team.name
      });
    } catch {
      // keep UI silent
    }
  };

  return (
    <div className="panel">
      <div className="section-header">
        <div>
          <h2 className="headline">Live and Today</h2>
          <p className="muted">Real-time fixtures with instant status changes.</p>
        </div>
        <div className="filters">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search team or league"
            aria-label="Search matches"
          />
          <button
            type="button"
            className="button-secondary"
            onClick={() => setLiveOnly((v) => !v)}
          >
            {liveOnly ? 'Show all' : 'Live only'}
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="grid">
          {SKELETONS.map((_, idx) => (
            <div className="match-card" key={idx}>
              <div className="skeleton skeleton-line" style={{ width: '40%' }} />
              <div className="skeleton skeleton-line" style={{ width: '80%', height: 16 }} />
              <div className="skeleton skeleton-line" style={{ width: '70%', height: 16 }} />
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="empty">No matches found for the current filters.</div>
      ) : (
        <div className="grid">
          {displayed.map((m) => {
            const fixture = m.fixture || {};
            const league = m.league || {};
            const teams = m.teams || {};
            const goals = m.goals || {};
            const status = fixture.status?.short;
            const live = status === 'LIVE' || status === '1H' || status === '2H';
            return (
              <Link key={fixture.id} to={`/matches/${fixture.id}`} className="match-card">
                <div className="match-meta">
                  <span className="pill">{league.name}</span>
                  <span className={live ? 'pill live' : 'pill scheduled'}>
                    {live ? 'Live' : status || 'Scheduled'}
                  </span>
                  <span className="pill">{formatKickoff(fixture.date)}</span>
                </div>

                <div className="teams">
                  <span>{teams.home?.name}</span>
                  <div className="score-block">
                    <div className="score">
                      {goals.home ?? '-'} <span className="versus">:</span> {goals.away ?? '-'}
                    </div>
                    <div className="status">{fixture.status?.elapsed ? `${fixture.status.elapsed}'` : ''}</div>
                  </div>
                  <span>{teams.away?.name}</span>
                </div>

                {isAuthenticated && (
                  <div className="actions">
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        quickFavorite(teams.home);
                      }}
                    >
                      + {teams.home?.name?.split(' ')[0] || 'Home'}
                    </button>
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        quickFavorite(teams.away);
                      }}
                    >
                      + {teams.away?.name?.split(' ')[0] || 'Away'}
                    </button>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

