// src/App.js - 主應用程式
import React, { useState, useEffect } from 'react';
import { 
  Globe, Mic, MicOff, Volume2, Settings, 
  History as HistoryIcon, X, Loader2, Wifi, WifiOff, 
  MessageSquare, Presentation, Home, Clock,
  ChevronDown, ChevronUp, ArrowLeft, HelpCircle,
  Key, Palette, Type, Sun, Moon, ChevronRight
} from 'lucide-react';
import './App.css';

// 組件：歡迎畫面
const WelcomeScreen = ({ onStart, onLearnMore }) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-illustration">
          <svg viewBox="0 0 400 300" className="illustration">
            {/* 簡化的人物和對話泡泡插圖 */}
            <g>
              {/* 人物剪影 */}
              <ellipse cx="80" cy="250" rx="30" ry="40" fill="#4a5568" />
              <circle cx="80" cy="200" r="20" fill="#f7c6a3" />
              
              <ellipse cx="160" cy="250" rx="30" ry="40" fill="#ed8936" />
              <circle cx="160" cy="200" r="20" fill="#f7c6a3" />
              
              <ellipse cx="240" cy="250" rx="30" ry="40" fill="#2d3748" />
              <circle cx="240" cy="200" r="20" fill="#f7c6a3" />
              
              <ellipse cx="320" cy="250" rx="30" ry="40" fill="#68a894" />
              <circle cx="320" cy="200" r="20" fill="#f7c6a3" />
              
              {/* 對話泡泡 */}
              <rect x="50" y="140" width="60" height="30" rx="15" fill="#fdb99b" />
              <rect x="210" y="140" width="60" height="30" rx="15" fill="#68a894" />
              <rect x="130" y="120" width="60" height="30" rx="15" fill="#94a8a0" />
              <rect x="290" y="130" width="40" height="25" rx="12" fill="#fdb99b" />
              
              {/* 對話泡泡內的點 */}
              <circle cx="240" cy="155" r="3" fill="white" />
              <circle cx="250" cy="155" r="3" fill="white" />
            </g>
          </svg>
        </div>
        
        <h1 className="welcome-title">Speak Freely, Understand Instantly</h1>
        
        <p className="welcome-description">
          Translate conversations and lectures in real-time between Chinese and multiple languages.
        </p>
        
        <button className="start-button" onClick={onStart}>
          Start Translating
        </button>
        
        <button className="learn-more-button" onClick={onLearnMore}>
          Learn More
        </button>
      </div>
      
      <div className="welcome-nav">
        <button className="nav-icon-button active">
          <Home className="nav-icon" />
        </button>
        <button className="nav-icon-button">
          <MessageSquare className="nav-icon" />
        </button>
        <button className="nav-icon-button">
          <Mic className="nav-icon" />
        </button>
        <button className="nav-icon-button">
          <Settings className="nav-icon" />
        </button>
      </div>
    </div>
  );
};

// 組件：模式選擇畫面
const ModeSelection = ({ onSelectMode }) => {
  return (
    <div className="mode-selection">
      <div className="mode-header">
        <h1>選擇翻譯模式</h1>
        <p>根據您的需求選擇適合的翻譯模式</p>
      </div>
      
      <div className="mode-cards">
        <div className="mode-card" onClick={() => onSelectMode('conversation')}>
          <MessageSquare className="mode-icon" />
          <h2>對話模式</h2>
          <p>適合雙向對話場景，自動識別說話者語言並分組顯示</p>
        </div>
        
        <div className="mode-card" onClick={() => onSelectMode('lecture')}>
          <Presentation className="mode-icon" />
          <h2>講座模式</h2>
          <p>適合單向演講或教學，提供連續的翻譯文本顯示</p>
        </div>
      </div>
    </div>
  );
};

