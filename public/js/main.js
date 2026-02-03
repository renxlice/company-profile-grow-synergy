// Load console control first
// This script will disable console logs in production
(function() {
    const script = document.createElement('script');
    script.src = '/js/console-control.js';
    script.async = false;
    document.head.appendChild(script);
})();

// Main JavaScript for Data Analytics Training Platform

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileMenu();
    initScrollAnimations();
    initFormValidation();
    initAnalytics();
    initSmoothScroll();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenuButton = document.getElementById('close-menu-btn');
    
    if (mobileMenuButton && mobileMenu) {
        // Set initial position
        mobileMenu.style.transform = 'translateX(100%)';
        
        // Open menu
        mobileMenuButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            mobileMenu.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
            
            // Trigger animation after removing hidden class
            setTimeout(() => {
                mobileMenu.style.transform = 'translateX(0)';
            }, 10);
        });
        
        // Close menu with X button
        if (closeMenuButton) {
            closeMenuButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeMobileMenu();
            });
        }
        
        // Close menu when clicking on links
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeMobileMenu();
                
                // Allow navigation to proceed after closing
                const href = this.getAttribute('href');
                if (href && href !== '#') {
                    setTimeout(() => {
                        window.location.href = href;
                    }, 300);
                }
            });
        });
        
        // Function to close mobile menu
        function closeMobileMenu() {
            mobileMenu.style.transform = 'translateX(100%)';
            document.body.style.overflow = 'auto'; // Restore background scroll
            
            // Add hidden class after animation completes
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300);
        }
        
        // Make closeMobileMenu available globally
        window.closeMobileMenu = closeMobileMenu;
    }
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Form Validation
function initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm(form)) {
                submitForm(form);
            }
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showError(field, 'Field ini wajib diisi');
            isValid = false;
        } else {
            clearError(field);
        }
        
        // Email validation
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                showError(field, 'Format email tidak valid');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

function showError(field, message) {
    clearError(field);
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message text-red-500 text-sm mt-1';
    errorElement.textContent = message;
    
    field.parentNode.appendChild(errorElement);
    field.classList.add('border-red-500');
}

function clearError(field) {
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
    field.classList.remove('border-red-500');
}

function submitForm(form) {
    const submitButton = form.querySelector('[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Mengirim...';
    
    // Simulate form submission
    setTimeout(() => {
        // Reset form
        form.reset();
        
        // Show success message
        showNotification('Form berhasil dikirim!', 'success');
        
        // Reset button
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }, 2000);
}

// Smooth Scroll
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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
}

// Analytics Tracking
function initAnalytics() {
    // Track page views
    trackPageView();
    
    // Track button clicks
    document.querySelectorAll('[data-track]').forEach(element => {
        element.addEventListener('click', function() {
            const eventName = this.getAttribute('data-track');
            const eventParams = {
                action: eventName,
                category: 'User Interaction',
                label: this.textContent.trim()
            };
            
            trackEvent(eventName, eventParams);
        });
    });
    
    // Track form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function() {
            trackEvent('form_submission', {
                action: 'form_submission',
                category: 'Form',
                label: form.getAttribute('data-form-name') || 'Unknown Form'
            });
        });
    });
}

function trackPageView() {
    // Send page view to analytics
    if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID', {
            page_path: window.location.pathname
        });
    }
    
    // Send to custom analytics endpoint
    fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'page_view',
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        })
    }).catch(console.error);
}

function trackEvent(eventName, params) {
    // Send to Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, params);
    }
    
    // Send to custom analytics endpoint
    fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'event',
            eventName: eventName,
            params: params,
            timestamp: new Date().toISOString()
        })
    }).catch(console.error);
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
    } text-white`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('animate-in');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('animate-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Performance Optimization
function optimizeImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize performance optimizations
optimizeImages();

// Export functions for global access
window.DataAnalyticsApp = {
    showNotification,
    trackEvent,
    validateForm
};
