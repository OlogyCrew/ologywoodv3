import React, { useState, useMemo } from 'react';
import { trpc } from '../lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Heart, MapPin, Music, Calendar, Star } from 'lucide-react';

interface Artist {
  id: number;
  userId: number;
  artistName: string;
  bio: string;
  genres: string[];
  location: string;
  profileImage?: string;
  hourlyRate?: number;
  isFavorited?: boolean;
  availability?: {
    date: string;
    status: 'available' | 'booked' | 'unavailable';
  }[];
}

export const VenueArtistDiscovery: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  // Check if user is a venue
  if (user?.role !== 'venue') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          maxWidth: '400px',
          textAlign: 'center',
          padding: '40px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Venue Access Required</h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            This page is only available for venue accounts. Please log in as a venue to discover artists.
          </p>
          <button
            onClick={() => navigate('/get-started')}
            style={{
              backgroundColor: '#7c3aed',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Switch to Venue Account
          </button>
        </div>
      </div>
    );
  }

  // Fetch all artists
  const { data: artistsData, isLoading } = trpc.artist.getAll.useQuery();
  
  // Fetch favorites
  const { data: favoritesData } = trpc.favorite.getMyFavorites.useQuery();
  
  // Toggle favorite mutation
  const toggleFavoriteMutation = trpc.favorite.toggleFavorite.useMutation();

  const artists: Artist[] = useMemo(() => {
    if (!artistsData) return [];
    
    return artistsData.map((artist: any) => ({
      id: artist.id,
      userId: artist.userId,
      artistName: artist.artistName,
      bio: artist.bio || '',
      genres: artist.genres || [],
      location: artist.location || 'Not specified',
      profileImage: artist.profileImage,
      hourlyRate: artist.hourlyRate,
      isFavorited: favoritesData?.some((fav: any) => fav.artistId === artist.id),
      availability: [],
    }));
  }, [artistsData, favoritesData]);

  const filteredArtists = useMemo(() => {
    return artists.filter((artist) => {
      // Search filter
      const matchesSearch = artist.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Genre filter
      const matchesGenre = selectedGenres.length === 0 || 
        selectedGenres.some(genre => artist.genres.includes(genre));
      
      // Availability filter
      const hasAvailability = artist.availability?.some(a => a.status === 'available') || false;
      const matchesAvailability = !showOnlyAvailable || hasAvailability;
      
      return matchesSearch && matchesGenre && matchesAvailability;
    });
  }, [artists, searchQuery, selectedGenres, showOnlyAvailable]);

  const handleToggleFavorite = async (artistId: number) => {
    try {
      await toggleFavoriteMutation.mutateAsync({ artistId });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    artists.forEach(artist => {
      artist.genres.forEach(genre => genres.add(genre));
    });
    return Array.from(genres).sort();
  }, [artists]);

  const getAvailabilityStatus = (artist: Artist) => {
    const availableCount = artist.availability?.filter(a => a.status === 'available').length || 0;
    if (availableCount > 0) {
      return `${availableCount} available date${availableCount > 1 ? 's' : ''}`;
    }
    return 'No availability';
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '20px' }}>
      <style>{`
        .discovery-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .discovery-header {
          margin-bottom: 30px;
        }

        .discovery-header h1 {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 10px 0;
          color: #1f2937;
        }

        .discovery-header p {
          font-size: 16px;
          color: #6b7280;
          margin: 0;
        }

        .filters-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .search-box {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          font-size: 16px;
          margin-bottom: 20px;
          transition: border-color 0.3s;
        }

        .search-box:focus {
          outline: none;
          border-color: #7c3aed;
        }

        .filter-group {
          margin-bottom: 20px;
        }

        .filter-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 10px;
        }

        .genre-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .genre-tag {
          padding: 6px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 20px;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
          color: #374151;
        }

        .genre-tag:hover {
          border-color: #7c3aed;
        }

        .genre-tag.active {
          background: #7c3aed;
          color: white;
          border-color: #7c3aed;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .checkbox-group input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .artists-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .artist-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
          cursor: pointer;
        }

        .artist-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .artist-card-header {
          background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 48px;
          position: relative;
        }

        .artist-card-favorite {
          position: absolute;
          top: 10px;
          right: 10px;
          background: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .artist-card-favorite:hover {
          transform: scale(1.1);
        }

        .artist-card-favorite.favorited {
          color: #ef4444;
        }

        .artist-card-content {
          padding: 16px;
        }

        .artist-name {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .artist-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .artist-genres {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .genre-badge {
          background: #f3f4f6;
          color: #374151;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .artist-availability {
          padding: 10px;
          background: #f0fdf4;
          border-left: 3px solid #22c55e;
          border-radius: 4px;
          font-size: 13px;
          color: #166534;
          font-weight: 600;
        }

        .artist-availability.unavailable {
          background: #fef2f2;
          border-left-color: #ef4444;
          color: #991b1b;
        }

        .loading {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .loading-spinner {
          display: inline-block;
          width: 40px;
          height: 40px;
          border: 4px solid rgba(124, 58, 237, 0.3);
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          margin-bottom: 10px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .no-results {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .no-results h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 10px 0;
        }
      `}</style>

      <div className="discovery-container">
        <div className="discovery-header">
          <h1>🎤 Discover Artists</h1>
          <p>Find and book talented artists for your events</p>
        </div>

        <div className="filters-section">
          <input
            type="text"
            className="search-box"
            placeholder="Search by artist name, location, or bio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {allGenres.length > 0 && (
            <div className="filter-group">
              <label>Genres</label>
              <div className="genre-tags">
                {allGenres.map((genre) => (
                  <button
                    key={genre}
                    className={`genre-tag ${selectedGenres.includes(genre) ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedGenres((prev) =>
                        prev.includes(genre)
                          ? prev.filter((g) => g !== genre)
                          : [...prev, genre]
                      );
                    }}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="filter-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="available-only"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
              />
              <label htmlFor="available-only" style={{ margin: 0, cursor: 'pointer' }}>
                Show only available artists
              </label>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading artists...</p>
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className="no-results">
            <h3>No artists found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="artists-grid">
            {filteredArtists.map((artist) => (
              <div
                key={artist.id}
                className="artist-card"
                onClick={() => setSelectedArtist(artist)}
              >
                <div className="artist-card-header">
                  <button
                    className={`artist-card-favorite ${artist.isFavorited ? 'favorited' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(artist.id);
                    }}
                  >
                    <Heart
                      size={20}
                      fill={artist.isFavorited ? 'currentColor' : 'none'}
                    />
                  </button>
                  <Music size={48} />
                </div>
                <div className="artist-card-content">
                  <h3 className="artist-name">{artist.artistName}</h3>
                  
                  <div className="artist-info">
                    <MapPin size={14} />
                    {artist.location}
                  </div>

                  {artist.hourlyRate && (
                    <div className="artist-info">
                      <span>${artist.hourlyRate}/hour</span>
                    </div>
                  )}

                  {artist.genres.length > 0 && (
                    <div className="artist-genres">
                      {artist.genres.slice(0, 2).map((genre) => (
                        <span key={genre} className="genre-badge">
                          {genre}
                        </span>
                      ))}
                      {artist.genres.length > 2 && (
                        <span className="genre-badge">+{artist.genres.length - 2}</span>
                      )}
                    </div>
                  )}

                  <div className={`artist-availability ${
                    artist.availability?.some(a => a.status === 'available') ? '' : 'unavailable'
                  }`}>
                    <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    {getAvailabilityStatus(artist)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedArtist && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setSelectedArtist(null)}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>
              {selectedArtist.artistName}
            </h2>
            <p style={{ color: '#6b7280', margin: '0 0 15px 0' }}>
              {selectedArtist.location}
            </p>
            
            {selectedArtist.bio && (
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ color: '#374151', margin: '0 0 8px 0' }}>About</h4>
                <p style={{ color: '#6b7280', margin: 0 }}>{selectedArtist.bio}</p>
              </div>
            )}

            {selectedArtist.genres.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ color: '#374151', margin: '0 0 8px 0' }}>Genres</h4>
                <div className="artist-genres">
                  {selectedArtist.genres.map((genre) => (
                    <span key={genre} className="genre-badge">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedArtist.hourlyRate && (
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ color: '#374151', margin: '0 0 8px 0' }}>Rate</h4>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  ${selectedArtist.hourlyRate}/hour
                </p>
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ color: '#374151', margin: '0 0 8px 0' }}>Availability</h4>
              <p style={{ color: '#6b7280', margin: 0 }}>
                {getAvailabilityStatus(selectedArtist)}
              </p>
              {selectedArtist.availability && selectedArtist.availability.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  {selectedArtist.availability.slice(0, 5).map((avail, idx) => (
                    <div key={idx} style={{
                      padding: '8px',
                      background: avail.status === 'available' ? '#f0fdf4' : '#fef2f2',
                      borderRadius: '4px',
                      marginBottom: '6px',
                      fontSize: '13px',
                      color: avail.status === 'available' ? '#166534' : '#991b1b',
                    }}>
                      {new Date(avail.date).toLocaleDateString()} - {avail.status}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedArtist(null)}
              style={{
                width: '100%',
                padding: '10px',
                background: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueArtistDiscovery;
