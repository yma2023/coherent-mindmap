import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn, Brain, Users, Zap, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from '../../hooks/useTranslation';
import { LanguageSwitcher } from '../LanguageSwitcher';

export const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
  const [activeSection, setActiveSection] = useState(0);

  const { login, loading, error, clearError } = useAuthStore();

  // スクロールアニメーション用のRef
  const sectionsRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  // 機能説明データ
  const features = [
    {
      id: 'ai-assistant',
      title: 'AIアシスタント',
      subtitle: '思考を拡張する知的パートナー',
      description: 'GPT-4を活用した高度なAIアシスタントが、あなたのアイデア創出をサポート。自然言語でのコマンド入力により、瞬時にマインドマップを生成・拡張できます。',
      icon: Brain,
      gradient: 'from-purple-600 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
    },
    {
      id: 'collaboration',
      title: 'リアルタイム共同編集',
      subtitle: 'チームの創造性を最大化',
      description: 'WebSocketを使用したリアルタイム同期により、複数のユーザーが同時にマインドマップを編集可能。変更は瞬時に全参加者に反映され、シームレスな協働体験を実現します。',
      icon: Users,
      gradient: 'from-blue-600 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
    },
    {
      id: 'performance',
      title: '高速パフォーマンス',
      subtitle: '瞬時に反応する滑らかな操作感',
      description: '最新のReact 18とWebGL技術により、数千のノードでも滑らかな操作を実現。遅延のないレスポンシブな体験で、思考の流れを妨げません。',
      icon: Zap,
      gradient: 'from-emerald-600 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
    },
  ];

  // Intersection Observer の設定
  React.useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionsRef.current.findIndex(ref => ref === entry.target);
            if (index !== -1) {
              setActiveSection(index);
            }
          }
        });
      },
      {
        threshold: 0.6,
        rootMargin: '-20% 0px -20% 0px',
      }
    );

    sectionsRef.current.forEach((ref) => {
      if (ref) observerRef.current?.observe(ref);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // スムーズスクロール機能
  const scrollToSection = (index: number) => {
    const targetRef = sectionsRef.current[index];
    if (targetRef) {
      const offsetTop = targetRef.offsetTop - 100;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  };

  // パララックス効果
  React.useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-element');
      
      parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = t('auth.emailRequired');
    } else if (!emailRegex.test(email)) {
      errors.email = t('auth.invalidEmail');
    }

    // Password validation
    if (!password) {
      errors.password = t('auth.passwordRequired');
    } else if (password.length < 6) {
      errors.password = t('auth.passwordTooShort');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    const result = await login({ email, password });
    
    if (!result.success) {
      // Error is handled by the store
      console.error('Login failed:', result.error);
    }
  };

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      setEmail(value);
      if (validationErrors.email) {
        setValidationErrors(prev => ({ ...prev, email: undefined }));
      }
    } else {
      setPassword(value);
      if (validationErrors.password) {
        setValidationErrors(prev => ({ ...prev, password: undefined }));
      }
    }
    clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* 言語切り替え */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher variant="compact" />
      </div>
      
      {/* メインログインセクション */}
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* 背景装飾 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="parallax-element absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="parallax-element absolute bottom-20 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <LogIn className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-slate-800">{t('auth.welcomeBack')}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {t('auth.signInToAccount')}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                  {t('auth.emailAddress')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      validationErrors.email ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white/50 backdrop-blur-sm'
                    }`}
                    placeholder={t('auth.enterEmail')}
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
                  {t('common.password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      validationErrors.password ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white/50 backdrop-blur-sm'
                    }`}
                    placeholder={t('auth.enterPassword')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('auth.signingIn')}
                </div>
              ) : (
                t('auth.signIn')
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-slate-600">
                {t('auth.dontHaveAccount')}{' '}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                >
                  {t('auth.signUp')}
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* スクロール促進アイコン */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-slate-400" />
        </div>
      </div>

      {/* 固定ナビゲーション */}
      <div className="fixed top-1/2 right-8 transform -translate-y-1/2 z-50 hidden lg:block">
        <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg border border-white/50">
          {features.map((feature, index) => (
            <button
              key={feature.id}
              onClick={() => scrollToSection(index)}
              className={`block w-3 h-3 rounded-full mb-3 last:mb-0 transition-all duration-300 ${
                activeSection === index
                  ? 'bg-blue-600 scale-125'
                  : 'bg-slate-300 hover:bg-slate-400'
              }`}
              title={feature.title}
            />
          ))}
        </div>
      </div>

      {/* 機能説明セクション */}
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div
            key={feature.id}
            ref={(el) => (sectionsRef.current[index] = el)}
            className={`min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br ${feature.bgGradient} relative overflow-hidden`}
          >
            {/* 背景装飾 */}
            <div className="absolute inset-0">
              <div className={`parallax-element absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r ${feature.gradient} opacity-10 rounded-full blur-3xl`}></div>
              <div className={`parallax-element absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l ${feature.gradient} opacity-5 rounded-full blur-3xl`}></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
              <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                {/* テキストコンテンツ */}
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="space-y-4">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${feature.gradient} text-white text-sm font-semibold`}>
                      <Icon className="w-4 h-4 mr-2" />
                      {feature.title}
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 leading-tight">
                      {feature.subtitle}
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* 機能詳細リスト */}
                  <div className="space-y-3">
                    {index === 0 && (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-slate-700">自然言語でのコマンド入力</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-slate-700">GPT-4による高度な推論</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-slate-700">コンテキスト理解による提案</span>
                        </div>
                      </>
                    )}
                    {index === 1 && (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-slate-700">WebSocketによるリアルタイム同期</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-slate-700">競合解決アルゴリズム</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-slate-700">ユーザー別カーソル表示</span>
                        </div>
                      </>
                    )}
                    {index === 2 && (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-slate-700">React 18 Concurrent Features</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-slate-700">WebGL加速レンダリング</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-slate-700">仮想化による大規模データ処理</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 視覚的コンテンツ */}
                <div className={`relative ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <div className="relative">
                    {/* メインビジュアル */}
                    <div className={`w-full h-96 bg-gradient-to-br ${feature.gradient} rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden`}>
                      {/* アニメーション要素 */}
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                      <Icon className="w-24 h-24 text-white relative z-10" />
                      
                      {/* 浮遊する装飾要素 */}
                      <div className="absolute top-4 right-4 w-16 h-16 bg-white/20 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/30 rounded-full animate-bounce"></div>
                      <div className="absolute top-1/2 left-8 w-8 h-8 bg-white/25 rounded-full animate-ping"></div>
                    </div>
                    
                    {/* 装飾的な要素 */}
                    <div className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br ${feature.gradient} rounded-full opacity-20 animate-pulse`}></div>
                    <div className={`absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tl ${feature.gradient} rounded-full opacity-10 animate-bounce`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* フッターセクション */}
      <div className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">今すぐ始めましょう</h3>
          <p className="text-slate-300 mb-8">
            MindFlowで、あなたの思考を可視化し、チームとの協働を次のレベルへ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              無料で始める
            </Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center justify-center px-8 py-3 bg-transparent border-2 border-white/20 hover:border-white/40 text-white font-semibold rounded-lg transition-all duration-200"
            >
              ログインに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};