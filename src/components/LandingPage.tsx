import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles, Users, Zap, ArrowRight, Star } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // ページロード時のアニメーション開始
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div className="landing-container">
      {/* 背景グラデーション */}
      <div className="landing-background">
        <div className="gradient-overlay"></div>
        <div className="particles">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}></div>
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className={`landing-content ${isLoaded ? 'loaded' : ''}`}>
        {/* ヘッダー */}
        <header className="landing-header">
          <div className="logo-container">
            <div className="logo-icon">
              <Brain className="brain-icon" />
            </div>
            <h1 className="logo-text">MindFlow</h1>
            <div className="premium-badge">
              <Star className="star-icon" />
              <span>Premium</span>
            </div>
          </div>
        </header>

        {/* メインセクション */}
        <main className="landing-main">
          <div className="hero-section">
            <h2 className="hero-title">
              <span className="title-line">思考を</span>
              <span className="title-line gold-text">可視化</span>
              <span className="title-line">する</span>
            </h2>
            <p className="hero-subtitle">
              AIを活用した次世代マインドマップで、<br />
              あなたのアイデアを無限に広げましょう
            </p>

            {/* 特徴カード */}
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <Sparkles />
                </div>
                <h3>AI アシスタント</h3>
                <p>自動的にアイデアを生成し、思考を拡張</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <Users />
                </div>
                <h3>リアルタイム共同編集</h3>
                <p>チームでリアルタイムに協力</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <Zap />
                </div>
                <h3>高速パフォーマンス</h3>
                <p>瞬時に反応する滑らかな操作感</p>
              </div>
            </div>

            {/* CTA ボタン */}
            <div className="cta-section">
              <button 
                className="cta-button primary"
                onClick={handleLoginClick}
              >
                <span>ログイン</span>
                <ArrowRight className="arrow-icon" />
              </button>
              <button 
                className="cta-button secondary"
                onClick={handleRegisterClick}
              >
                <span>新規登録</span>
              </button>
            </div>
          </div>
        </main>

        {/* フッター */}
        <footer className="landing-footer">
          <p>&copy; 2025 MindFlow. All rights reserved.</p>
        </footer>
      </div>

      <style jsx>{`
        /* ベーススタイル */
        .landing-container {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* 背景 */
        .landing-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
          z-index: -2;
        }

        .gradient-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at center, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
          z-index: -1;
        }

        /* パーティクルアニメーション */
        .particles {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(212, 175, 55, 0.6);
          border-radius: 50%;
          animation: float linear infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }

        /* メインコンテンツ */
        .landing-content {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          opacity: 0;
          transform: translateY(30px);
          transition: all 1s ease-out;
        }

        .landing-content.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        /* ヘッダー */
        .landing-header {
          padding: 2rem;
          display: flex;
          justify-content: center;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #d4af37, #f4e4a6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(212, 175, 55, 0.3);
        }

        .brain-icon {
          width: 28px;
          height: 28px;
          color: #0a0a0a;
        }

        .logo-text {
          font-size: 2rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .premium-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #d4af37, #f4e4a6);
          color: #0a0a0a;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);
        }

        .star-icon {
          width: 16px;
          height: 16px;
        }

        /* メインセクション */
        .landing-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .hero-section {
          text-align: center;
          max-width: 800px;
        }

        .hero-title {
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 800;
          line-height: 1.1;
          margin: 0 0 2rem 0;
          color: #ffffff;
          letter-spacing: -0.03em;
        }

        .title-line {
          display: block;
          animation: slideInUp 1s ease-out forwards;
          opacity: 0;
          transform: translateY(50px);
        }

        .title-line:nth-child(1) { animation-delay: 0.2s; }
        .title-line:nth-child(2) { animation-delay: 0.4s; }
        .title-line:nth-child(3) { animation-delay: 0.6s; }

        .gold-text {
          background: linear-gradient(135deg, #d4af37, #f4e4a6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes slideInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #a0a0a0;
          margin: 0 0 4rem 0;
          line-height: 1.6;
          animation: fadeIn 1s ease-out 0.8s forwards;
          opacity: 0;
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        /* 特徴カード */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin: 0 0 4rem 0;
          animation: slideInUp 1s ease-out 1s forwards;
          opacity: 0;
          transform: translateY(30px);
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(212, 175, 55, 0.3);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .feature-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #d4af37, #f4e4a6);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem auto;
          color: #0a0a0a;
        }

        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 1rem 0;
        }

        .feature-card p {
          color: #a0a0a0;
          margin: 0;
          line-height: 1.5;
        }

        /* CTA ボタン */
        .cta-section {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
          animation: slideInUp 1s ease-out 1.2s forwards;
          opacity: 0;
          transform: translateY(30px);
        }

        .cta-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1.125rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          min-width: 160px;
          justify-content: center;
        }

        .cta-button.primary {
          background: linear-gradient(135deg, #d4af37, #f4e4a6);
          color: #0a0a0a;
          box-shadow: 0 8px 32px rgba(212, 175, 55, 0.3);
        }

        .cta-button.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 48px rgba(212, 175, 55, 0.4);
        }

        .cta-button.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .cta-button.secondary:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(212, 175, 55, 0.5);
          transform: translateY(-2px);
        }

        .arrow-icon {
          width: 20px;
          height: 20px;
          transition: transform 0.3s ease;
        }

        .cta-button:hover .arrow-icon {
          transform: translateX(4px);
        }

        /* フッター */
        .landing-footer {
          padding: 2rem;
          text-align: center;
          color: #666;
          font-size: 0.875rem;
        }

        /* レスポンシブデザイン */
        @media (max-width: 768px) {
          .landing-header {
            padding: 1rem;
          }

          .logo-container {
            gap: 0.75rem;
          }

          .logo-text {
            font-size: 1.5rem;
          }

          .premium-badge {
            padding: 0.375rem 0.75rem;
            font-size: 0.75rem;
          }

          .landing-main {
            padding: 1rem;
          }

          .hero-title {
            margin-bottom: 1.5rem;
          }

          .hero-subtitle {
            font-size: 1.125rem;
            margin-bottom: 3rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            margin-bottom: 3rem;
          }

          .feature-card {
            padding: 1.5rem;
          }

          .cta-section {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }

          .cta-button {
            width: 100%;
            max-width: 280px;
          }
        }

        @media (max-width: 480px) {
          .logo-container {
            flex-direction: column;
            gap: 0.5rem;
          }

          .premium-badge {
            order: -1;
          }
        }
      `}</style>
    </div>
  );
};