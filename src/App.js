// src/App.js - 完整版本，遵循設計規範
import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, Mic, MicOff, Volume2, Settings, 
  Clock, X, Loader2, Search, ChevronRight,
  Eye, EyeOff, Check, ChevronDown, Home, MessageSquare
} from 'lucide-react';
import './App.css';

// 組件：歡迎頁面
const WelcomeScreen = ({ onStart }) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-illustration">
          <svg viewBox="0 0 400 300" className="illustration">
            <g>
              {/* 人物剪影 */}
              <ellipse cx="120" cy="200" rx="40" ry="60" fill="#4A5568" />
              <circle cx="120" cy="140" r="25" fill="#FDB99B" />
              
              <ellipse cx="280" cy="200" rx="40" ry="60" fill="#ED8936" />
              <circle cx="280" cy="140" r="25" fill="#FDB99B" />
              
              {/* 對話泡泡 */}
              <path d="M 150 120 Q 150 100 170 100 L 210 100 Q 230 100 230 120 L 230 130 Q 230 140 220 140 L 180 140 L 170 150 L 170 140 L 160 140 Q 150 140 150 130 Z" fill="#3182CE" opacity="0.8" />
              <circle cx="180" cy="120" r="3" fill="white" />
              <circle cx="190" cy="120" r="3" fill="white" />
              <circle cx="200" cy="120" r="3" fill="white" />
              
              <path d="M 230 110 Q 230 90 250 90 L 290 90 Q 310 90 310 110 L 310 120 Q 310 130 300 130 L 260 130 L 250 140 L 250 130 L 240 130 Q 230 130 230 120 Z" fill="#68A894" opacity="0.8" />
              <text x="270" y="115" font-size="20" fill="white" text-anchor="middle">你好</text>
            </g>
          </svg>
        </div>
        
        <h1 className="welcome-title">Speak Freely, Understand Instantly</h1>
        
        <p className="welcome-description">
          Translate conversations in real-time between Chinese and multiple languages.
        </p>
        
        <button className="start-button" onClick={onStart}>
          Start Translating
        </button>
        
        <button className="learn-more-button" onClick={() => alert('Real-time translation app supporting multiple languages with conversation and lecture modes.')}>
          Learn More
        </button>
      </div>
      
      <div className="bottom-nav">
        <button className="nav-item active">
          <Globe className="nav-icon" />
          <span>Translate</span>
        </button>
        <button className="nav-item">
          <Clock className="nav-icon" />
          <span>History</span>
        </button>
        <button className="nav-item">
          <Settings className="nav-icon" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

