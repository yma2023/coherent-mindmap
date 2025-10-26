import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles, Users, Zap, ArrowRight, Star, Layers, Target, Lightbulb, Bot, Globe, Gauge, MessageSquare, Shield, Cpu, Cloud, Smartphone, Monitor } from 'lucide-react';
import { LanguageSwitcher } from './language/LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, isJapanese } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Refs for sections
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const aiSectionRef = useRef<HTMLElement>(null);
  const collaborationSectionRef = useRef<HTMLElement>(null);
  const performanceSectionRef = useRef<HTMLElement>(null);
  const detailsRef = useRef<HTMLElement>(null);
  const testimonialsRef = useRef<HTMLElement>(null);

  // スクロール監視とパララックス効果
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrollY(scrollPosition);

      // セクションの可視性チェック
      const sections = [
        { ref: heroRef, name: 'hero' },
        { ref: featuresRef, name: 'features' },
        { ref: aiSectionRef, name: 'ai' },
        { ref: collaborationSectionRef, name: 'collaboration' },
        { ref: performanceSectionRef, name: 'performance' },
        { ref: detailsRef, name: 'details' },
        { ref: testimonialsRef, name: 'testimonials' }
      ];

      const newVisibleSections = new Set<string>();
      sections.forEach(({ ref, name }) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2) {
            newVisibleSections.add(name);
          }
        }
      });
      setVisibleSections(newVisibleSections);

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

  // 機能説明用の画像データ
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
                SOZO MAP
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
        <section ref={heroRef} className="flex-1 flex items-center justify-center px-6 py-12 min-h-screen">
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
                onClick={() => navigate('/mindmap')}
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 hover:-translate-y-1"
              >
                <span>{t('landing.createMindMapButton')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 hover:text-slate-800 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 hover:-translate-y-1"
              >
                {t('landing.viewDashboardButton')}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 機能説明セクション - Dify風 */}
      <section ref={featuresRef} className="relative z-10 py-32 px-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* セクションタイトル */}
          <div className={`text-center mb-20 transition-all duration-1000 ${visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h3 className="text-4xl md:text-6xl font-bold text-slate-800 mb-8">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t('landing.powerfullFeatures')}
              </span>
            </h3>
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            {t('landing.powerfullFeaturesSubtitle')}
            </p>
          </div>

          {/* メイン機能表示エリア */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
            {/* 画像スライダー */}
            <div className={`relative transition-all duration-1000 ${visibleSections.has('features') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
              <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>
                ))}
              </div>
              
              {/* スライドインジケーター */}
              <div className="flex justify-center mt-8 space-x-3">
                {featureImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      currentSlide === index 
                        ? 'bg-blue-600 scale-125' 
                        : 'bg-slate-300'
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            {/* 機能説明 */}
            <div className={`space-y-8 transition-all duration-1000 ${visibleSections.has('features') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-8 rounded-3xl transition-all duration-500 ${
                    currentSlide === index
                      ? 'bg-white/90 backdrop-blur-sm shadow-xl border border-white/50 scale-105'
                      : 'bg-white/50 backdrop-blur-sm border border-white/30'
                  }`}
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="flex items-start space-x-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-slate-800 mb-4">
                        {feature.title}
                      </h4>
                      <p className="text-slate-600 leading-relaxed text-lg">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AIアシスタント詳細セクション */}
      <section ref={aiSectionRef} className="relative z-10 py-32 px-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto">
          <div className={`transition-all duration-1000 ${visibleSections.has('ai') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="text-center mb-20">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Bot className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-5xl md:text-6xl font-bold text-slate-800 mb-8">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t('landing.aiAssistant')}
                </span>
              </h3>
              <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              {t('landing.aiAssistantDescription')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-4">{t('landing.autoIdeaGeneration')}</h4>
                <p className="text-slate-600 leading-relaxed">
                  {t('landing.autoIdeaGenerationDescription')}
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-4">{t('landing.intelligentSummary')}</h4>
                <p className="text-slate-600 leading-relaxed">
                  {t('landing.intelligentSummaryDescription')}
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-4">{t('landing.contextUnderstanding')}</h4>
                <p className="text-slate-600 leading-relaxed">
                  {t('landing.contextUnderstandingDescription')}
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl shadow-xl">
                <Sparkles className="w-6 h-6" />
                <span className="text-lg font-semibold">{t('landing.aiAssistant')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* リアルタイム共同編集セクション */}
      <section ref={collaborationSectionRef} className="relative z-10 py-32 px-6 min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="max-w-7xl mx-auto">
          <div className={`transition-all duration-1000 ${visibleSections.has('collaboration') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="text-center mb-20">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Users className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-5xl md:text-6xl font-bold text-slate-800 mb-8">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {t('landing.realTimeCollaboration')}
                </span>
              </h3>
              <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                {t('landing.realTimeCollaborationDescription')}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
              <div>
                <div className="space-y-8">
                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Globe className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-slate-800 mb-4">{t('landing.globalSync')}</h4>
                      <p className="text-slate-600 leading-relaxed text-lg">
                        {t('landing.globalSyncDescription')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-slate-800 mb-4">{t('landing.permissionManagement')}</h4>
                      <p className="text-slate-600 leading-relaxed text-lg">
                        {t('landing.permissionManagementDescription')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-slate-800 mb-4">{t('landing.realTimeComments')}</h4>
                      <p className="text-slate-600 leading-relaxed text-lg">
                        {t('landing.realTimeCommentsDescription')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">A</span>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">B</span>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">C</span>
                      </div>
                    </div>
                    <span className="text-slate-600 font-medium">{isJapanese ? '3人が編集中' : '3 people editing'}</span>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <p className="text-sm text-blue-800 font-medium">
                        {isJapanese ? 'Alice がノード「マーケティング戦略」を追加しました' : 'Alice added node "Marketing Strategy"'}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">{isJapanese ? '2分前' : '2 minutes ago'}</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                      <p className="text-sm text-purple-800 font-medium">
                        {isJapanese ? 'Bob がコメントを追加: 「この部分をもう少し詳しく...」' : 'Bob added comment: "Let\'s elaborate on this part..."'}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">{isJapanese ? '5分前' : '5 minutes ago'}</p>
                    </div>
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                      <p className="text-sm text-emerald-800 font-medium">
                        {isJapanese ? 'Carol が接続を作成しました' : 'Carol created a connection'}
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">{isJapanese ? '8分前' : '8 minutes ago'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 高速パフォーマンスセクション */}
      <section ref={performanceSectionRef} className="relative z-10 py-32 px-6 min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="max-w-7xl mx-auto">
          <div className={`transition-all duration-1000 ${visibleSections.has('performance') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="text-center mb-20">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Gauge className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-5xl md:text-6xl font-bold text-slate-800 mb-8">
                <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  {t('landing.highPerformance')}
                </span>
              </h3>
              <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                {t('landing.highPerformanceDescription')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-20">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-slate-800 mb-2">{"< 50ms"}</div>
                <div className="text-lg text-slate-600 font-medium mb-4">{t('landing.responseTime')}</div>
                <p className="text-slate-600 leading-relaxed">
                  {t('landing.responseTimeDescription')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Layers className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-slate-800 mb-2">10,000+</div>
                <div className="text-lg text-slate-600 font-medium mb-4">{t('landing.nodeSupport')}</div>
                <p className="text-slate-600 leading-relaxed">
                  {t('landing.nodeSupportDescription')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Cloud className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-slate-800 mb-2">99.9%</div>
                <div className="text-lg text-slate-600 font-medium mb-4">{t('landing.uptime')}</div>
                <p className="text-slate-600 leading-relaxed">
                  {t('landing.uptimeDescription')}
                </p>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/50">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h4 className="text-3xl font-bold text-slate-800 mb-6">{t('landing.optimizedArchitecture')}</h4>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Cpu className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h5 className="text-lg font-semibold text-slate-800 mb-2">{t('landing.edgeComputing')}</h5>
                        <p className="text-slate-600">{t('landing.edgeComputingDescription')}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Layers className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h5 className="text-lg font-semibold text-slate-800 mb-2">{t('landing.incrementalSync')}</h5>
                        <p className="text-slate-600">{t('landing.incrementalSyncDescription')}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h5 className="text-lg font-semibold text-slate-800 mb-2">{t('landing.webAssemblyOptimization')}</h5>
                        <p className="text-slate-600">{t('landing.webAssemblyOptimizationDescription')}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-2xl">
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-slate-400 text-sm ml-4">{isJapanese ? 'パフォーマンスモニター' : 'Performance Monitor'}</span>
                    </div>
                    <div className="space-y-4 font-mono text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-400">{isJapanese ? 'CPU使用率:' : 'CPU Usage:'}</span>
                        <span>12%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-400">{isJapanese ? 'メモリ:' : 'Memory:'}</span>
                        <span>245MB / 2GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-400">{isJapanese ? '応答時間:' : 'Response Time:'}</span>
                        <span className="text-green-400">23ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-400">{isJapanese ? 'アクティブノード:' : 'Active Nodes:'}</span>
                        <span>1,247</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-pink-400">{isJapanese ? '同期状態:' : 'Sync Status:'}</span>
                        <span className="text-green-400">{isJapanese ? '✓ リアルタイム' : '✓ Real-time'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 詳細機能セクション */}
      <section ref={detailsRef} className="relative z-10 py-32 px-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className={`transition-all duration-1000 ${visibleSections.has('details') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="text-center mb-20">
              <h3 className="text-4xl md:text-5xl font-bold text-slate-800 mb-8">
                <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {t('landing.perfectExperienceAllDevices')}
                </span>
              </h3>
              <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                {t('landing.perfectExperienceAllDevicesDescription')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Monitor className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('landing.desktop')}</h3>
                <p className="text-slate-600 leading-relaxed">{t('landing.desktopDescription')}</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('landing.mobile')}</h3>
                <p className="text-slate-600 leading-relaxed">{t('landing.mobileDescription')}</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Cloud className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('landing.cloudSync')}</h3>
                <p className="text-slate-600 leading-relaxed">{t('landing.cloudSyncDescription')}</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('landing.offlineSupport')}</h3>
                <p className="text-slate-600 leading-relaxed">{t('landing.offlineSupportDescription')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* お客様の声セクション */}
      <section ref={testimonialsRef} className="relative z-10 py-32 px-6 min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className={`transition-all duration-1000 ${visibleSections.has('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="text-center mb-20">
              <h3 className="text-4xl md:text-5xl font-bold text-slate-800 mb-8">
                {t('landing.lovedByUsersWorldwide')}
              </h3>
              <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                {t('landing.lovedByUsersWorldwideDescription')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-20">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed mb-6 text-lg">
                  {t('landing.testimonial1')}
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">田</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{t('landing.testimonial1Author')}</div>
                    <div className="text-slate-600 text-sm">{t('landing.testimonial1Role')}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed mb-6 text-lg">
                  {t('landing.testimonial2')}
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">S</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{t('landing.testimonial2Author')}</div>
                    <div className="text-slate-600 text-sm">{t('landing.testimonial2Role')}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed mb-6 text-lg">
                  {t('landing.testimonial3')}
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">李</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{t('landing.testimonial3Author')}</div>
                    <div className="text-slate-600 text-sm">{t('landing.testimonial3Role')}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center space-x-8 bg-white/90 backdrop-blur-sm px-12 py-8 rounded-3xl shadow-xl border border-white/50">
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-800 mb-2">1M+</div>
                  <div className="text-slate-600">{t('landing.activeUsers')}</div>
                </div>
                <div className="w-px h-16 bg-slate-300"></div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-800 mb-2">50M+</div>
                  <div className="text-slate-600">{t('landing.createdMindMaps')}</div>
                </div>
                <div className="w-px h-16 bg-slate-300"></div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-800 mb-2">99.9%</div>
                  <div className="text-slate-600">{t('landing.customerSatisfaction')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="relative z-10 px-6 py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-3xl font-bold">SOZO MAP</h3>
            </div>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              {t('landing.visualizeThoughts')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => navigate('/mindmap')}
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 hover:-translate-y-1"
              >
                <span>{t('landing.createMindMapButton')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-700 hover:-translate-y-1"
              >
                {t('landing.viewDashboardButton')}
              </button>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 text-sm mb-4 md:mb-0">{t('landing.footer')}</p>
              <div className="flex space-x-8 text-sm text-slate-400">
                <a href="#" className="hover:text-white transition-colors">{t('landing.privacyPolicy')}</a>
                <a href="#" className="hover:text-white transition-colors">{t('landing.termsOfService')}</a>
                <a href="#" className="hover:text-white transition-colors">{t('landing.contact')}</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};