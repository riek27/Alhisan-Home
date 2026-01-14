// 360° Image Viewer
class ImageViewer360 {
    constructor() {
        this.currentImage = document.getElementById('currentImage');
        this.viewer = document.getElementById('imageViewer');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.indicatorDots = document.querySelectorAll('.indicator-dot');
        
        this.images = [];
        this.currentIndex = 0;
        this.totalImages = 36;
        this.isDragging = false;
        this.startX = 0;
        this.isAutoRotating = true;
        this.autoRotateInterval = null;
        this.rotationSpeed = 80; // ms per frame
        this.isLoading = true;
        
        this.init();
    }
    
    async init() {
        await this.preloadImages();
        this.setupEventListeners();
        this.startAutoRotation();
        this.updateImage();
    }
    
    preloadImages() {
        return new Promise((resolve) => {
            let loaded = 0;
            
            for (let i = 1; i <= this.totalImages; i++) {
                const img = new Image();
                const imageName = `home_${i.toString().padStart(2, '0')}.webp`;
                img.src = `./images/${imageName}`;
                
                img.onload = () => {
                    loaded++;
                    this.images.push(img);
                    
                    // Update loading progress
                    const progress = Math.round((loaded / this.totalImages) * 100);
                    this.updateLoadingProgress(progress);
                    
                    if (loaded === this.totalImages) {
                        this.isLoading = false;
                        document.querySelector('.viewer-loader').style.display = 'none';
                        this.currentImage.classList.add('loaded');
                        resolve();
                    }
                };
                
                img.onerror = () => {
                    console.warn(`Failed to load image: ${imageName}`);
                    // Fallback to placeholder
                    img.src = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                    loaded++;
                    this.images.push(img);
                    
                    if (loaded === this.totalImages) {
                        this.isLoading = false;
                        document.querySelector('.viewer-loader').style.display = 'none';
                        this.currentImage.classList.add('loaded');
                        resolve();
                    }
                };
            }
        });
    }
    
    updateLoadingProgress(progress) {
        const loader = document.querySelector('.viewer-loader span');
        if (loader) {
            loader.textContent = `Loading Experience... ${progress}%`;
        }
    }
    
    setupEventListeners() {
        // Mouse events
        this.viewer.addEventListener('mousedown', this.startDrag.bind(this));
        this.viewer.addEventListener('mousemove', this.drag.bind(this));
        this.viewer.addEventListener('mouseup', this.endDrag.bind(this));
        this.viewer.addEventListener('mouseleave', this.endDrag.bind(this));
        
        // Touch events
        this.viewer.addEventListener('touchstart', this.startTouch.bind(this));
        this.viewer.addEventListener('touchmove', this.touchDrag.bind(this));
        this.viewer.addEventListener('touchend', this.endDrag.bind(this));
        
        // Control buttons
        this.pauseBtn.addEventListener('click', this.toggleAutoRotation.bind(this));
        this.fullscreenBtn.addEventListener('click', this.toggleFullscreen.bind(this));
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (document.activeElement.tagName === 'INPUT' || 
                document.activeElement.tagName === 'TEXTAREA') return;
                
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.rotate(-1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.rotate(1);
                    break;
                case ' ':
                    e.preventDefault();
                    this.toggleAutoRotation();
                    break;
            }
        });
    }
    
    startDrag(e) {
        this.isDragging = true;
        this.startX = e.clientX || e.touches[0].clientX;
        this.pauseAutoRotation();
        this.viewer.style.cursor = 'grabbing';
    }
    
    startTouch(e) {
        this.isDragging = true;
        this.startX = e.touches[0].clientX;
        this.pauseAutoRotation();
    }
    
    drag(e) {
        if (!this.isDragging || this.isLoading) return;
        
        e.preventDefault();
        const currentX = e.clientX || (e.touches && e.touches[0].clientX);
        if (!currentX) return;
        
        const deltaX = this.startX - currentX;
        const sensitivity = 3; // Higher number = less drag needed
        
        if (Math.abs(deltaX) > sensitivity) {
            const direction = deltaX > 0 ? 1 : -1;
            this.rotate(direction);
            this.startX = currentX;
        }
    }
    
    touchDrag(e) {
        if (!this.isDragging || this.isLoading) return;
        
        e.preventDefault();
        const currentX = e.touches[0].clientX;
        const deltaX = this.startX - currentX;
        const sensitivity = 3;
        
        if (Math.abs(deltaX) > sensitivity) {
            const direction = deltaX > 0 ? 1 : -1;
            this.rotate(direction);
            this.startX = currentX;
        }
    }
    
    endDrag() {
        this.isDragging = false;
        this.viewer.style.cursor = 'grab';
        
        // Resume auto-rotation after a delay
        setTimeout(() => {
            if (!this.isDragging && this.isAutoRotating) {
                this.startAutoRotation();
            }
        }, 2000);
    }
    
    rotate(direction) {
        this.currentIndex = (this.currentIndex + direction + this.totalImages) % this.totalImages;
        this.updateImage();
    }
    
    updateImage() {
        if (this.images[this.currentIndex]) {
            this.currentImage.src = this.images[this.currentIndex].src;
        }
        
        // Update indicator dots
        const activeDotIndex = Math.floor(this.currentIndex / (this.totalImages / 6));
        this.indicatorDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeDotIndex);
        });
    }
    
    startAutoRotation() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
        }
        
        if (this.isAutoRotating) {
            this.autoRotateInterval = setInterval(() => {
                if (!this.isDragging) {
                    this.rotate(1);
                }
            }, this.rotationSpeed);
            
            this.pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
    }
    
    pauseAutoRotation() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }
    }
    
    toggleAutoRotation() {
        this.isAutoRotating = !this.isAutoRotating;
        
        if (this.isAutoRotating) {
            this.startAutoRotation();
            this.pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            this.pauseAutoRotation();
            this.pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.viewer.requestFullscreen?.().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
            this.fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            document.exitFullscreen?.();
            this.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    }
}

