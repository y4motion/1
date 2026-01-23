/**
 * ActivePoll.jsx
 * Real-time voting widget with dotted progress bars
 * Nothing aesthetics: Monochrome + red accent
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { KineticWidget, DottedProgress, springBouncy } from './KineticWidget';

const MOCK_POLL = {
  title: "NEXT DROP",
  totalVotes: 2847,
  options: [
    { id: 1, name: "Void Carpet", votes: 1247, color: '#FF0000' },
    { id: 2, name: "Signal Rug", votes: 892, color: 'white' },
    { id: 3, name: "Echo Sleeve", votes: 708, color: 'white' }
  ]
};

export const ActivePoll = ({ 
  poll = MOCK_POLL,
  onVote,
  className = ''
}) => {
  const [votes, setVotes] = useState(poll.options.map(o => o.votes));
  const [hasVoted, setHasVoted] = useState(false);
  const totalVotes = votes.reduce((a, b) => a + b, 0);
  
  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setVotes(prev => {
        const idx = Math.floor(Math.random() * prev.length);
        const newVotes = [...prev];
        newVotes[idx] += Math.random() > 0.5 ? 1 : 0;
        return newVotes;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleVote = (optionId, index) => {
    if (hasVoted) return;
    
    setVotes(prev => {
      const newVotes = [...prev];
      newVotes[index] += 1;
      return newVotes;
    });
    setHasVoted(true);
    onVote?.(optionId);
  };
  
  return (
    <KineticWidget className={`active-poll-widget ${className}`}>
      <div className="active-poll">
        <div className="poll-header">
          <span className="poll-title">{poll.title}</span>
          <span className="poll-votes">{totalVotes.toLocaleString()} VOTES</span>
        </div>
        
        <div className="poll-options">
          {poll.options.map((option, i) => {
            const percent = totalVotes > 0 ? (votes[i] / totalVotes) * 100 : 0;
            const isLeading = votes[i] === Math.max(...votes);
            
            return (
              <motion.div
                key={option.id}
                className="poll-option"
                onClick={() => handleVote(option.id, i)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="poll-option-label">
                  <span className="option-name">
                    {option.name}
                    {isLeading && <span style={{ color: '#FF0000', marginLeft: 8 }}>●</span>}
                  </span>
                  <motion.span 
                    className="option-percent"
                    key={votes[i]}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                  >
                    {Math.round(percent)}%
                  </motion.span>
                </div>
                <DottedProgress 
                  value={percent} 
                  max={100}
                  color={isLeading ? '#FF0000' : 'rgba(255,255,255,0.5)'}
                  showValue={false}
                />
              </motion.div>
            );
          })}
        </div>
        
        {hasVoted && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              fontSize: 10, 
              color: 'rgba(255,255,255,0.4)', 
              textAlign: 'center',
              marginTop: 12
            }}
          >
            VOTE RECORDED
          </motion.p>
        )}
      </div>
    </KineticWidget>
  );
};

export default ActivePoll;
