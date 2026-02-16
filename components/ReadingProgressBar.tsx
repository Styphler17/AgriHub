import React, { useState, useEffect } from 'react';

interface Props {
    containerRef?: React.RefObject<HTMLDivElement>;
}

const ReadingProgressBar: React.FC<Props> = ({ containerRef }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            let currentProgress = 0;
            if (containerRef?.current) {
                const container = containerRef.current;
                const scrollHeight = container.scrollHeight - container.clientHeight;
                if (scrollHeight > 0) {
                    currentProgress = (container.scrollTop / scrollHeight) * 100;
                }
            } else {
                const h = document.documentElement;
                const b = document.body;
                const st = 'scrollTop';
                const sh = 'scrollHeight';
                const scrollHeight = (h[sh] || b[sh]) - h.clientHeight;
                if (scrollHeight > 0) {
                    currentProgress = ((h[st] || b[st]) / scrollHeight) * 100;
                }
            }
            setProgress(currentProgress);
        };

        if (containerRef?.current) {
            const container = containerRef.current;
            container.addEventListener('scroll', handleScroll);
            handleScroll();
            return () => container.removeEventListener('scroll', handleScroll);
        } else {
            window.addEventListener('scroll', handleScroll);
            handleScroll();
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [containerRef]);

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent">
            <div
                className="h-full bg-gradient-to-r from-red-600 via-amber-400 to-green-600 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(251,191,36,0.4)]"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};

export default ReadingProgressBar;
