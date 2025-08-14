// Celebration Effects Module

// Function to trigger a celebratory animation
export function triggerCelebrationAnimation(): void {
  const body = document.body;
  const celebrationDiv = document.createElement('div');
  celebrationDiv.className = 'celebration-animation';

  // Add styles for the animation
  celebrationDiv.style.position = 'fixed';
  celebrationDiv.style.top = '0';
  celebrationDiv.style.left = '0';
  celebrationDiv.style.width = '100%';
  celebrationDiv.style.height = '100%';
  celebrationDiv.style.zIndex = '9999';
  celebrationDiv.style.pointerEvents = 'none';
  celebrationDiv.style.background = 'rgba(255, 255, 0, 0.3)';
  celebrationDiv.style.animation = 'fadeOut 1s ease-out';

  // Append and remove after animation
  body.appendChild(celebrationDiv);
  setTimeout(() => {
    body.removeChild(celebrationDiv);
  }, 1000);
}

// Add keyframes for fadeOut animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`, styleSheet.cssRules.length);
