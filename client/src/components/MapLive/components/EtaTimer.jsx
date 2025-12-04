import React, { useState, useEffect } from 'react';
import './EtaTimer.css';

const EtaTimer = ({ etaSeconds, lastUpdated }) => {
    const [remainingSeconds, setRemainingSeconds] = useState(etaSeconds);
    
    useEffect(() => {
        // Reset remaining time when new ETA received from server
        setRemainingSeconds(etaSeconds);
    }, [etaSeconds, lastUpdated]);
    
    useEffect(() => {
        // Countdown timer that ticks every 60 seconds
        const interval = setInterval(() => {
            setRemainingSeconds(prev => Math.max(0, prev - 60));
        }, 60000);
        
        return () => clearInterval(interval);
    }, []);
    
    // Calculate minutes, never show less than 1 minute
    const minutes = Math.max(1, Math.ceil(remainingSeconds / 60));
    
    return (
        <div className="eta-banner glass">
            <div className="eta-content">
                <span className="eta-icon">🚗</span>
                <div className="eta-text">
                    <span className="eta-status">Helper is on the way</span>
                    <span className="eta-time">
                        Estimated arrival in <strong>{minutes}</strong> {minutes === 1 ? 'minute' : 'minutes'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default EtaTimer;
