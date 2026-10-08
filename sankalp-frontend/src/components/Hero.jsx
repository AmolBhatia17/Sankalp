import React from 'react';
import { ArrowRight, BookOpen, ShieldCheck, Zap } from 'lucide-react';

export default function Hero() {
    return (
        <section className="hero-section">
            <div className="hero-container">

                {/* Tagline Badge */}
                <div className="badge">
                    <Zap size={14} />
                    <span>Your Ultimate Academic Partner</span>
                </div>

                {/* Main Title */}
                <h1 className="hero-title">
                    Sankalp: Master Your Syllabus with <span className="highlight-text">Precision</span>
                </h1>

                {/* Quote / Intro */}
                <p className="hero-quote">
                    “Education is not the learning of facts, but the training of the mind to think.”
                    Structured module-wise video lectures engineered for your college exam preparation.
                </p>

                {/* CTA Buttons */}
                <div className="hero-actions">
                    <a href="#courses" className="btn-primary">
                        <span>Explore Paid Courses</span>
                        <ArrowRight size={18} />
                    </a>
                    <a href="#about" className="btn-secondary">
                        <span>Learn About Sankalp</span>
                    </a>
                </div>

                {/* Value Highlights */}
                <div className="features-grid">
                    <div className="feature-item">
                        <BookOpen size={18} color="#34d399" />
                        <span>Syllabus Targeted</span>
                    </div>
                    <div className="feature-item">
                        <ShieldCheck size={18} color="#34d399" />
                        <span>Verified Video Modules</span>
                    </div>
                    <div className="feature-item">
                        <Zap size={18} color="#34d399" />
                        <span>Instant Access</span>
                    </div>
                </div>

            </div>
        </section>
    );
}