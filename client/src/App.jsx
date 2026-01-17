import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [mediaType, setMediaType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [urlInput, setUrlInput] = useState('')
  const [ingestLoading, setIngestLoading] = useState(false)
  const [ingestMessage, setIngestMessage] = useState('')
  const pageSize = 10

  const API_URL = import.meta.env.VITE_API_URL

  // Fetch media from backend
  const fetchMedia = async (page = 1, search = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page,
        pageSize,
        searchText: search,
      })

      if (mediaType !== 'all') {
        params.append('type', mediaType)
      }

      const response = await fetch(`${API_URL}/media/getAll?${params}`)
      const data = await response.json()

      if (data.metadata) {
        const result = data.metadata;
        setMedia(result.data)
        // Estimate total items (backend should return this)
        setTotalItems(result.total)
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load media on mount and when dependencies change
  useEffect(() => {
    fetchMedia(currentPage, searchText)
  }, [currentPage, searchText, mediaType])

  // Handle search
  const handleSearch = (e) => {
    setSearchText(e.target.value)
    setCurrentPage(1) // Reset to page 1 on search
  }

  // Handle media type filter
  const handleTypeChange = (e) => {
    setMediaType(e.target.value)
    setCurrentPage(1)
  }

  // Handle URL ingest
  const handleIngest = async () => {
    if (!urlInput.trim()) {
      setIngestMessage('Please enter at least one URL')
      return
    }

    setIngestLoading(true)
    setIngestMessage('')

    try {
      // Split by comma and trim whitespace
      const urls = urlInput
        .split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0)

      const response = await fetch(`${API_URL}/media/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ urls })
      })

      const data = await response.json()

      if (data.metadata) {
        const { queued, failed } = data.metadata
        setIngestMessage(`✅ ${queued} URLs queued for scraping${failed > 0 ? `, ${failed} failed` : ''}`)
        setUrlInput('')
      }
    } catch (error) {
      console.error('Error ingesting URLs:', error)
      setIngestMessage('❌ Error ingesting URLs')
    } finally {
      setIngestLoading(false)
    }
  }

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / pageSize)

  return (
    <div className="app-container">
      <header className="header">
        <h1>📷 Media Gallery</h1>
        <p>Search and browse all scraped media</p>
      </header>

      {/* URL Ingest Section */}
      <div className="ingest-section">
        <h2>Add URLs to Scrape</h2>
        <div className="ingest-input-group">
          <textarea
            placeholder="Enter URLs separated by commas (e.g., https://example.com/image1.jpg, https://example.com/image2.jpg)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="url-textarea"
            rows="3"
          />
          <button
            onClick={handleIngest}
            disabled={ingestLoading}
            className="ingest-button"
          >
            {ingestLoading ? 'Fetching...' : 'Fetch URLs'}
          </button>
        </div>
        {ingestMessage && <div className="ingest-message">{ingestMessage}</div>}
      </div>

      {/* Search & Filter */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search media by URL or name..."
          value={searchText}
          onChange={handleSearch}
          className="search-input"
        />

        <div className="filter-group">
          <span className="filter-label">Type</span>
          <select
            value={mediaType}
            onChange={handleTypeChange}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && <div className="loading">Loading media...</div>}

      {/* Image Gallery */}
      {!loading && (
        <>
          <div className="gallery">
            {media.length > 0 ? (
              media.map((item) => (
                <div key={item.id} className="gallery-item">
                  {item.type === 'video' ? (
                    <video
                      src={item.src}
                      controls
                      className="gallery-image"
                      poster='https://via.placeholder.com/400x225?text=Video'
                    />
                  ) : (
                    <img
                      src={item.src}
                      alt={item.name || 'Media'}
                      className="gallery-image"
                    />
                  )}
                  <div className="gallery-info">
                    <p className="gallery-name" title={item.name}>
                      {item.name || 'Unnamed'}
                    </p>
                    <p className="gallery-url" title={item.url}>
                      {new URL(item.url).hostname}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                No media found. Try a different search!
              </div>
            )}
          </div>

          {/* Pagination */}
          {media.length > 0 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ← Previous
              </button>

              <div className="pagination-info">
                Page {currentPage} of {totalPages || 1}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="pagination-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default App
