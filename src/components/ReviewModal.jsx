import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';

export default function ReviewModal({ isOpen, onClose }) {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [studentName, setStudentName] = useState('');
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reviewText.trim()) return;
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setReviewText('');
            setStudentName('');
            onClose();
        }, 1800);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                {submitted ? (
                    <div className="modal-success">
                        <div className="success-icon">✓</div>
                        <h3>Thank You!</h3>
                        <p>Your review has been recorded to help us improve Sankalp.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="review-form">
                        <h3 className="modal-title">Leave a Review</h3>
                        <p className="modal-subtitle">Tell us about your experience using Sankalp.</p>

                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    className="star-btn"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                >
                                    <Star
                                        size={24}
                                        fill={(hoverRating || rating) >= star ? "#34d399" : "transparent"}
                                        color={(hoverRating || rating) >= star ? "#34d399" : "#64748b"}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="form-group">
                            <label>Your Name (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. Rahul Sharma"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Your Review / Feedback</label>
                            <textarea
                                rows="4"
                                required
                                placeholder="What did you like about the courses or website?"
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn-primary w-full">
                            <span>Submit Feedback</span>
                            <Send size={16} />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}