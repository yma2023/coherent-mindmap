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
    loginButton: string;
    registerButton: string;
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
      loginButton: 'Sign in',
      registerButton: 'Sign up',
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
      welcomeBack: 'Welcome back',
      welcomeThere: 'there',
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
      loginButton: 'ログイン',
      registerButton: '新規登録',
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
      fullFeatured: 'ローカルディレクトリからファイルを選択しよう。',
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