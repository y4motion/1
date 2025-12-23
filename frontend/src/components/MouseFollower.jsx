import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/mouseFollower.css';

const MouseFollower = () => {
  const followerRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const follower = followerRef.current;
    if (!follower) return;

    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animate = () => {
      // Smooth follow effect
      const dx = mouseX - followerX;
      const dy = mouseY - followerY;

      followerX += dx * 0.1;
      followerY += dy * 0.1;

      follower.style.transform = `translate(${followerX - 150}px, ${followerY - 150}px)`;

      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <div ref={followerRef} className={`mouse-follower ${theme}`} />;
};

export default MouseFollower;
