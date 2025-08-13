import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles, Users, Zap, ArrowRight, Star, Layers, Target, Lightbulb, Bot, Globe, Gauge, MessageSquare, Shield, Cpu, Cloud, Smartphone, Monitor } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  
  // Refs for sections
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const aiSectionRef = useRef<HTMLDivElement>(null);
  const collaborationSectionRef = useRef<HTMLDivElement>(null);
  const performanceSectionRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

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

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

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
      <section ref={featuresRef} className="relative z-10 py-32 px-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* セクションタイトル */}
          <div className={`text-center mb-20 transition-all duration-1000 ${visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h3 className="text-4xl md:text-6xl font-bold text-slate-800 mb-8">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h3>
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Experience the next generation of mind mapping with AI-powered tools and seamless collaboration
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
                  AI Assistant
                </span>
              </h3>
              <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                革新的なAI技術があなたの思考を拡張し、創造性を無限に広げます
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-4">自動アイデア生成</h4>
                <p className="text-slate-600 leading-relaxed">
                  キーワードを入力するだけで、AIが関連するアイデアやコンセプトを自動生成。思考の幅を広げ、新しい視点を提供します。
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-4">インテリジェント要約</h4>
                <p className="text-slate-600 leading-relaxed">
                  複雑な情報を瞬時に整理し、重要なポイントを抽出。長文の資料も数秒で理解しやすいマインドマップに変換します。
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-4">コンテキスト理解</h4>
                <p className="text-slate-600 leading-relaxed">
                  プロジェクトの文脈を理解し、最適な構造とレイアウトを提案。あなたの思考パターンを学習し、パーソナライズされた支援を提供します。
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl shadow-xl">
                <Sparkles className="w-6 h-6" />
                <span className="text-lg font-semibold">AIの力で思考を加速させましょう</span>
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
                  Real-time Collaboration
                </span>
              </h3>
              <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                チーム全体の創造性を結集し、リアルタイムで協力してアイデアを形にします
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
                      <h4 className="text-2xl font-bold text-slate-800 mb-4">グローバル同期</h4>
                      <p className="text-slate-600 leading-relaxed text-lg">
                        世界中のどこからでも、瞬時に同じマインドマップを編集。変更は即座に全メンバーに反映され、常に最新の状態を共有できます。
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-slate-800 mb-4">権限管理</h4>
                      <p className="text-slate-600 leading-relaxed text-lg">
                        細かな権限設定により、閲覧のみ、編集可能、管理者など、役割に応じたアクセス制御を実現。セキュアな共同作業環境を提供します。
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-slate-800 mb-4">リアルタイムコメント</h4>
                      <p className="text-slate-600 leading-relaxed text-lg">
                        各ノードに直接コメントを追加し、チームメンバーとディスカッション。アイデアの背景や意図を共有し、より深い理解を促進します。
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
                    <span className="text-slate-600 font-medium">3人が編集中</span>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <p className="text-sm text-blue-800 font-medium">Alice がノード「マーケティング戦略」を追加しました</p>
                      <p className="text-xs text-blue-600 mt-1">2分前</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                      <p className="text-sm text-purple-800 font-medium">Bob がコメントを追加: 「この部分をもう少し詳しく...」</p>
                      <p className="text-xs text-purple-600 mt-1">5分前</p>
                    </div>
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                      <p className="text-sm text-emerald-800 font-medium">Carol が接続を作成しました</p>
                      <p className="text-xs text-emerald-600 mt-1">8分前</p>
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
                  High Performance
                </span>
              </h3>
              <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                最先端の技術により、大規模なマインドマップでも瞬時に反応する高速パフォーマンスを実現
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-20">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-slate-800 mb-2">{"< 50ms"}</div>
                <div className="text-lg text-slate-600 font-medium mb-4">応答時間</div>
                <p className="text-slate-600 leading-relaxed">
                  どんな操作も50ミリ秒以内で反応。ストレスフリーな編集体験を提供します。
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Layers className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-slate-800 mb-2">10,000+</div>
                <div className="text-lg text-slate-600 font-medium mb-4">ノード対応</div>
                <p className="text-slate-600 leading-relaxed">
                  大規模なプロジェクトでも快適に動作。数万のノードを持つマインドマップも軽快に処理します。
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Cloud className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-slate-800 mb-2">99.9%</div>
                <div className="text-lg text-slate-600 font-medium mb-4">稼働率</div>
                <p className="text-slate-600 leading-relaxed">
                  クラウドインフラにより高い可用性を実現。いつでもどこでも安心してご利用いただけます。
                </p>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/50">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h4 className="text-3xl font-bold text-slate-800 mb-6">最適化されたアーキテクチャ</h4>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Cpu className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h5 className="text-lg font-semibold text-slate-800 mb-2">エッジコンピューティング</h5>
                        <p className="text-slate-600">ユーザーに最も近いサーバーで処理を実行し、レイテンシを最小限に抑制。</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Layers className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h5 className="text-lg font-semibold text-slate-800 mb-2">インクリメンタル同期</h5>
                        <p className="text-slate-600">変更された部分のみを同期し、無駄なデータ転送を削減。</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h5 className="text-lg font-semibold text-slate-800 mb-2">WebAssembly最適化</h5>
                        <p className="text-slate-600">重い処理をWebAssemblyで実装し、ネイティブレベルの性能を実現。</p>
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
                      <span className="text-slate-400 text-sm ml-4">Performance Monitor</span>
                    </div>
                    <div className="space-y-4 font-mono text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-400">CPU Usage:</span>
                        <span>12%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-400">Memory:</span>
                        <span>245MB / 2GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-400">Response Time:</span>
                        <span className="text-green-400">23ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-400">Active Nodes:</span>
                        <span>1,247</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-pink-400">Sync Status:</span>
                        <span className="text-green-400">✓ Real-time</span>
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
                  すべてのデバイスで、完璧な体験を
                </span>
              </h3>
              <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                デスクトップからモバイルまで、あらゆるデバイスで最適化された体験を提供
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Monitor className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">デスクトップ</h3>
                <p className="text-slate-600 leading-relaxed">大画面での快適な編集体験。キーボードショートカットで効率的な作業が可能</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">モバイル</h3>
                <p className="text-slate-600 leading-relaxed">タッチ操作に最適化されたUI。外出先でもアイデアを逃さずキャッチ</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Cloud className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">クラウド同期</h3>
                <p className="text-slate-600 leading-relaxed">すべてのデバイス間で自動同期。どこからでも最新の状態にアクセス可能</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">オフライン対応</h3>
                <p className="text-slate-600 leading-relaxed">インターネット接続がなくても作業継続。接続復旧時に自動同期</p>
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
                世界中のユーザーから愛用されています
              </h3>
              <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                100万人以上のユーザーがMindFlowで創造性を発揮しています
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
                  "MindFlowのAI機能は本当に革新的です。アイデア出しの時間が半分になり、より創造的な作業に集中できるようになりました。"
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">田</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">田中 美咲</div>
                    <div className="text-slate-600 text-sm">プロダクトマネージャー</div>
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
                  "チーム全体でリアルタイムに編集できるのが素晴らしい。リモートワークでも、まるで同じ部屋にいるような感覚で協力できます。"
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">S</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Sarah Johnson</div>
                    <div className="text-slate-600 text-sm">デザインディレクター</div>
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
                  "大規模なプロジェクトでも動作が軽快で、ストレスを感じません。パフォーマンスの良さに驚いています。"
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">李</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">李 志明</div>
                    <div className="text-slate-600 text-sm">エンジニアリングマネージャー</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center space-x-8 bg-white/90 backdrop-blur-sm px-12 py-8 rounded-3xl shadow-xl border border-white/50">
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-800 mb-2">1M+</div>
                  <div className="text-slate-600">アクティブユーザー</div>
                </div>
                <div className="w-px h-16 bg-slate-300"></div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-800 mb-2">50M+</div>
                  <div className="text-slate-600">作成されたマインドマップ</div>
                </div>
                <div className="w-px h-16 bg-slate-300"></div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-800 mb-2">99.9%</div>
                  <div className="text-slate-600">顧客満足度</div>
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
              <h3 className="text-3xl font-bold">MindFlow</h3>
            </div>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              思考を可視化し、創造性を無限に広げる次世代マインドマッピングツール
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={handleLoginClick}
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 hover:-translate-y-1"
              >
                <span>今すぐ始める</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleRegisterClick}
                className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-700 hover:-translate-y-1"
              >
                無料で試す
              </button>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 text-sm mb-4 md:mb-0">{t('landing.footer')}</p>
              <div className="flex space-x-8 text-sm text-slate-400">
                <a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a>
                <a href="#" className="hover:text-white transition-colors">利用規約</a>
                <a href="#" className="hover:text-white transition-colors">お問い合わせ</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};