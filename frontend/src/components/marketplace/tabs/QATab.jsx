import React, { useState, useMemo } from 'react';
import { ThumbsUp, MessageCircle, User } from 'lucide-react';
import './TabStyles.css';

// Use relative URLs to avoid mixed content issues
const API_URL = '';

// Example Q&A data
const exampleQuestions = [
  {
    id: 1,
    question: 'Do these work well with glasses?',
    username: 'Alex Turner',
    created_at: '2024-12-22',
    upvotes: 45,
    answers: [
      {
        content: 'Yes! I wear glasses daily and they are very comfortable. The earcups are soft and do not put excessive pressure on the arms of my glasses. The padding conforms well to different head shapes.',
        username: 'Sony Support',
        created_at: '2024-12-23',
        is_seller: true
      }
    ]
  },
  {
    id: 2,
    question: 'Can I connect to two devices simultaneously?',
    username: 'Ben Carter',
    created_at: '2024-12-20',
    upvotes: 38,
    answers: [
      {
        content: 'Yes, the WH-1000XM5 supports multipoint connection allowing you to connect to two Bluetooth devices at once. Audio will automatically switch to whichever device is playing.',
        username: 'TechExpert',
        created_at: '2024-12-21',
        is_seller: false
      }
    ]
  },
  {
    id: 3,
    question: 'How does the Speak-to-Chat feature work?',
    username: 'Christina Wong',
    created_at: '2024-12-18',
    upvotes: 29,
    answers: [
      {
        content: 'When you start speaking, the headphones automatically pause the music and let in ambient sound so you can have a conversation. After you stop talking, music resumes after a few seconds. You can adjust the sensitivity in the Sony Headphones Connect app.',
        username: 'Sony Support',
        created_at: '2024-12-19',
        is_seller: true
      }
    ]
  },
  {
    id: 4,
    question: 'What is the difference between XM4 and XM5?',
    username: 'Daniel Park',
    created_at: '2024-12-15',
    upvotes: 52,
    answers: [
      {
        content: 'Main improvements: 1) Better ANC with new QN1 + V1 chip combo, 2) Lighter weight (250g vs 254g), 3) New synthetic leather headband, 4) Improved call quality with 4 beamforming mics, 5) Better quick charging (3 min = 3 hours). The XM5 does not fold like XM4 though.',
        username: 'AudiophileMax',
        created_at: '2024-12-16',
        is_seller: false
      }
    ]
  },
  {
    id: 5,
    question: 'Are replacement ear pads available?',
    username: 'Emma Rodriguez',
    created_at: '2024-12-10',
    upvotes: 15,
    answers: []
  }
];

const QATab = ({ questions: apiQuestions, productId, token }) => {
  // Use API questions if available, otherwise use examples
  const questions = apiQuestions?.length > 0 ? apiQuestions : exampleQuestions;
  
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
      {/* Header */}
      <div className="qa-header">
        <h3>Product Questions & Answers</h3>
        {!showAskQuestion && (
          <button 
            className="btn-ask-question"
            onClick={() => setShowAskQuestion(true)}
          >
            ❓ Ask a Question
          </button>
        )}
      </div>

      {/* Tips Box */}
      <div className="qa-tips glass-card">
        <h4>💡 Tips for asking questions</h4>
        <ul>
          <li>Be specific about what you want to know</li>
          <li>Check existing questions to avoid duplicates</li>
          <li>Questions about shipping, returns? Check our FAQ</li>
        </ul>
      </div>

      {/* Ask Question Form */}
      {showAskQuestion && (
        <div className="ask-question-form glass-card">
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
              type="button"
            >
              Cancel
            </button>
            <button 
              className="btn-submit"
              onClick={handleSubmitQuestion}
              disabled={!newQuestion.trim() || submitting}
              type="button"
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
            <div key={q.id} className="question-card glass-card">
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

              <p className="question-text">❓ {q.question}</p>

              {/* Answers */}
              {q.answers && q.answers.length > 0 ? (
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
              ) : (
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
    </div>
  );
};

export default QATab;
