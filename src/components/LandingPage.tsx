import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles, Users, Zap, ArrowRight, Star, Layers, Target, Lightbulb, Bot, Globe, Gauge } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const featuresRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // スクロール監視とパララックス効果
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrollY(scrollPosition);

      // 機能セクションでの画像切り替え
      if (featuresRef.current) {
        const featuresTop = featuresRef.current.offsetTop;
        const featuresHeight = featuresRef.current.offsetHeight;
        const relativeScroll = scrollPosition - featuresTop + window.innerHeight / 2;
        
        if (relativeScroll > 0 && relativeScroll < featuresHeight) {
          const progress = relativeScroll / featuresHeight;
          const slideIndex = Math.floor(progress * 3);
          setCurrentSlide(Math.max(0, Math.min(2, slideIndex)));
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ページロード時のアニメーション開始
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  // 機能説明用の画像データ（実際の実装では適切な画像URLを使用）
  const featureImages = [
    {
      id: 0,
      title: 'AI Assistant',
      image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      alt: 'AI Assistant Interface'
    },
    {
      id: 1,
      title: 'Real-time Collaboration',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      alt: 'Team Collaboration'
    },
    {
      id: 2,
      title: 'High Performance',
      image: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpg?auto=compress&cs=tinysrgb&w=800',
      alt: 'Performance Dashboard'
    }
  ];

  const features = [
    {
      icon: Bot,
      title: t('landing.features.ai.title'),
      description: t('landing.features.ai.description'),
      gradient: 'from-blue-500 to-blue-600',
      delay: '0s'
    },
    {
      icon: Users,
      title: t('landing.features.collaboration.title'),
      description: t('landing.features.collaboration.description'),
      gradient: 'from-purple-500 to-purple-600',
      delay: '0.2s'
    },
    {
      icon: Gauge,
      title: t('landing.features.performance.title'),
      description: t('landing.features.performance.description'),
      gradient: 'from-indigo-500 to-indigo-600',
      delay: '0.4s'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div 
          className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl transition-transform duration-1000"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>
        <div 
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl transition-transform duration-1000"
          style={{ transform: `translateY(${-scrollY * 0.15}px)` }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-3xl transition-transform duration-1000"
          style={{ transform: `translate(-50%, -50%) translateY(${scrollY * 0.05}px)` }}
        ></div>
      </div>

      {/* メインコンテンツ */}
      <div className={`relative z-10 min-h-screen flex flex-col transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* ヘッダー */}
        <header className="px-6 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div 
              className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300"
              style={{ transform: `scale(${1 - scrollY * 0.0001})` }}
            >
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 
                className="text-2xl font-bold text-slate-800 transition-all duration-300"
                style={{ fontSize: `${2 - scrollY * 0.001}rem` }}
              >
                MindFlow
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center space-x-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  <Star className="w-3 h-3" />
                  <span>Pro</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSwitcher variant="header" />
          </div>
        </header>

        {/* ヒーローセクション */}
        <section ref={heroRef} className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-6xl mx-auto text-center">
            <h2 
              className="text-5xl md:text-7xl font-bold text-slate-800 mb-6 leading-tight transition-all duration-300"
              style={{ 
                transform: `translateY(${scrollY * 0.1}px)`,
                opacity: Math.max(0.3, 1 - scrollY * 0.002)
              }}
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {t('landing.title')}
              </span>
            </h2>
            <p 
              className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed transition-all duration-300"
              style={{ 
                transform: `translateY(${scrollY * 0.15}px)`,
                opacity: Math.max(0.2, 1 - scrollY * 0.003)
              }}
            >
              {t('landing.subtitle')}
            </p>

            {/* CTAボタン */}
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-300"
              style={{ 
                transform: `translateY(${scrollY * 0.2}px)`,
                opacity: Math.max(0.1, 1 - scrollY * 0.004)
              }}
            >
              <button
                onClick={handleLoginClick}
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 hover:-translate-y-1"
              >
                <span>{t('landing.loginButton')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleRegisterClick}
                className="bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 hover:text-slate-800 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 hover:-translate-y-1"
              >
                {t('landing.registerButton')}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 機能説明セクション - Dify風 */}
      <section ref={featuresRef} className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* セクションタイトル */}
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h3>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Experience the next generation of mind mapping with AI-powered tools and seamless collaboration
            </p>
          </div>

          {/* メイン機能表示エリア */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            {/* 画像スライダー */}
            <div className="relative">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl">
                {featureImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                      currentSlide === index 
                        ? 'opacity-100 scale-100' 
                        : 'opacity-0 scale-105'
                    }`}
                  >
                    <img
                      src={image.image}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                ))}
              </div>
              
              {/* スライドインジケーター */}
              <div className="flex justify-center mt-6 space-x-2">
                {featureImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentSlide === index 
                        ? 'bg-blue-600 scale-125' 
                        : 'bg-slate-300'
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            {/* 機能説明 */}
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-2xl transition-all duration-500 ${
                    currentSlide === index
                      ? 'bg-white/80 backdrop-blur-sm shadow-lg border border-white/50 scale-105'
                      : 'bg-white/40 backdrop-blur-sm border border-white/30'
                  }`}
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-md`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-slate-800 mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-slate-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 追加の特徴カード */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">Smart Templates</h3>
              <p className="text-slate-600 leading-relaxed text-center">Pre-built templates for various use cases to get you started quickly</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">Cloud Sync</h3>
              <p className="text-slate-600 leading-relaxed text-center">Access your mind maps from anywhere with automatic cloud synchronization</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">Export Options</h3>
              <p className="text-slate-600 leading-relaxed text-center">Export your mind maps in various formats including PDF, PNG, and SVG</p>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="relative z-10 px-6 py-12 bg-white/50 backdrop-blur-sm border-t border-white/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">MindFlow</h3>
            </div>
            <p className="text-slate-500 text-sm mb-6">{t('landing.footer')}</p>
            <div className="flex justify-center space-x-8 text-sm text-slate-600">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};