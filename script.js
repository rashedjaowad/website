document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('line-canvas');
    const ctx = canvas.getContext('2d');
    
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    
    // Mouse position
    let mouseX = 0;
    let mouseY = 0;
    
    // Track mouse movement
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Find the Retell chat widget (it will be added by the script)
    let chatWidget = null;
    
    // Function to find the chat widget
    function findChatWidget() {
        // Try to find the Retell chat widget by looking for common selectors
        const possibleSelectors = [
            '[data-retell-widget]',
            '.retell-widget',
            '.retell-chat-widget',
            '#retell-widget',
            '[id*="retell"]',
            '[class*="retell"]',
            '[class*="chat"]',
            '[class*="widget"]'
        ];
        
        for (const selector of possibleSelectors) {
            const element = document.querySelector(selector);
            if (element && element.offsetParent !== null) {
                return element;
            }
        }
        
        // If we can't find it, return a default position (bottom right corner)
        return {
            getBoundingClientRect: () => ({
                left: window.innerWidth - 60,
                top: window.innerHeight - 60,
                width: 60,
                height: 60
            })
        };
    }
    
    // Runway light particles
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.progress = 0; // 0 to 1, where 0 is at mouse and 1 is at chat widget
            this.speed = 0.01 + Math.random() * 0.01; // Random speed for variety
            this.size = 2 + Math.random() * 2; // Random size
            this.opacity = 0.3 + Math.random() * 0.7; // Random opacity
        }
        
        update(startX, startY, endX, endY) {
            this.progress += this.speed;
            
            if (this.progress >= 1) {
                this.reset();
            }
            
            // Calculate position along the line
            this.x = startX + (endX - startX) * this.progress;
            this.y = startY + (endY - startY) * this.progress;
        }
        
        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.opacity * (1 - this.progress * 0.5); // Fade out as it approaches the widget
            ctx.fillStyle = '#6e6e73'; // Medium Gray matching the design
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#6e6e73';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    // Create particles
    const particles = [];
    const lineParticleCount = 15;
    
    for (let i = 0; i < lineParticleCount; i++) {
        const particle = new Particle();
        // Stagger the initial positions
        particle.progress = i / lineParticleCount;
        particles.push(particle);
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Check if mobile - disable runway line on mobile
        const isMobile = window.innerWidth <= 768;
        
        if (!isMobile) {
            // Try to find the chat widget
            if (!chatWidget) {
                chatWidget = findChatWidget();
            }
            
            const chatRect = chatWidget.getBoundingClientRect();
            const chatCenter = {
                x: chatRect.left + chatRect.width / 2,
                y: chatRect.top + chatRect.height / 2
            };
            
            // Draw the line
            ctx.save();
            ctx.strokeStyle = 'rgba(110, 110, 115, 0.3)'; // Semi-transparent Medium Gray
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]); // Dashed line
            ctx.beginPath();
            ctx.moveTo(mouseX, mouseY);
            ctx.lineTo(chatCenter.x, chatCenter.y);
            ctx.stroke();
            ctx.restore();
            
            // Update and draw particles
            particles.forEach(particle => {
                particle.update(mouseX, mouseY, chatCenter.x, chatCenter.y);
                particle.draw(ctx);
            });
        }
        
        requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add click handler for hero button
    document.querySelector('.hero-cta').addEventListener('click', function() {
        // In a real implementation, this would start the bot integration process
        // For demo purposes, we'll scroll to the why section
        document.getElementById('why').scrollIntoView({
            behavior: 'smooth'
        });
    });
    
    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        } else {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        }
    });
    
    // Periodically check for the chat widget (in case it loads later)
    setInterval(() => {
        const newChatWidget = findChatWidget();
        if (newChatWidget !== chatWidget) {
            chatWidget = newChatWidget;
        }
    }, 2000);
    
    // Golden fire animation around navbar
    class FireParticle {
        constructor(angle) {
            this.angle = angle; // Position along the navbar perimeter (0 to 2π)
            this.speed = 0.01 + Math.random() * 0.01; // Counter-clockwise speed
            this.size = 3 + Math.random() * 4;
            this.life = 1.0;
            this.decay = 0.005 + Math.random() * 0.01;
            this.hue = 30 + Math.random() * 30; // Golden hue range (30-60)
            this.saturation = 70 + Math.random() * 30; // High saturation
            this.lightness = 50 + Math.random() * 20; // Bright
        }
        
        update() {
            this.angle -= this.speed; // Counter-clockwise movement
            this.life -= this.decay;
            
            // Reset if particle dies
            if (this.life <= 0) {
                this.life = 1.0;
                this.decay = 0.005 + Math.random() * 0.01;
                this.size = 3 + Math.random() * 4;
            }
        }
        
        draw(ctx, navbarRect) {
            if (this.life <= 0) return;
            
            // Calculate position on the rounded rectangle perimeter
            const centerX = navbarRect.left + navbarRect.width / 2;
            const centerY = navbarRect.top + navbarRect.height / 2;
            const radiusX = navbarRect.width / 2;
            const radiusY = navbarRect.height / 2;
            const cornerRadius = 30; // Match navbar border radius
            
            let x, y;
            
            // Calculate position based on angle
            const normalizedAngle = ((this.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
            
            if (normalizedAngle < Math.PI / 2) {
                // Top edge
                const t = normalizedAngle / (Math.PI / 2);
                x = centerX - radiusX + cornerRadius + (radiusX * 2 - cornerRadius * 2) * t;
                y = centerY - radiusY;
            } else if (normalizedAngle < Math.PI) {
                // Right edge
                const t = (normalizedAngle - Math.PI / 2) / (Math.PI / 2);
                x = centerX + radiusX;
                y = centerY - radiusY + cornerRadius + (radiusY * 2 - cornerRadius * 2) * t;
            } else if (normalizedAngle < 3 * Math.PI / 2) {
                // Bottom edge
                const t = (normalizedAngle - Math.PI) / (Math.PI / 2);
                x = centerX + radiusX - cornerRadius - (radiusX * 2 - cornerRadius * 2) * t;
                y = centerY + radiusY;
            } else {
                // Left edge
                const t = (normalizedAngle - 3 * Math.PI / 2) / (Math.PI / 2);
                x = centerX - radiusX;
                y = centerY + radiusY - cornerRadius - (radiusY * 2 - cornerRadius * 2) * t;
            }
            
            // Draw fire particle
            ctx.save();
            ctx.globalAlpha = this.life * 0.8;
            
            // Create gradient for fire effect
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.size);
            gradient.addColorStop(0, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, 1)`);
            gradient.addColorStop(0.5, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, 0.5)`);
            gradient.addColorStop(1, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add glow effect
            ctx.shadowBlur = 20;
            ctx.shadowColor = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.life * 0.5})`;
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    // Create fire particles
    const fireParticles = [];
    const particleCount = 20;
    
    // Initialize particles distributed around the navbar
    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        fireParticles.push(new FireParticle(angle));
    }
    
    // Animation loop for fire
    function animateFire() {
        fireCtx.clearRect(0, 0, fireCanvas.width, fireCanvas.height);
        
        const navbar = document.querySelector('.navbar');
        const navbarRect = navbar.getBoundingClientRect();
        
        // Update and draw fire particles
        fireParticles.forEach(particle => {
            particle.update();
            particle.draw(fireCtx, navbarRect);
        });
        
        requestAnimationFrame(animateFire);
    }
    
    // Start fire animation
    animateFire();
});
    // Mobile hamburger menu functionality
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    
    hamburgerMenu.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });