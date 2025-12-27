import React, { useState, useMemo } from 'react';
import { Image, Video, Users } from 'lucide-react';
import './TabStyles.css';

// Generate initial data based on productId
const getInitialCommunityData = () => ({
  builds: [
    { 
      id: 1, 
      title: 'My Ultimate Gaming Setup', 
      image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400', 
      author: 'GamerPro',
      likes: 234
    },
    { 
      id: 2, 
      title: 'Minimalist Workstation', 
      image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400', 
      author: 'TechDesigner',
      likes: 189
    },
    { 
      id: 3, 
      title: 'RGB Paradise', 
      image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=400', 
      author: 'LightMaster',
      likes: 156
    }
  ],
  photos: [
    { id: 1, url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=300', author: 'User1' },
    { id: 2, url: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=300', author: 'User2' },
    { id: 3, url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=300', author: 'User3' },
    { id: 4, url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=300', author: 'User4' }
  ],
  videos: [
    { id: 1, title: 'Full Review & Unboxing', author: 'TechReviewer', views: '12K', thumbnail: '🎥' },
    { id: 2, title: 'Comparison with Competitors', author: 'GearHead', views: '8.5K', thumbnail: '🎥' }
  ]
});

const CommunityTab = ({ productId }) => {
  const [activeSection, setActiveSection] = useState('builds');
  const initialData = useMemo(() => getInitialCommunityData(), []);
  const { builds, photos, videos } = initialData;

  const sections = [
    { id: 'builds', label: 'User Builds', icon: <Users size={16} /> },
    { id: 'photos', label: 'Photos', icon: <Image size={16} /> },
    { id: 'videos', label: 'Videos', icon: <Video size={16} /> }
  ];

  return (
    <div className="tab-community">
      {/* Section Tabs */}
      <div className="community-tabs">
        {sections.map(section => (
          <button
            key={section.id}
            className={`community-tab ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </div>

      {/* Builds Section */}
      {activeSection === 'builds' && (
        <div className="community-section">
          <h3 className="community-section-title">🛠️ User Builds Featuring This Product</h3>
          <div className="builds-grid">
            {builds.map(build => (
              <div key={build.id} className="build-card">
                <div className="build-image">
                  <img src={build.image} alt={build.title} />
                </div>
                <div className="build-info">
                  <h4>{build.title}</h4>
                  <div className="build-meta">
                    <span>by {build.author}</span>
                    <span>❤️ {build.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-see-more">See All Builds →</button>
        </div>
      )}

      {/* Photos Section */}
      {activeSection === 'photos' && (
        <div className="community-section">
          <h3 className="community-section-title">📸 User Photos</h3>
          <div className="photos-grid">
            {photos.map(photo => (
              <div key={photo.id} className="photo-item">
                <img src={photo.url} alt={`By ${photo.author}`} />
                <div className="photo-overlay">
                  <span>@{photo.author}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-upload-photo">
            <Image size={16} />
            Upload Your Photo
          </button>
        </div>
      )}

      {/* Videos Section */}
      {activeSection === 'videos' && (
        <div className="community-section">
          <h3 className="community-section-title">🎥 Video Reviews</h3>
          <div className="videos-grid">
            {videos.map(video => (
              <div key={video.id} className="video-card">
                <div className="video-thumbnail">
                  <span className="video-play">▶️</span>
                </div>
                <div className="video-info">
                  <h4>{video.title}</h4>
                  <div className="video-meta">
                    <span>{video.author}</span>
                    <span>👁️ {video.views} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="community-cta">
        <span>🌟</span>
        <div>
          <strong>Share your experience!</strong>
          <p>Upload photos of your setup and get featured in our community gallery.</p>
        </div>
      </div>
    </div>
  );
};

export default CommunityTab;
