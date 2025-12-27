import React, { useState } from 'react';
import { ThumbsUp, MessageCircle, Send, User } from 'lucide-react';
import './TabStyles.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const QATab = ({ questions, productId, token }) => {
  const [showAskQuestion, setShowAskQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState({});

  const handleSubmitQuestion = async () => {
    if (!token || !newQuestion.trim()) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/questions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          question: newQuestion
        })
      });

      if (response.ok) {
        setNewQuestion('');
        setShowAskQuestion(false);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAnswers = (questionId) => {
    setExpandedAnswers(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  return (
    <div className="tab-qa">
      {/* Ask Question Button */}
      {token && !showAskQuestion && (
        <button 
          className="btn-ask-question"
          onClick={() => setShowAskQuestion(true)}
        >
          ❓ Ask a Question
        </button>
      )}

      {/* Ask Question Form */}
      {showAskQuestion && (
        <div className="ask-question-form">
          <h4>Ask Your Question</h4>
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="What would you like to know about this product?"
            rows={3}
            className="form-textarea"
          />
          <div className="form-actions">
            <button 
              className="btn-cancel"
              onClick={() => setShowAskQuestion(false)}
            >
              Cancel
            </button>
            <button 
              className="btn-submit"
              onClick={handleSubmitQuestion}
              disabled={!newQuestion.trim() || submitting}
            >
              {submitting ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="questions-list">
        {questions.length > 0 ? (
          questions.map(q => (
            <div key={q.id} className="question-card">
              <div className="question-header">
                <div className="questioner-info">
                  <div className="questioner-avatar">
                    {(q.username || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <strong>{q.username || 'Anonymous'}</strong>
                    <span className="question-date">
                      {new Date(q.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="question-stats">
                  <button className="upvote-btn">
                    <ThumbsUp size={14} />
                    {q.upvotes || 0}
                  </button>
                </div>
              </div>

              <p className="question-text">{q.question}</p>

              {/* Answers */}
              {q.answers && q.answers.length > 0 && (
                <div className="answers-section">
                  <button 
                    className="show-answers-btn"
                    onClick={() => toggleAnswers(q.id)}
                  >
                    <MessageCircle size={14} />
                    {expandedAnswers[q.id] ? 'Hide' : 'Show'} {q.answers.length} answer{q.answers.length > 1 ? 's' : ''}
                  </button>

                  {expandedAnswers[q.id] && (
                    <div className="answers-list">
                      {q.answers.map((answer, idx) => (
                        <div key={idx} className={`answer-card ${answer.is_seller ? 'official' : ''}`}>
                          <div className="answer-header">
                            <User size={14} />
                            <strong>{answer.username || 'Anonymous'}</strong>
                            {answer.is_seller && (
                              <span className="official-badge">
                                ✅ Official Response
                              </span>
                            )}
                            <span className="answer-date">
                              {answer.created_at ? new Date(answer.created_at).toLocaleDateString() : ''}
                            </span>
                          </div>
                          <p className="answer-content">{answer.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(!q.answers || q.answers.length === 0) && (
                <div className="no-answers">
                  <span>💬 No answers yet</span>
                  {token && (
                    <button className="btn-answer">Be the first to answer</button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="tab-no-content">
            <span className="no-content-icon">❓</span>
            <p>No questions yet. Be the first to ask!</p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="qa-tips">
        <h4>💡 Tips for asking questions</h4>
        <ul>
          <li>Be specific about what you want to know</li>
          <li>Check existing questions to avoid duplicates</li>
          <li>Questions about shipping, returns? Check our FAQ</li>
        </ul>
      </div>
    </div>
  );
};

export default QATab;