// Testimonials Slider
class TestimonialsSlider {
    constructor() {
        this.cards = document.querySelectorAll('.testimonial-card');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.querySelector('.slider-btn.prev');
        this.nextBtn = document.querySelector('.slider-btn.next');
        this.currentIndex = 0;
        
        this.init();
    }
    
    init() {
        this.prevBtn.addEventListener('click', () => this.slide(-1));
        this.nextBtn.addEventListener('click', () => this.slide(1));
        
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Auto-advance testimonials
        setInterval(() => this.slide(1), 8000);
    }
    
    slide(direction) {
        this.cards[this.currentIndex].classList.remove('active');
        this.dots[this.currentIndex].classList.remove('active');
        
        this.currentIndex = (this.currentIndex + direction + this.cards.length) % this.cards.length;
        
        this.cards[this.currentIndex].classList.add('active');
        this.dots[this.currentIndex].classList.add('active');
    }
    
    goToSlide(index) {
        this.cards[this.currentIndex].classList.remove('active');
        this.dots[this.currentIndex].classList.remove('active');
        
        this.currentIndex = index;
        this.cards[this.currentIndex].classList.add('active');
        this.dots[this.currentIndex].classList.add('active');
    }
}

// Mobile Navigation
class MobileNavigation {
    constructor() {
        this.navToggle = document.querySelector('.nav-toggle');
        this.navList = document.querySelector('.nav-list');
        
        this.init();
    }
    
    init() {
        this.navToggle.addEventListener('click', () => {
            this.navList.classList.toggle('active');
            this.navToggle.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.navToggle.contains(e.target) && !this.navList.contains(e.target)) {
                this.navList.classList.remove('active');
                this.navToggle.classList.remove('active');
            }
        });
        
        // Close menu when clicking a link
        this.navList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                this.navList.classList.remove('active');
                this.navToggle.classList.remove('active');
            });
        });
    }
}

// Form Submission
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(this.form);
            const submitBtn = this.form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Simulate form submission
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            try {
                // In a real implementation, you would send to a server
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Show success message
                this.showMessage('Thank you! We\'ll contact you within 24 hours.', 'success');
                this.form.reset();
            } catch (error) {
                this.showMessage('Something went wrong. Please try again.', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) existingMessage.remove();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            padding: 1rem;
            margin-top: 1rem;
            border-radius: 8px;
            background-color: ${type === 'success' ? '#d4edda' : '#f8d7da'};
            color: ${type === 'success' ? '#155724' : '#721c24'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
        `;
        
        this.form.appendChild(messageDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => messageDiv.remove(), 5000);
    }
}

// Smooth Scroll
class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
        // Add smooth scroll to all anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Scroll Animations
class ScrollAnimations {
    constructor() {
        this.observer = null;
        this.init();
    }
    
    init() {
        this.setupIntersectionObserver();
        this.observeElements();
    }
    
    setupIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
    }
    
    observeElements() {
        // Observe elements that should animate on scroll
        document.querySelectorAll('.service-card, .project-card, .about-text, .about-image').forEach(el => {
            this.observer.observe(el);
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize 360° viewer
    const viewer = new ImageViewer360();
    
    // Initialize testimonials slider
    const slider = new TestimonialsSlider();
    
    // Initialize mobile navigation
    const mobileNav = new MobileNavigation();
    
    // Initialize contact form
    const contactForm = new ContactForm();
    
    // Initialize smooth scroll
    const smoothScroll = new SmoothScroll();
    
    // Initialize scroll animations
    const scrollAnimations = new ScrollAnimations();
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .service-card, .project-card, .about-text, .about-image {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .service-card.animate, 
        .project-card.animate, 
        .about-text.animate, 
        .about-image.animate {
            opacity: 1;
            transform: translateY(0);
        }
        
        .service-card:nth-child(2) { transition-delay: 0.1s; }
        .service-card:nth-child(3) { transition-delay: 0.2s; }
        .service-card:nth-child(4) { transition-delay: 0.3s; }
        
        .project-card:nth-child(2) { transition-delay: 0.1s; }
        .project-card:nth-child(3) { transition-delay: 0.2s; }
        .project-card:nth-child(4) { transition-delay: 0.3s; }
    `;
    document.head.appendChild(style);
    
    // Update header on scroll
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const header = document.querySelector('.header');
        
        if (currentScroll > 100) {
            header.style.boxShadow = '0 2px 40px rgba(0, 0, 0, 0.08)';
        } else {
            header.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
});
