import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 言語タイプの定義
export type Language = 'en' | 'ja';

// 翻訳データの型定義
export interface Translations {
  // 共通
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    loading: string;
    error: string;
    success: string;
    confirm: string;
    back: string;
    next: string;
    close: string;
    open: string;
    search: string;
    filter: string;
    sort: string;
    settings: string;
    profile: string;
    logout: string;
    login: string;
    register: string;
    email: string;
    password: string;
    name: string;
    fullName: string;
    dashboard: string;
    home: string;
  };

  // ランディングページ
  landing: {
    title: string;
    subtitle: string;
    createMindMapButton: string,  // ✅ string型
    viewDashboardButton: string,  // ✅ string型
    powerfullFeatures: string,    // ✅ string型
    powerfullFeaturesSubtitle: string,
    aiAssistant: string,
    aiAssistantDescription: string,
    autoIdeaGeneration: string,
    autoIdeaGenerationDescription: string,
    intelligentSummary: string,
    intelligentSummaryDescription: string,
    contextUnderstanding: string,
    contextUnderstandingDescription: string,
    realTimeCollaboration: string,
    realTimeCollaborationDescription: string,
    globalSync: string,
    globalSyncDescription: string,
    permissionManagement: string,
    permissionManagementDescription: string,
    realTimeComments: string,
    realTimeCommentsDescription: string,
    highPerformance: string,
    highPerformanceDescription: string,
    responseTime: string,
    responseTimeDescription: string,
    nodeSupport: string,
    nodeSupportDescription: string,
    uptime: string,
    uptimeDescription: string,
    optimizedArchitecture: string,
    edgeComputing: string,
    edgeComputingDescription: string,
    incrementalSync: string,
    incrementalSyncDescription: string,
    webAssemblyOptimization: string,
    webAssemblyOptimizationDescription: string,
    perfectExperienceAllDevices: string,
    perfectExperienceAllDevicesDescription: string,
    desktop: string,
    desktopDescription: string,
    mobile: string,
    mobileDescription: string,
    cloudSync: string,
    cloudSyncDescription: string,
    offlineSupport: string,
    offlineSupportDescription: string,
    lovedByUsersWorldwide: string,
    lovedByUsersWorldwideDescription: string,
    testimonial1: string,
    testimonial1Author: string,
    testimonial1Role: string,
    testimonial2: string,
    testimonial2Author: string,
    testimonial2Role: string,
    testimonial3: string,
    testimonial3Author: string,
    testimonial3Role: string,
    activeUsers: string,
    createdMindMaps: string,
    customerSatisfaction: string,
    visualizeThoughts: string,
    privacyPolicy: string,
    termsOfService: string,
    contact: string,
    features: {
      ai: {
        title: string;
        description: string;
      };
      collaboration: {
        title: string;
        description: string;
      };
      performance: {
        title: string;
        description: string;
      };
    };
    footer: string;
  };

  // 認証関連
  auth: {
    welcomeBack: string;
    signInToAccount: string;
    createAccount: string;
    joinMindFlow: string;
    emailAddress: string;
    enterEmail: string;
    enterPassword: string;
    confirmPassword: string;
    forgotPassword: string;
    signIn: string;
    signUp: string;
    signingIn: string;
    creatingAccount: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
    checkEmail: string;
    resetPassword: string;
    updatePassword: string;
    passwordUpdated: string;
    backToSignIn: string;
    sendResetLink: string;
    sendingResetLink: string;
    newPassword: string;
    confirmNewPassword: string;
    updatingPassword: string;
    enterFullName: string;
    createPassword: string;
    confirmYourPassword: string;
    passwordRequirements: string;
    passwordsDoNotMatch: string;
    emailRequired: string;
    passwordRequired: string;
    fullNameRequired: string;
    invalidEmail: string;
    passwordTooShort: string;
    fullNameTooShort: string;
  };

  // ダッシュボード
  dashboard: {
    welcomeBack: string;
    welcomeThere: string;
    readyToCreate: string;
    createNewMindMap: string;
    advancedMindMap: string;
    startWithBlank: string;
    fullFeatured: string;
    collaborators: string;
    peopleWorking: string;
    totalMaps: string;
    mapsCreated: string;
    recentMindMaps: string;
    viewAll: string;
    nodes: string;
    updated: string;
    noMapsYet: string;
    createFirstMap: string;
  };

  // マインドマップ
  mindMap: {
    untitledMindMap: string;
    newNode: string;
    untitledNode: string;
    addNode: string;
    deleteNode: string;
    editNode: string;
    aiAssistant: string;
    typeAiCommand: string;
    escToCancel: string;
    unsaved: string;
    saved: string;
    saving: string;
    export: string;
    share: string;
    comments: string;
    tasks: string;
    selectNode: string;
    noComments: string;
    addComment: string;
    controls: {
      clickToSelect: string;
      doubleClickToEdit: string;
      hoverForButtons: string;
      dragToMove: string;
      scrollToZoom: string;
      dragCanvas: string;
    };
  };

  // プロフィール
  profile: {
    userProfile: string;
    manageAccount: string;
    accountCreated: string;
    lastUpdated: string;
    userId: string;
    signOut: string;
    changePassword: string;
    deleteAccount: string;
    profileUpdated: string;
    loadingProfile: string;
    verified: string;
    unverified: string;
  };

  // エラーメッセージ
  errors: {
    somethingWentWrong: string;
    tryAgain: string;
    networkError: string;
    unauthorized: string;
    notFound: string;
    serverError: string;
    validationError: string;
    unsavedChanges: string;
    confirmLeave: string;
  };
}

