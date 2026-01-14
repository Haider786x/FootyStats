import React, { useEffect, useState } from 'react';
import { apiClient } from '../api.js';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    apiClient
      .get('/favorites')
      .then((res) => setFavorites(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    await apiClient.delete(`/favorites/${id}`);
    load();
  };

  return (
    <div className="panel">
      <div className="section-header">
        <div>
          <h2 className="headline">Favorite squads</h2>
          <p className="muted">Pin teams you never want to miss on matchday.</p>
        </div>
        <span className="badge">{favorites.length} saved</span>
      </div>

      {loading ? (
        <div className="skeleton skeleton-line" style={{ width: '30%' }} />
      ) : favorites.length === 0 ? (
        <div className="empty">No favorites yet. Add one from a match card.</div>
      ) : (
        <ul className="list">
          {favorites.map((fav) => (
            <li key={fav.id} className="list-item">
              <div className="stack">
                <strong>{fav.teamName}</strong>
                <span className="muted">Team ID #{fav.teamApiId}</span>
              </div>
              <div className="actions">
                <button className="button-danger" onClick={() => remove(fav.id)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