// 組件：對話模式
const ConversationMode = ({ 
  conversations, 
  isListening, 
  onStartListening, 
  onStopListening,
  onSpeak,
  targetLanguage,
  onLanguageChange 
}) => {
  const [expandedCards, setExpandedCards] = useState({});

  const toggleExpand = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="conversation-mode">
      <div className="conversation-list">
        {conversations.map((conv) => (
          <div key={conv.id} className="conversation-card">
            <div className="card-header">
              <img 
                src={`https://ui-avatars.com/api/?name=${conv.id}&background=random`} 
                alt="Speaker" 
                className="speaker-avatar"
              />
              <div className="card-content">
                <div className="original-text">
                  <p className={expandedCards[conv.id] ? '' : 'truncate'}>
                    {conv.originalText}
                  </p>
                  <span className="language-tag">
                    {conv.originalLang === 'zh-TW' || conv.originalLang === 'zh' ? 'Chinese' : 'English'}
                  </span>
                </div>
                
                <div className="translated-text">
                  <p className={expandedCards[conv.id] ? '' : 'truncate'}>
                    {conv.isTranslating ? (
                      <span className="translating">
                        <Loader2 className="spin-icon" /> 翻譯中...
                      </span>
                    ) : (
                      conv.translatedText || '等待翻譯...'
                    )}
                  </p>
                  <span className="language-tag">
                    {conv.targetLang === 'zh-TW' || conv.targetLang === 'zh' ? 'Chinese' : 'English'}
                  </span>
                </div>
              </div>
              
              <button 
                className="expand-button"
                onClick={() => toggleExpand(conv.id)}
              >
                {expandedCards[conv.id] ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bottom-controls">
        <button className="language-button active">English</button>
        <button className="language-button">Chinese</button>
        
        <button 
          className={`record-button ${isListening ? 'recording' : ''}`}
          onClick={isListening ? onStopListening : onStartListening}
        >
          <Mic className="mic-icon" />
        </button>
      </div>
    </div>
  );
};

// 組件：講座模式
const LectureMode = ({ 
  lectureText, 
  isListening, 
  onStartListening, 
  onStopListening,
  sourceLanguage,
  targetLanguage 
}) => {
  return (
    <div className="lecture-mode">
      <div className="lecture-header">
        <h2>Live Translation</h2>
        <p>The lecture will be translated from {sourceLanguage} to {targetLanguage}. You can change the language at any time.</p>
        
        <div className="language-selector">
          <span>{sourceLanguage} to {targetLanguage}</span>
          <ChevronRight className="arrow-icon" />
        </div>
      </div>
      
      <div className="lecture-content">
        <h3>Translation</h3>
        <div className="translation-text">
          {lectureText.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
      
      <div className="lecture-controls">
        <button 
          className={`start-button ${isListening ? 'recording' : ''}`}
          onClick={isListening ? onStopListening : onStartListening}
        >
          <Mic className="mic-icon" />
          {isListening ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>
    </div>
  );
};

// 組件：設定頁面
const SettingsScreen = ({ apiKeys, onUpdateApiKeys, onClose }) => {
  const [localApiKeys, setLocalApiKeys] = useState(apiKeys);
  const [theme, setTheme] = useState('light');
  const [textSize, setTextSize] = useState('medium');

  const handleSave = () => {
    onUpdateApiKeys(localApiKeys);
    // 儲存其他設定
    localStorage.setItem('theme', theme);
    localStorage.setItem('textSize', textSize);
    onClose();
  };

  return (
    <div className="settings-screen">
      <div className="settings-header">
        <button onClick={onClose} className="back-button">
          <ArrowLeft />
        </button>
        <h1>Settings</h1>
      </div>
      
      <div className="settings-content">
        <section className="settings-section">
          <h2>API Key</h2>
          <div className="setting-item" onClick={() => {}}>
            <Key className="setting-icon" />
            <div className="setting-info">
              <h3>Manage API Key</h3>
              <p>View, modify, or clear your API key.</p>
            </div>
            <ChevronRight className="chevron" />
          </div>
        </section>
        
        <section className="settings-section">
          <h2>Translation Service</h2>
          <div className="setting-item">
            <Globe className="setting-icon" />
            <div className="setting-info">
              <h3>Select Service</h3>
              <p>Choose your preferred translation service.</p>
            </div>
            <ChevronRight className="chevron" />
          </div>
        </section>
        
        <section className="settings-section">
          <h2>Display Preferences</h2>
          <div className="setting-item">
            <Type className="setting-icon" />
            <div className="setting-info">
              <h3>Text Size</h3>
              <p>Adjust text size for better readability.</p>
            </div>
            <ChevronRight className="chevron" />
          </div>
          
          <div className="setting-item">
            <Sun className="setting-icon" />
            <div className="setting-info">
              <h3>Theme</h3>
              <p>Switch between light and dark themes.</p>
            </div>
            <ChevronRight className="chevron" />
          </div>
        </section>
        
        <section className="settings-section">
          <h2>Help & Feedback</h2>
          <div className="setting-item">
            <HelpCircle className="setting-icon" />
            <div className="setting-info">
              <h3>Support & Feedback</h3>
              <p>Get support or provide suggestions.</p>
            </div>
            <ChevronRight className="chevron" />
          </div>
        </section>
      </div>
    </div>
  );
};

// 組件：幫助頁面
const HelpScreen = ({ onClose }) => {
  return (
    <div className="help-screen">
      <div className="help-header">
        <button onClick={onClose} className="back-button">
          <X />
        </button>
        <h1>Help & Feedback</h1>
      </div>
      
      <div className="help-content">
        <section className="help-section">
          <h2>Frequently Asked Questions</h2>
          
          <div className="faq-item">
            <h3>How do I change translation modes?</h3>
            <p>Learn how to switch between different translation modes.</p>
            <ChevronRight className="chevron" />
          </div>
          
          <div className="faq-item">
            <h3>How do I manage language settings?</h3>
            <p>Find out how to adjust settings for language preferences.</p>
            <ChevronRight className="chevron" />
          </div>
          
          <div className="faq-item">
            <h3>How do I use real-time translation?</h3>
            <p>Get tips on using the app effectively for real-time translation.</p>
            <ChevronRight className="chevron" />
          </div>
          
          <div className="faq-item">
            <h3>Troubleshooting common issues</h3>
            <p>Troubleshoot common issues and find solutions.</p>
            <ChevronRight className="chevron" />
          </div>
        </section>
        
        <section className="help-section">
          <h2>Contact & Feedback</h2>
          
          <div className="contact-item">
            <h3>Contact Support</h3>
            <ChevronRight className="chevron" />
          </div>
          
          <div className="contact-item">
            <h3>Submit Feedback</h3>
            <ChevronRight className="chevron" />
          </div>
        </section>
      </div>
    </div>
  );
};

// 主應用程式
const TranslationApp = () => {
  const [currentScreen, setCurrentScreen] = useState('modeSelection');
  const [translationMode, setTranslationMode] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [lectureText, setLectureText] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    google: '',
    openai: '',
    deepseek: ''
  });

  useEffect(() => {
    // 載入儲存的設定
    const savedKeys = localStorage.getItem('apiKeys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }
    
    // 模擬一些對話數據
    setConversations([
      {
        id: 1,
        originalText: "Hello, how are you?",
        originalLang: "en",
        translatedText: "你好，你好嗎？",
        targetLang: "zh-TW",
        isTranslating: false
      },
      {
        id: 2,
        originalText: "你好，你好嗎？",
        originalLang: "zh-TW",
        translatedText: "Hello, how are you?",
        targetLang: "en",
        isTranslating: false
      },
      {
        id: 3,
        originalText: "I'm fine, thank you.",
        originalLang: "en",
        translatedText: "我很好，謝謝。",
        targetLang: "zh-TW",
        isTranslating: false
      }
    ]);
    
    // 模擬講座文本
    setLectureText([
      "The speaker is discussing the latest advancements in AI and machine learning, focusing on applications in healthcare and education. The translation is displayed in real-time, providing a seamless experience for the audience.",
      "The speaker transitions to discussing the ethical implications of AI, emphasizing the need for responsible development and deployment. The translation continues to provide accurate and timely updates.",
      "The speaker concludes with a Q&A session, addressing questions about the future of AI and its potential impact on society. The translation ensures that all participants can understand and engage with the discussion."
    ]);
  }, []);

  const handleSelectMode = (mode) => {
    setTranslationMode(mode);
    setCurrentScreen(mode);
  };

  const handleStartListening = () => {
    setIsListening(true);
    // 實際的語音識別邏輯
  };

  const handleStopListening = () => {
    setIsListening(false);
    // 停止語音識別
  };

  const handleSpeak = (text, lang) => {
    // 語音合成邏輯
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'modeSelection':
        return <ModeSelection onSelectMode={handleSelectMode} />;
      
      case 'conversation':
        return (
          <>
            <div className="app-header">
              <button 
                className="back-button"
                onClick={() => setCurrentScreen('modeSelection')}
              >
                <ArrowLeft />
              </button>
              <h1>Conversation</h1>
            </div>
            <ConversationMode
              conversations={conversations}
              isListening={isListening}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              onSpeak={handleSpeak}
              targetLanguage="en"
              onLanguageChange={() => {}}
            />
          </>
        );
      
      case 'lecture':
        return (
          <>
            <div className="app-header">
              <button 
                className="back-button"
                onClick={() => setCurrentScreen('modeSelection')}
              >
                <ArrowLeft />
              </button>
              <h1>Live Translation</h1>
            </div>
            <LectureMode
              lectureText={lectureText}
              isListening={isListening}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              sourceLanguage="Chinese"
              targetLanguage="English"
            />
          </>
        );
      
      case 'settings':
        return (
          <SettingsScreen
            apiKeys={apiKeys}
            onUpdateApiKeys={setApiKeys}
            onClose={() => setCurrentScreen(translationMode || 'modeSelection')}
          />
        );
      
      case 'help':
        return (
          <HelpScreen
            onClose={() => setCurrentScreen('settings')}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {renderScreen()}
      
      {/* 底部導航欄 - 只在主要模式顯示 */}
      {(currentScreen === 'conversation' || currentScreen === 'lecture') && (
        <div className="bottom-nav">
          <button 
            className={`nav-item ${currentScreen === 'conversation' || currentScreen === 'lecture' ? 'active' : ''}`}
            onClick={() => {}}
          >
            <Globe className="nav-icon" />
            <span>Translate</span>
          </button>
          
          <button className="nav-item">
            <Clock className="nav-icon" />
            <span>History</span>
          </button>
          
          <button 
            className="nav-item"
            onClick={() => setCurrentScreen('settings')}
          >
            <Settings className="nav-icon" />
            <span>Settings</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TranslationApp;