// 翻訳データ
const translations: Record<Language, Translations> = {
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      close: 'Close',
      open: 'Open',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout',
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      name: 'Name',
      fullName: 'Full Name',
      dashboard: 'Dashboard',
      home: 'Home',
    },
    landing: {
      title: 'Visualize Your Thoughts',
      subtitle: 'Expand your ideas infinitely with AI-powered next-generation mind maps',
      createMindMapButton: 'Create Mind Map',
      viewDashboardButton: 'View Dashboard',
      powerfullFeatures: 'Powerful Features',
      powerfullFeaturesSubtitle: 'Experience the next generation of mind mapping with AI-powered tools and seamless collaboration',
      aiAssistant: 'AI Assistant',
      aiAssistantDescription: 'Revolutionary AI technology expands your thinking and infinitely broadens creativity',
      autoIdeaGeneration: 'Auto Idea Generation',
      autoIdeaGenerationDescription: 'Simply enter keywords and AI automatically generates related ideas and concepts. Broadens thinking and provides new perspectives.',
      intelligentSummary: 'Intelligent Summary',
      intelligentSummaryDescription: 'Instantly organizes complex information and extracts key points. Converts lengthy documents into easy-to-understand mind maps in seconds.',
      contextUnderstanding: 'Context Understanding',
      contextUnderstandingDescription: 'Understands project context and suggests optimal structure and layout. Learns your thinking patterns and provides personalized assistance.',
      realTimeCollaboration: 'Real-time Collaboration',
      realTimeCollaborationDescription: 'Harness the creativity of your entire team and collaborate in real-time to bring ideas to life',
      globalSync: 'Global Sync',
      globalSyncDescription: 'Edit the same mind map instantly from anywhere in the world. Changes are immediately reflected to all members, always sharing the latest state.',
      permissionManagement: 'Permission Management',
      permissionManagementDescription: 'Fine-grained permission settings enable access control such as view-only, editable, administrator according to roles. Provides a secure collaborative work environment.',
      realTimeComments: 'Real-time Comments',
      realTimeCommentsDescription: 'Add comments directly to each node and discuss with team members. Share the background and intent of ideas to promote deeper understanding.',
      highPerformance: 'High Performance',
      highPerformanceDescription: 'Achieve high-speed performance that responds instantly even with large-scale mind maps using cutting-edge technology',
      responseTime: 'Response Time',
      responseTimeDescription: 'Any operation responds within 50 milliseconds. Provides a stress-free editing experience.',
      nodeSupport: 'Node Support',
      nodeSupportDescription: 'Works comfortably even with large projects. Processes mind maps with tens of thousands of nodes smoothly.',
      uptime: 'Uptime',
      uptimeDescription: 'Achieves high availability through cloud infrastructure. You can use it with confidence anytime, anywhere.',
      optimizedArchitecture: 'Optimized Architecture',
      edgeComputing: 'Edge Computing',
      edgeComputingDescription: 'Execute processing on servers closest to users to minimize latency.',
      incrementalSync: 'Incremental Sync',
      incrementalSyncDescription: 'Synchronize only changed parts to reduce unnecessary data transfer.',
      webAssemblyOptimization: 'WebAssembly Optimization',
      webAssemblyOptimizationDescription: 'Implement heavy processing with WebAssembly to achieve native-level performance.',
      perfectExperienceAllDevices: 'Perfect experience on all devices',
      perfectExperienceAllDevicesDescription: 'Provides an optimized experience on all devices from desktop to mobile',
      desktop: 'Desktop',
      desktopDescription: 'Comfortable editing experience on large screens. Efficient work possible with keyboard shortcuts',
      mobile: 'Mobile',
      mobileDescription: 'UI optimized for touch operation. Catch ideas without missing them even when out and about',
      cloudSync: 'Cloud Sync',
      cloudSyncDescription: 'Automatic synchronization between all devices. Access the latest state from anywhere',
      offlineSupport: 'Offline Support',
      offlineSupportDescription: 'Continue working even without internet connection. Automatic synchronization when connection is restored',
      lovedByUsersWorldwide: 'Loved by users worldwide',
      lovedByUsersWorldwideDescription: 'Over 1 million users are unleashing their creativity with MindFlow',
      testimonial1: '"MindFlow\'s AI features are truly innovative. Idea generation time has been halved, allowing me to focus more on creative work."',
      testimonial1Author: 'Misaki Tanaka',
      testimonial1Role: 'Product Manager',
      testimonial2: '"Being able to edit in real-time with the entire team is wonderful. Even in remote work, we can collaborate as if we were in the same room."',
      testimonial2Author: 'Sarah Johnson',
      testimonial2Role: 'Design Director',
      testimonial3: '"The operation is smooth even with large-scale projects, and I don\'t feel any stress. I\'m amazed at the performance."',
      testimonial3Author: 'Zhiming Li',
      testimonial3Role: 'Engineering Manager',
      activeUsers: 'Active Users',
      createdMindMaps: 'Created Mind Maps',
      customerSatisfaction: 'Customer Satisfaction',
      visualizeThoughts: 'Visualize your thoughts and infinitely expand your creativity with next-generation mind mapping tools',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      contact: 'Contact',
      features: {
        ai: {
          title: 'AI Assistant',
          description: 'Automatically generate ideas and expand thinking',
        },
        collaboration: {
          title: 'Real-time Collaboration',
          description: 'Collaborate with your team in real-time',
        },
        performance: {
          title: 'High Performance',
          description: 'Smooth operation with instant response',
        },
      },
      footer: '© 2025 MindFlow. All rights reserved.',
    },
    auth: {
      welcomeBack: 'Welcome back',
      signInToAccount: 'Sign in to your MindFlow account',
      createAccount: 'Create your account',
      joinMindFlow: 'Join MindFlow and start creating amazing mind maps',
      emailAddress: 'Email address',
      enterEmail: 'Enter your email',
      enterPassword: 'Enter your password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot your password?',
      signIn: 'Sign in',
      signUp: 'Create account',
      signingIn: 'Signing in...',
      creatingAccount: 'Creating account...',
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: 'Already have an account?',
      checkEmail: 'Check your email',
      resetPassword: 'Reset your password',
      updatePassword: 'Update password',
      passwordUpdated: 'Password updated!',
      backToSignIn: 'Back to Sign In',
      sendResetLink: 'Send reset link',
      sendingResetLink: 'Sending reset link...',
      newPassword: 'New Password',
      confirmNewPassword: 'Confirm New Password',
      updatingPassword: 'Updating password...',
      enterFullName: 'Enter your full name',
      createPassword: 'Create a password',
      confirmYourPassword: 'Confirm your password',
      passwordRequirements: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      passwordsDoNotMatch: 'Passwords do not match',
      emailRequired: 'Email is required',
      passwordRequired: 'Password is required',
      fullNameRequired: 'Full name is required',
      invalidEmail: 'Please enter a valid email address',
      passwordTooShort: 'Password must be at least 8 characters',
      fullNameTooShort: 'Full name must be at least 2 characters',
    },
    dashboard: {
      welcomeBack: 'Welcome back,',
      welcomeThere: 'there!',
      readyToCreate: 'Ready to create amazing mind maps? Start by creating a new map or continue working on existing ones.',
      createNewMindMap: 'Create New Mind Map',
      advancedMindMap: 'Advanced Mind Map',
      startWithBlank: 'Start with a blank canvas and let your ideas flow',
      fullFeatured: 'Full-featured mind mapping with drag & drop',
      collaborators: 'Collaborators',
      peopleWorking: 'People working with you on mind maps',
      totalMaps: 'Total Maps',
      mapsCreated: "Mind maps you've created or collaborated on",
      recentMindMaps: 'Recent Mind Maps',
      viewAll: 'View all',
      nodes: 'nodes',
      updated: 'updated',
      noMapsYet: 'No mind maps yet',
      createFirstMap: 'Create your first mind map to get started with organizing your ideas.',
    },
    mindMap: {
      untitledMindMap: 'Untitled Mind Map',
      newNode: 'New Node',
      untitledNode: 'Untitled Node',
      addNode: 'Add Node',
      deleteNode: 'Delete Node',
      editNode: 'Edit Node',
      aiAssistant: 'AI Assistant',
      typeAiCommand: 'Type your AI command and press Enter',
      escToCancel: 'ESC to cancel',
      unsaved: 'Unsaved',
      saved: 'Saved',
      saving: 'Saving...',
      export: 'Export',
      share: 'Share',
      comments: 'Comments',
      tasks: 'Tasks',
      selectNode: 'Select a node to view comments',
      noComments: 'No comments yet',
      addComment: 'Add Comment',
      controls: {
        clickToSelect: '• Click node to select',
        doubleClickToEdit: '• Double-click to edit text',
        hoverForButtons: '• Hover for + buttons to add nodes',
        dragToMove: '• Drag nodes to move them',
        scrollToZoom: '• Scroll to zoom in/out',
        dragCanvas: '• Drag canvas to pan',
      },
    },
    profile: {
      userProfile: 'User Profile',
      manageAccount: 'Manage your account information',
      accountCreated: 'Account Created',
      lastUpdated: 'Last Updated',
      userId: 'User ID',
      signOut: 'Sign Out',
      changePassword: 'Change Password',
      deleteAccount: 'Delete Account',
      profileUpdated: 'Profile updated successfully!',
      loadingProfile: 'Loading profile...',
      verified: 'Verified',
      unverified: 'Unverified',
    },
    errors: {
      somethingWentWrong: 'Something went wrong',
      tryAgain: 'Please try again',
      networkError: 'Network error occurred',
      unauthorized: 'Unauthorized access',
      notFound: 'Page not found',
      serverError: 'Server error occurred',
      validationError: 'Validation error',
      unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
      confirmLeave: 'Your changes will be lost.',
    },
  },
  ja: {
    common: {
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      edit: '編集',
      create: '作成',
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
      confirm: '確認',
      back: '戻る',
      next: '次へ',
      close: '閉じる',
      open: '開く',
      search: '検索',
      filter: 'フィルター',
      sort: '並び替え',
      settings: '設定',
      profile: 'プロフィール',
      logout: 'ログアウト',
      login: 'ログイン',
      register: '新規登録',
      email: 'メールアドレス',
      password: 'パスワード',
      name: '名前',
      fullName: '氏名',
      dashboard: 'ダッシュボード',
      home: 'ホーム',
    },
    landing: {
      title: '思考を可視化する',
      subtitle: 'AIを活用した次世代マインドマップで、あなたのアイデアを無限に広げましょう',
      createMindMapButton: 'マインドマップを作成',
      viewDashboardButton: 'ダッシュボードを表示',
      powerfullFeatures: '強力な機能',
      powerfullFeaturesSubtitle: 'AIを活用したツールとシームレスな共同作業で、次世代のマインドマッピングを体験してください',
      aiAssistant: 'AIアシスタント',
      aiAssistantDescription: '革新的なAI技術があなたの思考を拡張し、創造性を無限に広げます',
      autoIdeaGeneration: '自動アイデア生成',
      autoIdeaGenerationDescription: 'キーワードを入力するだけで、AIが関連するアイデアやコンセプトを自動生成。思考の幅を広げ、新しい視点を提供します。',
      intelligentSummary: 'インテリジェント要約',
      intelligentSummaryDescription: '複雑な情報を瞬時に整理し、重要なポイントを抽出。長文の資料も数秒で理解しやすいマインドマップに変換します。',
      contextUnderstanding: 'コンテキスト理解',
      contextUnderstandingDescription: 'プロジェクトの文脈を理解し、最適な構造とレイアウトを提案。あなたの思考パターンを学習し、パーソナライズされた支援を提供します。',
      realTimeCollaboration: 'リアルタイム共同編集',
      realTimeCollaborationDescription: 'チーム全体の創造性を結集し、リアルタイムで協力してアイデアを形にします',
      globalSync: 'グローバル同期',
      globalSyncDescription: '世界中のどこからでも、瞬時に同じマインドマップを編集。変更は即座に全メンバーに反映され、常に最新の状態を共有できます。',
      permissionManagement: '権限管理',
      permissionManagementDescription: '細かな権限設定により、閲覧のみ、編集可能、管理者など、役割に応じたアクセス制御を実現。セキュアな共同作業環境を提供します。',
      realTimeComments: 'リアルタイムコメント',
      realTimeCommentsDescription: '各ノードに直接コメントを追加し、チームメンバーとディスカッション。アイデアの背景や意図を共有し、より深い理解を促進します。',
      highPerformance: '高速パフォーマンス',
      highPerformanceDescription: '最先端の技術により、大規模なマインドマップでも瞬時に反応する高速パフォーマンスを実現',
      responseTime: '応答時間',
      responseTimeDescription: 'どんな操作も50ミリ秒以内で反応。ストレスフリーな編集体験を提供します。',
      nodeSupport: 'ノード対応',
      nodeSupportDescription: '大規模なプロジェクトでも快適に動作。数万のノードを持つマインドマップも軽快に処理します。',
      uptime: '稼働率',
      uptimeDescription: 'クラウドインフラにより高い可用性を実現。いつでもどこでも安心してご利用いただけます。',
      optimizedArchitecture: '最適化されたアーキテクチャ',
      edgeComputing: 'エッジコンピューティング',
      edgeComputingDescription: 'ユーザーに最も近いサーバーで処理を実行し、レイテンシを最小限に抑制。',
      incrementalSync: 'インクリメンタル同期',
      incrementalSyncDescription: '変更された部分のみを同期し、無駄なデータ転送を削減。',
      webAssemblyOptimization: 'WebAssembly最適化',
      webAssemblyOptimizationDescription: '重い処理をWebAssemblyで実装し、ネイティブレベルの性能を実現。',
      perfectExperienceAllDevices: 'すべてのデバイスで、完璧な体験を',
      perfectExperienceAllDevicesDescription: 'デスクトップからモバイルまで、あらゆるデバイスで最適化された体験を提供',
      desktop: 'デスクトップ',
      desktopDescription: '大画面での快適な編集体験。キーボードショートカットで効率的な作業が可能',
      mobile: 'モバイル',
      mobileDescription: 'タッチ操作に最適化されたUI。外出先でもアイデアを逃さずキャッチ',
      cloudSync: 'クラウド同期',
      cloudSyncDescription: 'すべてのデバイス間で自動同期。どこからでも最新の状態にアクセス可能',
      offlineSupport: 'オフライン対応',
      offlineSupportDescription: 'インターネット接続がなくても作業継続。接続復旧時に自動同期',
      lovedByUsersWorldwide: '世界中のユーザーから愛用されています',
      lovedByUsersWorldwideDescription: '100万人以上のユーザーがMindFlowで創造性を発揮しています',
      testimonial1: '"MindFlowのAI機能は本当に革新的です。アイデア出しの時間が半分になり、より創造的な作業に集中できるようになりました。"',
      testimonial1Author: '田中 美咲',
      testimonial1Role: 'プロダクトマネージャー',
      testimonial2: '"チーム全体でリアルタイムに編集できるのが素晴らしい。リモートワークでも、まるで同じ部屋にいるような感覚で協力できます。"',
      testimonial2Author: 'Sarah Johnson',
      testimonial2Role: 'デザインディレクター',
      testimonial3: '"大規模なプロジェクトでも動作が軽快で、ストレスを感じません。パフォーマンスの良さに驚いています。"',
      testimonial3Author: '李 志明',
      testimonial3Role: 'エンジニアリングマネージャー',
      activeUsers: 'アクティブユーザー',
      createdMindMaps: '作成されたマインドマップ',
      customerSatisfaction: '顧客満足度',
      visualizeThoughts: '思考を可視化し、創造性を無限に広げる次世代マインドマッピングツール',
      privacyPolicy: 'プライバシーポリシー',
      termsOfService: '利用規約',
      contact: 'お問い合わせ',
      features: {
        ai: {
          title: 'AI アシスタント',
          description: '自動的にアイデアを生成し、思考を拡張',
        },
        collaboration: {
          title: 'リアルタイム共同編集',
          description: 'チームでリアルタイムに協力',
        },
        performance: {
          title: '高速パフォーマンス',
          description: '瞬時に反応する滑らかな操作感',
        },
      },
      footer: '© 2025 MindFlow. All rights reserved.',
    },
    auth: {
      welcomeBack: 'おかえりなさい',
      signInToAccount: 'MindFlowアカウントにサインイン',
      createAccount: 'アカウントを作成',
      joinMindFlow: 'MindFlowに参加して、素晴らしいマインドマップを作成しましょう',
      emailAddress: 'メールアドレス',
      enterEmail: 'メールアドレスを入力',
      enterPassword: 'パスワードを入力',
      confirmPassword: 'パスワード確認',
      forgotPassword: 'パスワードをお忘れですか？',
      signIn: 'サインイン',
      signUp: 'アカウント作成',
      signingIn: 'サインイン中...',
      creatingAccount: 'アカウント作成中...',
      dontHaveAccount: 'アカウントをお持ちでない方',
      alreadyHaveAccount: 'すでにアカウントをお持ちの方',
      checkEmail: 'メールを確認してください',
      resetPassword: 'パスワードをリセット',
      updatePassword: 'パスワードを更新',
      passwordUpdated: 'パスワードが更新されました！',
      backToSignIn: 'サインインに戻る',
      sendResetLink: 'リセットリンクを送信',
      sendingResetLink: 'リセットリンク送信中...',
      newPassword: '新しいパスワード',
      confirmNewPassword: '新しいパスワード確認',
      updatingPassword: 'パスワード更新中...',
      enterFullName: '氏名を入力',
      createPassword: 'パスワードを作成',
      confirmYourPassword: 'パスワードを確認',
      passwordRequirements: 'パスワードは大文字、小文字、数字を含む必要があります',
      passwordsDoNotMatch: 'パスワードが一致しません',
      emailRequired: 'メールアドレスは必須です',
      passwordRequired: 'パスワードは必須です',
      fullNameRequired: '氏名は必須です',
      invalidEmail: '有効なメールアドレスを入力してください',
      passwordTooShort: 'パスワードは8文字以上である必要があります',
      fullNameTooShort: '氏名は2文字以上である必要があります',
    },
    dashboard: {
      welcomeBack: 'おかえりなさい',
      welcomeThere: '',
      readyToCreate: '素晴らしいマインドマップを作成する準備はできましたか？新しいマップを作成するか、既存のものを続けて作業しましょう。',
      createNewMindMap: '新しいマインドマップを作成',
      advancedMindMap: '既存のマインドマップを開く',
      startWithBlank: '白紙のキャンバスから始めて、アイデアを自由に表現',
      fullFeatured: 'ドラッグ&ドロップ対応の本格的なマインドマッピング。',
      collaborators: '共同作業者',
      peopleWorking: 'マインドマップで一緒に作業している人',
      totalMaps: '総マップ数',
      mapsCreated: '作成または共同作業したマインドマップ',
      recentMindMaps: '最近のマインドマップ',
      viewAll: 'すべて表示',
      nodes: 'ノード',
      updated: '更新',
      noMapsYet: 'まだマインドマップがありません',
      createFirstMap: '最初のマインドマップを作成して、アイデアの整理を始めましょう。',
    },
    mindMap: {
      untitledMindMap: '無題のマインドマップ',
      newNode: '新しいノード',
      untitledNode: '無題のノード',
      addNode: 'ノードを追加',
      deleteNode: 'ノードを削除',
      editNode: 'ノードを編集',
      aiAssistant: 'AIアシスタント',
      typeAiCommand: 'AIコマンドを入力してEnterキーを押してください',
      escToCancel: 'ESCでキャンセル',
      unsaved: '未保存',
      saved: '保存済み',
      saving: '保存中...',
      export: 'エクスポート',
      share: '共有',
      comments: 'コメント',
      tasks: 'タスク',
      selectNode: 'ノードを選択してコメントを表示',
      noComments: 'まだコメントがありません',
      addComment: 'コメントを追加',
      controls: {
        clickToSelect: '• ノードをクリックして選択',
        doubleClickToEdit: '• ダブルクリックでテキストを編集',
        hoverForButtons: '• ホバーで+ボタンを表示してノードを追加',
        dragToMove: '• ノードをドラッグして移動',
        scrollToZoom: '• スクロールでズームイン/アウト',
        dragCanvas: '• キャンバスをドラッグしてパン',
      },
    },
    profile: {
      userProfile: 'ユーザープロフィール',
      manageAccount: 'アカウント情報を管理',
      accountCreated: 'アカウント作成日',
      lastUpdated: '最終更新日',
      userId: 'ユーザーID',
      signOut: 'サインアウト',
      changePassword: 'パスワード変更',
      deleteAccount: 'アカウント削除',
      profileUpdated: 'プロフィールが正常に更新されました！',
      loadingProfile: 'プロフィール読み込み中...',
      verified: '認証済み',
      unverified: '未認証',
    },
    errors: {
      somethingWentWrong: '何かが間違っています',
      tryAgain: 'もう一度お試しください',
      networkError: 'ネットワークエラーが発生しました',
      unauthorized: '認証されていないアクセス',
      notFound: 'ページが見つかりません',
      serverError: 'サーバーエラーが発生しました',
      validationError: '検証エラー',
      unsavedChanges: '未保存の変更があります。本当に離れますか？',
      confirmLeave: '変更内容が失われます。',
    },
  },
};

