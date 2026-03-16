import Hammer from "hammerjs";

export function initSwipeCard(
  cardElement: HTMLElement,
  onSwiped: (direction: 'left' | 'right') => void
) {
  const hammer = new Hammer(cardElement);
  
  // Enable pan in all directions
  hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

  hammer.on('pan', (e) => {
    // Prevent dragging if it's the skeleton loader
    if (cardElement.classList.contains('is-skeleton')) return;

    // Calculate rotation and movement
    const xMulti = e.deltaX * 0.05;
    const yMulti = e.deltaY / 80;
    const rotate = xMulti * yMulti;
    
    // Apply visual transformation immediately
    cardElement.style.transform = `translate(${e.deltaX}px, ${e.deltaY}px) rotate(${rotate}deg)`;
    cardElement.style.transition = 'none'; // Remove transition while dragging
  });

  hammer.on('panend', (e) => {
    if (cardElement.classList.contains('is-skeleton')) return;

    cardElement.style.transition = 'transform 0.3s ease-out';
    
    const moveOutWidth = document.body.clientWidth;
    // Threshold to trigger a full swipe (dragged 100px or fast velocity)
    const keep = Math.abs(e.deltaX) < 100 && Math.abs(e.velocityX) < 0.5;

    if (keep) {
      // Snap back to center
      cardElement.style.transform = '';
    } else {
      // Throw card off screen
      const endX = Math.max(Math.abs(e.velocityX) * moveOutWidth, moveOutWidth);
      const toX = e.deltaX > 0 ? endX : -endX;
      const endY = Math.abs(e.velocityY) * moveOutWidth;
      const toY = e.deltaY > 0 ? endY : -endY;
      
      cardElement.style.transform = `translate(${toX}px, ${toY + e.deltaY}px) rotate(${e.deltaX * 0.1}deg)`;
      
      // Wait for animation, then trigger callback
      setTimeout(() => {
        cardElement.classList.add('removed');
        cardElement.remove();
        onSwiped(e.deltaX > 0 ? 'right' : 'left');
      }, 300);
    }
  });
}
