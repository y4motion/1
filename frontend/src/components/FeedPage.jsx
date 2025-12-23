import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  ArrowLeft,
  Heart,
  Repeat2,
  MessageCircle,
  Share2,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function FeedPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/feed`, {
        headers: user ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPostContent.trim()) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content: newPostContent }),
      });

      if (response.ok) {
        setNewPostContent('');
        setShowCreateModal(false);
        fetchFeed();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const toggleLike = async (postId) => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/feed/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchFeed();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16" data-theme={theme}>
      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/5 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className={theme === 'minimal-mod' ? 'text-2xl font-bold' : 'text-3xl font-bold'}>
              {theme === 'minimal-mod' ? 'FEED' : 'Лента'}
            </h1>
          </div>
          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="glass-strong px-4 py-2 rounded-xl flex items-center gap-2 hover:scale-105 transition-all"
              style={{ borderRadius: theme === 'minimal-mod' ? '0' : '12px' }}
            >
              <Plus className="w-5 h-5" />
              <span>Создать пост</span>
            </button>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(10px)' }}
        >
          <div
            className="glass-strong p-6 w-full max-w-2xl rounded-2xl"
            style={{ borderRadius: theme === 'minimal-mod' ? '0' : '24px' }}
          >
            <h2 className="text-xl font-bold mb-4">Создать пост</h2>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Что нового?"
              className="w-full h-40 p-4 bg-white/5 border border-white/10 rounded-xl resize-none focus:outline-none focus:border-purple-500"
              style={{ borderRadius: theme === 'minimal-mod' ? '0' : '12px' }}
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/5 rounded-lg transition-all">
                  <ImageIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-white/20 rounded-xl hover:bg-white/5 transition-all"
                  style={{ borderRadius: theme === 'minimal-mod' ? '0' : '12px' }}
                >
                  Отмена
                </button>
                <button
                  onClick={createPost}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl hover:scale-105 transition-all"
                  style={{ borderRadius: theme === 'minimal-mod' ? '0' : '12px' }}
                >
                  Опубликовать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="max-w-3xl mx-auto px-4">
        {loading ? (
          <div className="text-center py-12">Загрузка...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-white/50">Пока нет постов</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="glass-strong p-6 rounded-2xl"
                style={{ borderRadius: theme === 'minimal-mod' ? '0' : '16px' }}
              >
                {/* Post Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xl">
                    {post.user_avatar || '👤'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{post.username}</span>
                      <span className="text-xs px-2 py-0.5 bg-purple-500/20 rounded-full">
                        LVL {post.user_level}
                      </span>
                    </div>
                    <span className="text-sm text-white/50">
                      {new Date(post.created_at).toLocaleString('ru-RU')}
                    </span>
                  </div>
                </div>

                {/* Post Content */}
                <p className="mb-4 whitespace-pre-wrap">{post.content}</p>

                {/* Shoppable Tags */}
                {post.shoppable_tags && post.shoppable_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.shoppable_tags.map((tag, idx) => (
                      <button
                        key={idx}
                        onClick={() => navigate(`/products/${tag.product_id}`)}
                        className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full text-sm hover:scale-105 transition-all"
                      >
                        🛒 {tag.product_name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                  <button
                    onClick={() => user && toggleLike(post.id)}
                    className="flex items-center gap-2 hover:text-red-400 transition-all"
                  >
                    <Heart
                      className={`w-5 h-5 ${user && post.liked_by?.includes(user.id) ? 'fill-red-400 text-red-400' : ''}`}
                    />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-green-400 transition-all">
                    <Repeat2 className="w-5 h-5" />
                    <span>{post.reposts}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-400 transition-all">
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.comments_count}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-purple-400 transition-all">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FeedPage;
