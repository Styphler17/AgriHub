import React from 'react';
// AgriHub Landing Page Component
import { Sprout, TrendingUp, Cloud, Users, ArrowRight, CheckCircle, Smartphone, Shield, Zap, ArrowUp as ArrowLoader } from 'lucide-react';
import ReadingProgressBar from './ReadingProgressBar';

// Scroll Reveal Component
const Reveal: React.FC<{ children: React.ReactNode; className?: string; direction?: 'up' | 'down' | 'left' | 'right'; delay?: number }> = ({ children, className = '', direction = 'up', delay = 0 }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false); // Reset to animate again when scrolling up/down
                }
            },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const directionClasses = {
        up: 'translate-y-10',
        down: '-translate-y-10',
        left: '-translate-x-10',
        right: 'translate-x-10',
    };

    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0 translate-x-0' : `opacity-0 ${directionClasses[direction]}`
                } ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

interface Props {
    onGetStarted: () => void;
    onSignIn: () => void;
    isLoggedIn?: boolean;
    onLogout?: () => void;
}

const LandingPage: React.FC<Props> = ({ onGetStarted, onSignIn, isLoggedIn, onLogout }) => {
    const [showScrollTop, setShowScrollTop] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <ReadingProgressBar />
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={scrollToTop}>
                        <img src="/logo.png" alt="AgriHub Logo" className="w-auto h-16 object-contain" />
                        <div>
                            <h1 className="text-2xl font-black text-green-600">AgriHub</h1>
                            <p className="text-[8px] uppercase tracking-widest font-bold text-slate-400">Ghana</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={isLoggedIn ? onLogout : onSignIn}
                            className="px-6 py-3 rounded-2xl font-black text-sm border-2 border-slate-200 hover:border-green-600 hover:text-green-600 transition-all backdrop-blur-sm bg-white/50 text-slate-900"
                        >
                            {isLoggedIn ? 'Sign Out' : 'Sign In'}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-[100dvh] flex items-center bg-gradient-to-br from-white via-green-50/30 to-white">

                <div className="max-w-7xl mx-auto relative z-10 w-full">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                        {/* Left: Content */}
                        <div className="space-y-6 lg:space-y-8 animate-in slide-in-from-left duration-700 order-2 lg:order-1 slide-in-from-bottom-10 fade-in-0 fill-mode-backwards">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 bg-green-100 text-green-700 rounded-full text-[10px] lg:text-xs font-black uppercase tracking-widest backdrop-blur-sm border border-green-200 shadow-sm hover:shadow-md transition-all cursor-default">
                                <Zap size={12} className="animate-pulse text-green-500" />
                                Trusted by 10,000+ Farmers
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black leading-tight drop-shadow-sm tracking-tight text-slate-900">
                                Empowering Ghana's{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500 relative inline-block">
                                    Farmers
                                    <svg className="absolute w-full h-3 -bottom-1 left-0 text-green-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                        <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                    </svg>
                                </span>{' '}
                                with Technology
                            </h1>

                            <p className="text-lg lg:text-xl text-slate-600 leading-relaxed font-medium max-w-lg">
                                Access real-time market prices, weather forecasts, and AI-powered crop advice.
                                Connect with buyers and maximize your harvest profits.
                            </p>

                            <div className="flex flex-col gap-4 pt-4">
                                <button
                                    onClick={onGetStarted}
                                    className="group px-8 py-4 lg:py-5 bg-green-600 text-white rounded-[1.5rem] lg:rounded-[2rem] font-black text-base lg:text-lg shadow-xl shadow-green-600/20 hover:bg-green-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden w-full sm:w-auto"
                                >
                                    <span className="relative z-10 flex items-center gap-3">
                                        {isLoggedIn ? 'Enter Dashboard' : 'Get Started Free'}
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-[1.5rem]"></div>
                                </button>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={isLoggedIn ? onLogout : onSignIn}
                                        className="px-8 py-4 lg:py-5 border-2 border-slate-200 rounded-[1.5rem] lg:rounded-[2rem] font-black text-base lg:text-lg hover:border-green-600 hover:text-green-600 transition-all backdrop-blur-sm bg-white/50 text-slate-900 w-full sm:w-auto"
                                    >
                                        {isLoggedIn ? 'Sign Out' : 'Sign In'}
                                    </button>
                                    {!isLoggedIn && (
                                        <button
                                            onClick={() => {
                                                // Trigger guest mode
                                                localStorage.setItem('agrihub_active_tab', 'prices');
                                                window.location.reload(); // Simple reload to trigger guest state or pass a prop to parent to switch tab
                                            }}
                                            className="px-8 py-4 lg:py-5 border-2 border-slate-200 rounded-[1.5rem] lg:rounded-[2rem] font-black text-base lg:text-lg hover:border-blue-600 hover:text-blue-600 transition-all backdrop-blur-sm bg-white/50 text-slate-900 flex items-center justify-center gap-2 w-full sm:w-auto"
                                        >
                                            <TrendingUp size={20} /> Markets
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="flex flex-wrap items-center gap-4 lg:gap-8 pt-6 border-t border-slate-200">
                                <div className="flex items-center gap-2 group cursor-default">
                                    <CheckCircle size={18} className="text-green-600 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs lg:text-sm font-bold text-slate-600">100% Free</span>
                                </div>
                                <div className="flex items-center gap-2 group cursor-default">
                                    <Shield size={18} className="text-green-600 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs lg:text-sm font-bold text-slate-600">Secure</span>
                                </div>
                                <div className="flex items-center gap-2 group cursor-default">
                                    <Smartphone size={18} className="text-green-600 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs lg:text-sm font-bold text-slate-600">Offline Ready</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Visual */}
                        <div className="relative animate-in slide-in-from-right duration-1000 delay-200 hidden lg:block order-1 lg:order-2">
                            <picture>
                                <source
                                    type="image/webp"
                                    srcSet="/hero-image.png"
                                />
                                <img
                                    src="/hero-image.png"
                                    alt="Ghanaian Farmer Using AgriHub"
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-auto rounded-[3rem] shadow-2xl object-cover"
                                    width="1024"
                                    height="768"
                                />
                            </picture>
                        </div>
                    </div>
                </div>

                {/* Scroll Down Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-400 animate-bounce cursor-pointer flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
                    <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Scroll</span>
                    <ArrowLoader size={24} className="rotate-180" />
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <Reveal direction="up">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <span className="text-green-600 font-bold uppercase tracking-widest text-xs mb-2 block">Powerful Tools</span>
                            <h2 className="text-4xl font-black mb-4 text-slate-900">Everything You Need to Succeed</h2>
                            <p className="text-slate-500 font-medium text-lg">
                                We combine advanced technology with local farming knowledge to help you make better decisions.
                            </p>
                        </div>
                    </Reveal>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <Reveal direction="up" delay={0}>
                            <div className="group bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-green-600/50 transition-all hover:-translate-y-2 duration-300 h-full">
                                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <TrendingUp size={28} />
                                </div>
                                <h3 className="text-2xl font-black mb-3">Market Prices</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    Get real-time prices for crops in markets across Ghana. Compare locations and sell at the best price.
                                </p>
                                <div className="mt-6 flex items-center gap-2 text-green-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                    Learn more <ArrowRight size={16} />
                                </div>
                            </div>
                        </Reveal>

                        {/* Feature 2 */}
                        <Reveal direction="up" delay={200}>
                            <div className="group bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-blue-600/50 transition-all hover:-translate-y-2 duration-300 delay-100 h-full">
                                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Cloud size={28} />
                                </div>
                                <h3 className="text-2xl font-black mb-3">Weather Intelligence</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    Localized weather forecasts for your specific farm. Plan your planting and harvesting with confidence.
                                </p>
                                <div className="mt-6 flex items-center gap-2 text-blue-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                    Check Forecast <ArrowRight size={16} />
                                </div>
                            </div>
                        </Reveal>

                        {/* Feature 3 */}
                        <Reveal direction="up" delay={400}>
                            <div className="group bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-purple-600/50 transition-all hover:-translate-y-2 duration-300 delay-200 h-full">
                                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Users size={28} />
                                </div>
                                <h3 className="text-2xl font-black mb-3">Supply Chain Network</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    Connect directly with trusted buyers, transporters, and other farmers. Build your business network.
                                </p>
                                <div className="mt-6 flex items-center gap-2 text-purple-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                    Join Network <ArrowRight size={16} />
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* Statistics / Social Proof */}
            <section className="py-24 px-6 bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <Reveal direction="up" delay={0}>
                            <div className="text-center p-6 hover:bg-slate-50 rounded-3xl transition-colors group">
                                <div className="text-5xl font-black text-green-600 mb-2 group-hover:scale-110 transition-transform">10K+</div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Farmers</p>
                            </div>
                        </Reveal>
                        <Reveal direction="up" delay={100}>
                            <div className="text-center p-6 hover:bg-slate-50 rounded-3xl transition-colors group">
                                <div className="text-5xl font-black text-slate-900 mb-2 group-hover:scale-110 transition-transform">50+</div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Markets Tracked</p>
                            </div>
                        </Reveal>
                        <Reveal direction="up" delay={200}>
                            <div className="text-center p-6 hover:bg-slate-50 rounded-3xl transition-colors group">
                                <div className="text-5xl font-black text-slate-900 mb-2 group-hover:scale-110 transition-transform">100+</div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Communities</p>
                            </div>
                        </Reveal>
                        <Reveal direction="up" delay={300}>
                            <div className="text-center p-6 hover:bg-slate-50 rounded-3xl transition-colors group">
                                <div className="text-5xl font-black text-green-600 mb-2 group-hover:scale-110 transition-transform">24/7</div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">AI Support</p>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-green-600"></div>
                <div className="absolute inset-0 bg-[url('/cta-image.jpeg')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10 text-white">
                    <Reveal direction="up">
                        <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                            Ready to Transform Your Farm?
                        </h2>
                    </Reveal>
                    <Reveal direction="up" delay={200}>
                        <p className="text-xl md:text-2xl text-green-100 font-medium mb-12 max-w-2xl mx-auto">
                            Join thousands of Ghanaian farmers already using AgriHub to maximize their profits.
                        </p>
                    </Reveal>
                    <Reveal direction="up" delay={400}>
                        <button
                            onClick={onGetStarted}
                            className="px-12 py-6 bg-white text-green-700 rounded-[2.5rem] font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                        >
                            {isLoggedIn ? 'Enter Dashboard Now' : 'Get Started Free Today'}
                        </button>
                    </Reveal>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                        <img
                            src="/logo.png"
                            alt="AgriHub"
                            className="w-8 h-8 object-contain"
                            loading="lazy"
                            decoding="async"
                            width="32"
                            height="32"
                        />
                        <span className="font-black text-slate-900">AgriHub Ghana</span>
                    </div>
                    <p className="text-slate-400 text-sm font-bold">
                        &copy; {new Date().getFullYear()} AgriHub. Empowering Farmers.
                    </p>
                </div>
            </footer>

            {/* Back to Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-8 right-8 w-14 h-14 bg-green-600 text-white rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-500 z-50 hover:bg-green-700 hover:scale-110 active:scale-95 group ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
                    }`}
                aria-label="Scroll to top"
            >
                <ArrowLoader size={24} className="group-hover:-translate-y-1 transition-transform" strokeWidth={3} />
            </button>
        </div>
    );
};

export default LandingPage;
