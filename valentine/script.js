class ValentineProposal {
    constructor() {
        this.noButton = document.getElementById('noButton');
        this.yesButton = document.getElementById('yesButton');
        this.proposalContainer = document.getElementById('proposalContainer');
        this.successScreen = document.getElementById('successScreen');
        this.confetti = document.getElementById('confetti');
        
        this.noButtonPosition = { x: 0, y: 0 };
        this.dodgeCount = 0;
        this.maxDodgeDistance = 300; // Increased for far movement
        this.disappearTimer = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createConfetti();
    }
    
    setupEventListeners() {
        // Yes button click
        this.yesButton.addEventListener('click', () => {
            this.showSuccessScreen();
        });
        
        // No button hover dodging
        this.noButton.addEventListener('mouseenter', (e) => {
            this.dodgeButton(e);
        });
        
        // Mobile touch support
        this.noButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.dodgeButton(e);
        });
        
        // Track mouse movement for proximity detection
        document.addEventListener('mousemove', (e) => {
            // Only check proximity if button is not dodging
            if (!this.noButton.classList.contains('dodging')) {
                this.checkProximity(e);
            }
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                this.yesButton.click();
            }
        });
    }
    
    checkProximity(event) {
        const rect = this.noButton.getBoundingClientRect();
        const buttonCenterX = rect.left + rect.width / 2;
        const buttonCenterY = rect.top + rect.height / 2;
        
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        
        const distance = Math.sqrt(
            Math.pow(mouseX - buttonCenterX, 2) + 
            Math.pow(mouseY - buttonCenterY, 2)
        );
        
        // Start dodging when cursor is within 80px
        if (distance < 80) {
            this.dodgeButton(event);
        }
    }
    
    dodgeButton(event) {
        // Clear any existing disappear timer
        if (this.disappearTimer) {
            clearTimeout(this.disappearTimer);
        }
        
        // Make button position fixed for far movement
        this.noButton.classList.add('dodging');
        
        // Get current button position
        const buttonRect = this.noButton.getBoundingClientRect();
        
        // Calculate viewport boundaries
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Increase dodge distance significantly with each attempt
        this.dodgeCount++;
        const baseDistance = 200;
        const dodgeDistance = Math.min(500, baseDistance + (this.dodgeCount * 30));
        
        // Generate random position far from current position
        let newX, newY;
        let attempts = 0;
        
        do {
            // Random position anywhere on screen
            newX = Math.random() * (viewportWidth - buttonRect.width);
            newY = Math.random() * (viewportHeight - buttonRect.height);
            attempts++;
        } while (
            attempts < 20 && 
            Math.sqrt(Math.pow(newX - buttonRect.left, 2) + Math.pow(newY - buttonRect.top, 2)) < dodgeDistance
        );
        
        // Ensure minimum distance from current position
        const currentDistance = Math.sqrt(Math.pow(newX - buttonRect.left, 2) + Math.pow(newY - buttonRect.top, 2));
        if (currentDistance < dodgeDistance) {
            // Force to corner positions if too close
            const corners = [
                { x: 20, y: 20 }, // Top-left
                { x: viewportWidth - buttonRect.width - 20, y: 20 }, // Top-right
                { x: 20, y: viewportHeight - buttonRect.height - 20 }, // Bottom-left
                { x: viewportWidth - buttonRect.width - 20, y: viewportHeight - buttonRect.height - 20 } // Bottom-right
            ];
            
            // Pick the farthest corner
            let farthestCorner = corners[0];
            let maxDistance = 0;
            
            corners.forEach(corner => {
                const distance = Math.sqrt(Math.pow(corner.x - buttonRect.left, 2) + Math.pow(corner.y - buttonRect.top, 2));
                if (distance > maxDistance) {
                    maxDistance = distance;
                    farthestCorner = corner;
                }
            });
            
            newX = farthestCorner.x;
            newY = farthestCorner.y;
        }
        
        // Apply transformation with smooth animation
        this.noButton.style.left = newX + 'px';
        this.noButton.style.top = newY + 'px';
        this.noButton.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            this.noButton.style.transform = 'scale(1)';
        }, 200);
        
        // Set timer to hide button after 6 seconds of no interaction
        this.disappearTimer = setTimeout(() => {
            this.hideNoButton();
        }, 6000);
        
        // Taunt messages after multiple dodges
        if (this.dodgeCount === 2) {
            this.showTaunt("I'm not that easy to catch! 😏");
        } else if (this.dodgeCount === 4) {
            this.showTaunt("Come on, you know you want to say yes! 😉");
        } else if (this.dodgeCount === 7) {
            this.showTaunt("I'm not giving up! 💕");
        } else if (this.dodgeCount === 10) {
            this.showTaunt("Okay, you're really good at this... but I believe in us! ✨");
            // Hide button after 10 attempts
            setTimeout(() => {
                this.hideNoButton();
            }, 3000);
        }
    }
    
    showTaunt(message) {
        const taunt = document.createElement('div');
        taunt.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 1000;
            animation: fadeInOut 3s ease-in-out forwards;
        `;
        taunt.textContent = message;
        
        // Add CSS animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(taunt);
        
        setTimeout(() => {
            document.body.removeChild(taunt);
            document.head.removeChild(style);
        }, 3000);
    }
    
    hideNoButton() {
        this.noButton.classList.add('hiding');
        this.noButton.classList.remove('dodging');
        
        // Show encouraging message when button disappears
        this.showTaunt("Fine, I'll make it easy for you... 💕");
        
        // After fade out completes, show a final encouraging message
        setTimeout(() => {
            this.showTaunt("The Yes button is waiting for you! 😉");
        }, 2000);
    }
    
    showSuccessScreen() {
        this.successScreen.classList.remove('hidden');
        setTimeout(() => {
            this.successScreen.classList.add('show');
        }, 50);
        
        this.triggerConfetti();
        this.playSuccessAnimations();
    }
    
    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];
        
        for (let i = 0; i < 50; i++) {
            const confettiPiece = document.createElement('div');
            confettiPiece.className = 'confetti-piece';
            confettiPiece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confettiPiece.style.left = Math.random() * 100 + '%';
            confettiPiece.style.animationDelay = Math.random() * 3 + 's';
            confettiPiece.style.animationDuration = (Math.random() * 2 + 3) + 's';
            this.confetti.appendChild(confettiPiece);
        }
    }
    
    triggerConfetti() {
        const confettiPieces = this.confetti.querySelectorAll('.confetti-piece');
        confettiPieces.forEach((piece, index) => {
            setTimeout(() => {
                piece.style.animationPlayState = 'running';
            }, index * 50);
        });
        
        // Restart confetti animation
        setTimeout(() => {
            confettiPieces.forEach(piece => {
                piece.style.animationPlayState = 'paused';
                piece.style.animation = 'none';
                piece.offsetHeight; // Trigger reflow
                piece.style.animation = 'confettiFall 3s linear infinite';
                piece.style.animationPlayState = 'running';
            });
        }, 100);
    }
    
    playSuccessAnimations() {
        // Add extra sparkle effects
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createSparkle();
            }, i * 200);
        }
    }
    
    createSparkle() {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        sparkle.style.cssText = `
            position: fixed;
            font-size: ${Math.random() * 20 + 10}px;
            left: ${Math.random() * 100}vw;
            top: ${Math.random() * 100}vh;
            pointer-events: none;
            animation: sparkleAnimation 2s ease-out forwards;
            z-index: 999;
        `;
        
        const sparkleStyle = document.createElement('style');
        sparkleStyle.textContent = `
            @keyframes sparkleAnimation {
                0% { opacity: 0; transform: scale(0) rotate(0deg); }
                50% { opacity: 1; transform: scale(1) rotate(180deg); }
                100% { opacity: 0; transform: scale(0) rotate(360deg); }
            }
        `;
        document.head.appendChild(sparkleStyle);
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
            document.body.removeChild(sparkle);
            document.head.removeChild(sparkleStyle);
        }, 2000);
    }
}

// Initialize the proposal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ValentineProposal();
});

// Add some Easter eggs
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        // Easter egg: Extra romantic message
        const easterEgg = document.createElement('div');
        easterEgg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ff9a9e, #fecfef);
            color: #2c3e50;
            padding: 20px;
            border-radius: 15px;
            font-size: 18px;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: easterEggPop 3s ease-in-out forwards;
        `;
        easterEgg.innerHTML = `
            <div>🎮 Konami Code Activated! 🎮</div>
            <div style="margin-top: 10px;">You're as awesome as you are beautiful! 💕</div>
        `;
        
        const easterStyle = document.createElement('style');
        easterStyle.textContent = `
            @keyframes easterEggPop {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
                20%, 80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
            }
        `;
        document.head.appendChild(easterStyle);
        document.body.appendChild(easterEgg);
        
        setTimeout(() => {
            document.body.removeChild(easterEgg);
            document.head.removeChild(easterStyle);
        }, 3000);
        
        konamiCode = [];
    }
});