// 組件：翻譯頁面
const TranslateScreen = ({ apiKeys, translationProvider }) => {
  const [activeTab, setActiveTab] = useState('two-way');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isRecording, setIsRecording] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [oneWayText, setOneWayText] = useState('');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [translationDirection, setTranslationDirection] = useState('en-zh');
  
  const recognitionRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ru', name: 'Russian' },
    { code: 'it', name: 'Italian' }
  ];

  const startRecording = async () => {
    if (!apiKeys.google || !apiKeys[translationProvider]) {
      alert('Please configure API keys in Settings');
      return;
    }

    // 使用瀏覽器內建語音識別 (示意)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = activeTab === 'two-way' ? 'zh-TW' : selectedLanguage;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      setCurrentTranscript(transcript);
      
      if (event.results[event.results.length - 1].isFinal) {
        if (activeTab === 'two-way') {
          // 雙向模式：添加到對話
          const newConv = {
            id: Date.now(),
            originalText: transcript,
            originalLang: /[\u4e00-\u9fa5]/.test(transcript) ? 'Chinese' : languages.find(l => l.code === selectedLanguage)?.name,
            translatedText: 'Translation in progress...',
            targetLang: /[\u4e00-\u9fa5]/.test(transcript) ? languages.find(l => l.code === selectedLanguage)?.name : 'Chinese'
          };
          setConversations([newConv, ...conversations]);
        } else {
          // 單向模式：更新翻譯文本
          setOneWayText(transcript + '\n\nTranslation: [Translation would appear here]');
        }
        setCurrentTranscript('');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setCurrentTranscript('');
  };

  return (
    <div className="translate-screen">
      <div className="app-header">
        <h1>Translate</h1>
      </div>
      
      <div className="tab-switcher">
        <button 
          className={`tab ${activeTab === 'two-way' ? 'active' : ''}`}
          onClick={() => setActiveTab('two-way')}
        >
          Two-way Translation
        </button>
        <button 
          className={`tab ${activeTab === 'one-way' ? 'active' : ''}`}
          onClick={() => setActiveTab('one-way')}
        >
          One-way Translation
        </button>
      </div>
      
      <div className="translate-content">
        {activeTab === 'two-way' ? (
          <div className="two-way-mode">
            {conversations.length === 0 ? (
              <div className="empty-state">
                <p>Tap the microphone to start</p>
              </div>
            ) : (
              <div className="conversation-list">
                {conversations.map((conv) => (
                  <div key={conv.id} className="conversation-card">
                    <div className="language-tag">{conv.originalLang}</div>
                    <p className="original-text">{conv.originalText}</p>
                    <p className="translated-text">{conv.translatedText}</p>
                    <div className="language-tag">{conv.targetLang}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="one-way-mode">
            <div className="language-direction">
              {languages.find(l => l.code === selectedLanguage)?.name} to Chinese
              <ChevronRight className="direction-icon" />
            </div>
            
            <div className="translation-area">
              <h3>Translation</h3>
              <div className="translation-content">
                {oneWayText || (
                  <p className="placeholder">Translation will appear here</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {isRecording && currentTranscript && (
          <div className="current-transcript">
            <Loader2 className="spin-icon" />
            <span>{currentTranscript}</span>
          </div>
        )}
      </div>
      
      <div className="bottom-controls">
        <div className="language-selector">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`language-button ${selectedLanguage === lang.code ? 'active' : ''}`}
              onClick={() => setSelectedLanguage(lang.code)}
              disabled={isRecording}
            >
              {lang.name}
            </button>
          ))}
        </div>
        
        <button 
          className={`record-button ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          <Mic className="mic-icon" />
        </button>
      </div>
    </div>
  );
};

// 組件：歷史記錄頁面
const HistoryScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState([
    {
      id: 1,
      date: 'Today',
      time: '10:45 AM',
      mode: 'two-way',
      originalLang: 'English',
      originalText: 'Hello, how are you?',
      translatedLang: 'Chinese',
      translatedText: '你好，你好嗎？'
    },
    {
      id: 2,
      date: 'Today',
      time: '09:30 AM',
      mode: 'one-way',
      originalLang: 'Chinese',
      originalText: '今天天氣很好',
      translatedLang: 'English',
      translatedText: 'The weather is nice today'
    }
  ]);

  const filteredHistory = history.filter(item => 
    item.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.translatedText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedHistory = filteredHistory.reduce((groups, item) => {
    const date = item.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {});

  return (
    <div className="history-screen">
      <div className="app-header">
        <h1>History</h1>
      </div>
      
      <div className="search-bar">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Search history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="clear-button">
            <X className="clear-icon" />
          </button>
        )}
      </div>
      
      <div className="history-content">
        {Object.keys(groupedHistory).length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No translation history yet</h3>
            <p>Your translation history will appear here</p>
          </div>
        ) : (
          Object.entries(groupedHistory).map(([date, items]) => (
            <div key={date} className="history-group">
              <div className="date-header">{date}</div>
              {items.map((item) => (
                <div key={item.id} className="history-card">
                  <div className="card-header">
                    <span className="time">{item.time}</span>
                    <span className="mode-icon">{item.mode === 'two-way' ? '⇄' : '→'}</span>
                  </div>
                  <div className="translation-content">
                    <div className="original">
                      <span className="lang-tag">{item.originalLang}</span>
                      <p>{item.originalText}</p>
                    </div>
                    <div className="translated">
                      <span className="lang-tag">{item.translatedLang}</span>
                      <p>{item.translatedText}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 組件：設定頁面
const SettingsScreen = ({ apiKeys, onUpdateApiKeys, translationProvider, onProviderChange }) => {
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showTextSizeModal, setShowTextSizeModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [textSize, setTextSize] = useState('medium');
  const [theme, setTheme] = useState('light');
  const [tempApiKey, setTempApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.className = newTheme;
    localStorage.setItem('theme', newTheme);
  };

  const handleTextSizeChange = (size) => {
    setTextSize(size);
    document.documentElement.style.fontSize = 
      size === 'small' ? '14px' : 
      size === 'large' ? '18px' : '16px';
    localStorage.setItem('textSize', size);
    setShowTextSizeModal(false);
  };

  return (
    <div className="settings-screen">
      <div className="app-header">
        <h1>Settings</h1>
      </div>
      
      <div className="settings-content">
        <div className="settings-group">
          <h2>API KEY</h2>
          <div className="setting-item" onClick={() => setShowApiKeyModal(true)}>
            <div className="setting-info">
              <h3>Manage API Key</h3>
              <p>View, modify, or clear your API key.</p>
            </div>
            <ChevronRight className="chevron" />
          </div>
        </div>
        
        <div className="settings-group">
          <h2>TRANSLATION SERVICE</h2>
          <div className="setting-item" onClick={() => setShowServiceModal(true)}>
            <div className="setting-info">
              <h3>Select Service</h3>
              <p className="current-value">{translationProvider === 'openai' ? 'OpenAI' : 'DeepSeek'}</p>
            </div>
            <ChevronRight className="chevron" />
          </div>
        </div>
        
        <div className="settings-group">
          <h2>DISPLAY PREFERENCES</h2>
          <div className="setting-item" onClick={() => setShowTextSizeModal(true)}>
            <div className="setting-info">
              <h3>Text Size</h3>
              <p className="current-value">{textSize.charAt(0).toUpperCase() + textSize.slice(1)}</p>
            </div>
            <ChevronRight className="chevron" />
          </div>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Theme</h3>
              <p>Switch between light and dark themes.</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={handleThemeToggle}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        <div className="settings-group">
          <h2>HELP & FEEDBACK</h2>
          <div className="setting-item" onClick={() => alert('Support email: support@translateapp.com')}>
            <div className="setting-info">
              <h3>Support & Feedback</h3>
              <p>Get support or provide suggestions.</p>
            </div>
            <ChevronRight className="chevron" />
          </div>
        </div>
      </div>
      
      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="modal-overlay" onClick={() => setShowApiKeyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Manage API Key</h2>
            <div className="modal-body">
              <label>API Key</label>
              <div className="input-group">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={tempApiKey || apiKeys.google}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="Enter your API key"
                />
                <button onClick={() => setShowApiKey(!showApiKey)} className="eye-button">
                  {showApiKey ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <div className="modal-actions">
                <button 
                  className="clear-button"
                  onClick={() => {
                    setTempApiKey('');
                    onUpdateApiKeys({ ...apiKeys, google: '' });
                  }}
                >
                  Clear
                </button>
                <button 
                  className="save-button"
                  onClick={() => {
                    onUpdateApiKeys({ ...apiKeys, google: tempApiKey || apiKeys.google });
                    setShowApiKeyModal(false);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Text Size Modal */}
      {showTextSizeModal && (
        <div className="modal-overlay" onClick={() => setShowTextSizeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Text Size</h2>
            <div className="modal-body">
              <div className="option-list">
                {['small', 'medium', 'large'].map((size) => (
                  <div 
                    key={size}
                    className={`option-item ${textSize === size ? 'selected' : ''}`}
                    onClick={() => handleTextSizeChange(size)}
                  >
                    <span>{size.charAt(0).toUpperCase() + size.slice(1)}</span>
                    {textSize === size && <Check className="check-icon" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Service Selection Modal */}
      {showServiceModal && (
        <div className="modal-overlay" onClick={() => setShowServiceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Select Service</h2>
            <div className="modal-body">
              <div className="option-list">
                {['openai', 'deepseek'].map((service) => (
                  <div 
                    key={service}
                    className={`option-item ${translationProvider === service ? 'selected' : ''}`}
                    onClick={() => {
                      onProviderChange(service);
                      setShowServiceModal(false);
                    }}
                  >
                    <span>{service === 'openai' ? 'OpenAI' : 'DeepSeek'}</span>
                    {translationProvider === service && <Check className="check-icon" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 主應用程式
const TranslationApp = () => {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [apiKeys, setApiKeys] = useState({
    google: localStorage.getItem('googleApiKey') || '', // 在這裡加入您的預設 API
    openai: localStorage.getItem('openaiApiKey') || '', // 在這裡加入您的預設 API
    deepseek: localStorage.getItem('deepseekApiKey') || ''
  });
  const [translationProvider, setTranslationProvider] = useState('openai');
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  useEffect(() => {
    // 載入設定
    const savedKeys = localStorage.getItem('apiKeys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }
    
    const savedProvider = localStorage.getItem('translationProvider');
    if (savedProvider) {
      setTranslationProvider(savedProvider);
    }
    
    const savedWelcome = localStorage.getItem('hasSeenWelcome');
    if (savedWelcome) {
      setHasSeenWelcome(true);
      setCurrentScreen('translate');
    }
    
    // 載入主題設定
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.body.className = savedTheme;
    }
    
    // 載入文字大小
    const savedTextSize = localStorage.getItem('textSize');
    if (savedTextSize) {
      document.documentElement.style.fontSize = 
        savedTextSize === 'small' ? '14px' : 
        savedTextSize === 'large' ? '18px' : '16px';
    }
  }, []);

  const handleStart = () => {
    setHasSeenWelcome(true);
    localStorage.setItem('hasSeenWelcome', 'true');
    setCurrentScreen('translate');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onStart={handleStart} />;
        
      case 'translate':
        return <TranslateScreen apiKeys={apiKeys} translationProvider={translationProvider} />;
        
      case 'history':
        return <HistoryScreen />;
        
      case 'settings':
        return (
          <SettingsScreen
            apiKeys={apiKeys}
            onUpdateApiKeys={(keys) => {
              setApiKeys(keys);
              localStorage.setItem('apiKeys', JSON.stringify(keys));
            }}
            translationProvider={translationProvider}
            onProviderChange={(provider) => {
              setTranslationProvider(provider);
              localStorage.setItem('translationProvider', provider);
            }}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {renderScreen()}
      
      {/* 底部導航欄 - 在所有主要頁面顯示 */}
      {currentScreen !== 'welcome' && (
        <div className="bottom-nav">
          <button 
            className={`nav-item ${currentScreen === 'translate' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('translate')}
          >
            <Globe className="nav-icon" />
            <span>Translate</span>
          </button>
          
          <button 
            className={`nav-item ${currentScreen === 'history' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('history')}
          >
            <Clock className="nav-icon" />
            <span>History</span>
          </button>
          
          <button 
            className={`nav-item ${currentScreen === 'settings' ? 'active' : ''}`}
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
