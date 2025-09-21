

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLoggedHours } from '../../contexts/LoggedHoursContext';
import { useOpportunities } from '../../contexts/OpportunityContext';
import { MOCK_ORGANIZATIONS } from '../../data/mockData'; // Using mock for partner count as example

const NewLandingPage: React.FC = () => {
  const { loggedHours } = useLoggedHours();
  const { opportunities } = useOpportunities();

  const navRef = useRef<HTMLElement>(null);
  const fadeInElementsRef = useRef<HTMLElement[]>([]);
  const statNumberElementsRef = useRef<HTMLElement[]>([]);
  const floatingShapesRef = useRef<HTMLDivElement>(null);

  const totalVolunteers = React.useMemo(() => new Set(loggedHours.map(log => log.userId)).size, [loggedHours]);
  const totalHoursContributed = React.useMemo(() => loggedHours.reduce((sum, log) => sum + log.hours, 0), [loggedHours]);
  const partnerOrganizationsCount = MOCK_ORGANIZATIONS.length; // Example: using mock data length
  const communitiesImpactedCount = 200; // Static as per original HTML

  useEffect(() => {
    fadeInElementsRef.current = Array.from(document.querySelectorAll('.fade-in')) as HTMLElement[];
    statNumberElementsRef.current = Array.from(document.querySelectorAll('.stat-number')) as HTMLElement[];
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    fadeInElementsRef.current.forEach(el => {
        if (el) observer.observe(el);
    });

    // Smooth scrolling for navigation links
    const smoothScrollLinks = document.querySelectorAll('nav.landing-nav a[href^="#"]');
    const handleSmoothScroll = function (this: HTMLAnchorElement, e: MouseEvent) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = targetId ? document.querySelector(targetId) : null;
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };
    smoothScrollLinks.forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScroll as EventListener);
    });

    // Dynamic navigation background on scroll
    const handleNavScroll = () => {
        const nav = navRef.current; // document.querySelector('nav.landing-nav');
        if (nav) {
            if (window.scrollY > 100) {
                nav.style.background = 'rgba(0, 0, 0, 0.8)';
            } else {
                nav.style.background = 'rgba(0, 0, 0, 0.3)';
            }
        }
    };
    window.addEventListener('scroll', handleNavScroll);

    // Animated counter for stats
    function animateCounters() {
        statNumberElementsRef.current.forEach(counter => {
            const originalText = counter.dataset.text || counter.textContent || "0";
            const target = parseInt(originalText.replace(/[^\d]/g, ''));
            const suffix = originalText.replace(/[\d]/g, '');
            
            let current = 0;
            const increment = target / 100; // Adjust for speed
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target.toLocaleString() + suffix;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current).toLocaleString() + suffix;
                }
            }, 20); // Update interval
        });
    }

    // Trigger counter animation when stats section is visible
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    statsObserver.unobserve(entry.target); // Disconnect after firing once
                }
            });
        }, { threshold: 0.1 });
        statsObserver.observe(statsSection);
    }


    // Add subtle mouse movement parallax effect to floating shapes only
    const handleMouseMoveParallax = (e: MouseEvent) => {
        if(floatingShapesRef.current){
            const shapes = floatingShapesRef.current.querySelectorAll('.shape');
            const x = (e.clientX / window.innerWidth) - 0.5; // Centered
            const y = (e.clientY / window.innerHeight) - 0.5; // Centered
            
            shapes.forEach((shapeEl, index) => {
                const shape = shapeEl as HTMLElement;
                const speed = (index % 4 + 1) * 2; // Different speeds for variety, limit max factor
                const offsetX = x * speed * 5; // Multiplier for parallax strength
                const offsetY = y * speed * 5;
                // We are animating transform: translateY in CSS for the main float.
                // To add parallax, we need to apply a secondary transform or adjust the existing one.
                // Simpler: use a fixed transform for float and a dynamic one for parallax
                // This current implementation might conflict with existing CSS animation if not careful.
                // Let's keep the CSS animation for the main floating and add a slight nudge.
                // shape.style.transform = `translateX(${offsetX}px) translateY(calc(var(--float-y, 0) + ${offsetY}px)) rotate(var(--float-rotate, 0deg))`;
                // The original CSS animation for .shape has transform: translateY and rotate.
                // Directly setting transform here will override it.
                // A better way would be to have nested elements or use CSS variables if the animation supports it.
                // For simplicity, let's assume the original CSS animation handles the large float and this adds small mouse-based offsets.
                // This specific parallax part might need fine-tuning to work perfectly with the CSS float.
            });
        }
    };
    // document.addEventListener('mousemove', handleMouseMoveParallax); // Parallax can be performance intensive, enable if desired.

    return () => {
        observer.disconnect();
        smoothScrollLinks.forEach(anchor => {
            anchor.removeEventListener('click', handleSmoothScroll as EventListener);
        });
        window.removeEventListener('scroll', handleNavScroll);
        // document.removeEventListener('mousemove', handleMouseMoveParallax);
        // Clear any timers if active for counters, though they clear themselves.
    };
  }, []); // Empty dependency array to run once on mount

  return (
    <>
      {/* Animated Background */}
      <div className="bg-container">
        <div className="gradient-overlay"></div>
        <div className="floating-shapes" ref={floatingShapesRef}>
            <div className="shape"></div>
            <div className="shape"></div>
            <div className="shape"></div>
            <div className="shape"></div>
            <div className="shape"></div>
            <div className="shape"></div>
            <div className="shape"></div>
            <div className="shape"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="landing-nav" ref={navRef}>
          <div className="nav-container">
              <div className="logo">VolunTrack</div>
              <ul className="nav-links">
                  <li><a href="#home">Home</a></li>
                  <li><a href="#features">Features</a></li>
                  <li><a href="#impact">Impact</a></li>
                  <li><a href="#contact">Contact</a></li>
              </ul>
          </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
          <div className="hero-content">
              <h1 className="hero-title">Empowering Student Volunteers</h1>
              <p className="hero-subtitle">
                  VolunTrack is your central hub for student volunteerism. Find meaningful opportunities, 
                  track your impact, and witness the collective power of student volunteer efforts in your community.
              </p>
              <div className="cta-buttons">
                  <Link to="/login" className="btn btn-primary">Start Volunteering</Link>
                  <a href="#features" className="btn btn-secondary">Learn More</a>
              </div>
          </div>
      </section>

      {/* Features Section */}
      <section className="features fade-in" id="features">
          <div className="features-container">
              <h2 className="section-title">Revolutionizing Student Volunteerism</h2>
              <p className="section-subtitle">
                  Discover how VolunTrack transforms the way students engage with their community through 
                  innovative features designed for maximum impact.
              </p>
              
              <div className="features-grid">
                  <div className="feature-card">
                      <div className="feature-icon">🎯</div>
                      <h3 className="feature-title">Opportunity Aggregation</h3>
                      <p className="feature-description">
                          Discover curated volunteer opportunities from across your community, 
                          all in one centralized platform tailored for students.
                      </p>
                  </div>
                  
                  <div className="feature-card">
                      <div className="feature-icon">📊</div>
                      <h3 className="feature-title">Impact Tracking</h3>
                      <p className="feature-description">
                          Visualize your individual and collective impact with comprehensive 
                          analytics and progress tracking tools.
                      </p>
                  </div>
                  
                  <div className="feature-card">
                      <div className="feature-icon">🤝</div>
                      <h3 className="feature-title">Community Connection</h3>
                      <p className="feature-description">
                          Connect with like-minded students, form volunteer groups, 
                          and build lasting relationships through shared service.
                      </p>
                  </div>
                  
                  <div className="feature-card">
                      <div className="feature-icon">🌟</div>
                      <h3 className="feature-title">Recognition System</h3>
                      <p className="feature-description">
                          Earn badges, certificates, and recognition for your volunteer efforts 
                          to showcase your community involvement.
                      </p>
                  </div>
                  
                  <div className="feature-card">
                      <div className="feature-icon">📱</div>
                      <h3 className="feature-title">Mobile-First Design</h3>
                      <p className="feature-description">
                          Access opportunities, log hours, and track progress seamlessly 
                          from any device, anywhere, anytime.
                      </p>
                  </div>
                  
                  <div className="feature-card">
                      <div className="feature-icon">🎓</div>
                      <h3 className="feature-title">Skill Development</h3>
                      <p className="feature-description">
                          Develop valuable skills through structured volunteer experiences 
                          that enhance your academic and professional journey.
                      </p>
                  </div>
              </div>
          </div>
      </section>

      {/* Stats Section */}
      <section className="stats fade-in" id="impact">
          <div className="stats-container">
              <div className="stat-item">
                  <span className="stat-number" data-text={totalVolunteers + "+"}>{totalVolunteers.toLocaleString()}+</span>
                  <span className="stat-label">Active Student Volunteers</span>
              </div>
              <div className="stat-item">
                  <span className="stat-number" data-text={partnerOrganizationsCount + "+"}>{partnerOrganizationsCount.toLocaleString()}+</span>
                  <span className="stat-label">Partner Organizations</span>
              </div>
              <div className="stat-item">
                  <span className="stat-number" data-text={Math.floor(totalHoursContributed/1000) + "K+"}>{Math.floor(totalHoursContributed/1000).toLocaleString()}K+</span>
                  <span className="stat-label">Hours Contributed</span>
              </div>
              <div className="stat-item">
                  <span className="stat-number" data-text={communitiesImpactedCount + "+"}>{communitiesImpactedCount.toLocaleString()}+</span>
                  <span className="stat-label">Communities Impacted</span>
              </div>
          </div>
      </section>

      {/* Call to Action */}
      <section className="cta fade-in" id="contact">
          <div className="cta-content">
              <h2 className="cta-title">Ready to Make a Difference?</h2>
              <p className="cta-description">
                  Join thousands of students who are already making a meaningful impact in their communities. 
                  Start your volunteer journey today and be part of something bigger.
              </p>
              <div className="cta-buttons">
                  <Link to="/login" className="btn btn-primary">Get Started Today</Link>
              </div>
          </div>
      </section>
    </>
  );
};

export default NewLandingPage;