// 言語ストアの型定義
interface LanguageStore {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// Zustandストアの作成（永続化対応）
export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      currentLanguage: 'ja', // デフォルトは日本語

      setLanguage: (language: Language) => {
        set({ currentLanguage: language });
      },

      // 翻訳関数
      t: (key: string) => {
        const { currentLanguage } = get();
        const keys = key.split('.');
        let value: any = translations[currentLanguage];

        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            // キーが見つからない場合は英語版を試す
            let fallbackValue: any = translations.en;
            for (const fallbackKey of keys) {
              if (fallbackValue && typeof fallbackValue === 'object' && fallbackKey in fallbackValue) {
                fallbackValue = fallbackValue[fallbackKey];
              } else {
                return key; // フォールバックも失敗した場合はキーをそのまま返す
              }
            }
            return fallbackValue;
          }
        }

        return typeof value === 'string' ? value : key;
      },
    }),
    {
      name: 'mindflow-language', // ローカルストレージのキー
      partialize: (state) => ({ currentLanguage: state.currentLanguage }),
    }
  )
);

// カスタムフック
export const useTranslation = () => {
  const { currentLanguage, setLanguage, t } = useLanguageStore();
  
  return {
    currentLanguage,
    setLanguage,
    t,
    isJapanese: currentLanguage === 'ja',
    isEnglish: currentLanguage === 'en',
  };
};