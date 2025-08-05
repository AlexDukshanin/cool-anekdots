import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const Card3DAnimation = ({ children }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    
    const animation = {
      x: 0,
      y: 0,
      update: () => {
        gsap.to(card, {
          rotationX: animation.y * 4,
          rotationY: -animation.x * 4,
          transformPerspective: 1000,
          ease: "power2.out",
          duration: 0.5
        });
      }
    };

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      gsap.to(animation, {
        x: x,
        y: y,
        duration: 0.1,
        onUpdate: animation.update
      });
    };

    const handleMouseLeave = () => {
      gsap.to(animation, {
        x: 0,
        y: 0,
        duration: 1,
        onUpdate: animation.update
      });
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div id="card" className="random_anecdot" ref={cardRef}>
      {children}
    </div>
  );
};

export default Card3DAnimation;