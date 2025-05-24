import React, { useState, useEffect, useRef } from 'react';
import { Globe, Mic, MicOff, Volume2, Settings, History, X, Loader2, Wifi, WifiOff } from 'lucide-react';
import './App.css';

const TranslationApp = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [upperText, setUpperText] = useState('');
  const [lowerText, setLowerText] = useState('');
  const [upperTranslation, setUpperTranslation] = useState('');
  const [lowerTranslation, setLowerTranslation] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [apiKeys, setApiKeys] = useState({
    google: '',
    openai: '',
    deepseek: ''
  });
  const [translationProvider, setTranslationProvider] = useState('openai');
  const [showSettings, setShowSettings] = useState(false);
  const [translationHistory, setTranslationHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [recognitionStatus, setRecognitionStatus] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const languages = {
    en: '英文',
    ja: '日文',
    fr: '法文',
    de: '德文',
    es: '西班牙文',
    ko: '韓文',
    ru: '俄文',
    it: '義大利文'
  };

  useEffect(() => {
    // 檢查網路狀態
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // 載入儲存的設定
    const savedKeys = localStorage.getItem('apiKeys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }
    
    const savedProvider = localStorage.getItem('translationProvider');
    if (savedProvider) {
      setTranslationProvider(savedProvider);
    }
    
    const savedHistory = localStorage.getItem('translationHistory');
    if (savedHistory) {
      setTranslationHistory(JSON.parse(savedHistory));
    }
    
    // 檢查是否首次使用
    const isFirstUse = !localStorage.getItem('hasUsedBefore');
    if (isFirstUse) {
      setShowSettings(true);
      localStorage.setItem('hasUsedBefore', 'true');
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const startRecording = async () => {
    if (!isOnline) {
      alert('需要網路連接才能使用語音識別功能');
      return;
    }
    
    if (!apiKeys.google) {
      alert('請先設定 Google Cloud API 金鑰');
      setShowSettings(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecognitionStatus('正在錄音...');
      
      // 開始計時
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('錄音錯誤:', error);
      alert('無法存取麥克風，請確認已授予權限');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setRecognitionStatus('處理中...');
      
      // 停止計時
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const processAudio = async (audioBlob) => {
    try {
      // 將音頻轉換為base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];
        
        // 呼叫語音識別API
        const response = await fetch('/api/speech-to-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            audio: base64Audio,
            apiKey: apiKeys.google,
            targetLanguage: targetLanguage
          })
        });
        
        const data = await response.json();
        
        if (data.error) {
          setRecognitionStatus(`錯誤: ${data.error}`);
          return;
        }
        
        if (data.text) {
          handleTranscription(data.text, data.language);
          setRecognitionStatus('');
        } else {
          setRecognitionStatus('未識別到語音');
        }
      };
    } catch (error) {
      console.error('處理音頻錯誤:', error);
      setRecognitionStatus('處理失敗');
    }
  };

  const handleTranscription = async (text, detectedLanguage) => {
    if (!text) return;
    
    // 判斷是否為中文
    const isChinese = detectedLanguage === 'zh-TW' || detectedLanguage === 'zh' || 
                      /[\u4e00-\u9fa5]/.test(text);
    
    if (isChinese) {
      setLowerText(text);
      await translateText(text, 'zh-TW', targetLanguage, 'lower');
    } else {
      setUpperText(text);
      await translateText(text, detectedLanguage || targetLanguage, 'zh-TW', 'upper');
    }
    
    // 儲存到歷史
    const historyItem = {
      timestamp: new Date().toISOString(),
      originalText: text,
      originalLang: isChinese ? 'zh-TW' : detectedLanguage,
      translatedText: '',
      targetLang: isChinese ? targetLanguage : 'zh-TW'
    };
    
    setTranslationHistory(prev => {
      const newHistory = [historyItem, ...prev].slice(0, 50);
      localStorage.setItem('translationHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const translateText = async (text, sourceLang, targetLang, position) => {
    if (!text || !apiKeys[translationProvider]) {
      return;
    }
    
    setIsTranslating(true);
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          sourceLang,
          targetLang,
          provider: translationProvider,
          apiKey: apiKeys[translationProvider]
        })
      });
      
      const data = await response.json();
      
      if (data.translation) {
        if (position === 'upper') {
          setUpperTranslation(data.translation);
        } else {
          setLowerTranslation(data.translation);
        }
        
        // 更新歷史
        setTranslationHistory(prev => {
          const updated = [...prev];
          if (updated.length > 0 && updated[0].originalText === text) {
            updated[0].translatedText = data.translation;
          }
          localStorage.setItem('translationHistory', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (error) {
      console.error('翻譯錯誤:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const speak = (text, lang) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'zh-TW' ? 'zh-TW' : lang;
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const saveApiKeys = () => {
    localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
    localStorage.setItem('translationProvider', translationProvider);
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="w-8 h-8 text-indigo-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">雙向翻譯</h1>
            </div>
            <div className="flex items-center space-x-3">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-600" />
              )}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <History className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex items-center justify-center space-x-3">
            <span className="text-sm text-gray-600">目標語言：</span>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              {Object.entries(languages).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Translation Windows */}
        <div className="space-y-4">
          {/* Upper Window */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700">
                外語 → 中文
              </h3>
              {upperTranslation && (
                <button
                  onClick={() => speak(upperTranslation, 'zh-TW')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Volume2 className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3 min-h-[80px]">
                <p className="text-sm text-gray-800">{upperText || '等待輸入...'}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 min-h-[80px] relative">
                {isTranslating && upperText && !upperTranslation && (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin absolute top-3 right-3" />
                )}
                <p className="text-sm text-gray-800">{upperTranslation || '翻譯結果...'}</p>
              </div>
            </div>
          </div>

          {/* Lower Window */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700">
                中文 → {languages[targetLanguage]}
              </h3>
              {lowerTranslation && (
                <button
                  onClick={() => speak(lowerTranslation, targetLanguage)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Volume2 className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3 min-h-[80px]">
                <p className="text-sm text-gray-800">{lowerText || '等待輸入...'}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 min-h-[80px] relative">
                {isTranslating && lowerText && !lowerTranslation && (
                  <Loader2 className="w-4 h-4 text-green-600 animate-spin absolute top-3 right-3" />
                )}
                <p className="text-sm text-gray-800">{lowerTranslation || '翻譯結果...'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recording Button */}
        <div className="mt-6 text-center">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!isOnline}
            className={`p-5 rounded-full shadow-lg transition-all transform hover:scale-105 ${
              !isOnline 
                ? 'bg-gray-400 cursor-not-allowed'
                : isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isRecording ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>
          {isRecording && (
            <p className="mt-2 text-sm text-gray-600">{formatTime(recordingTime)}</p>
          )}
          {recognitionStatus && (
            <p className="mt-2 text-sm text-gray-600">{recognitionStatus}</p>
          )}
          {!isOnline && (
            <p className="mt-2 text-sm text-red-600">需要網路連接</p>
          )}
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">設定</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    首次使用請設定 API 金鑰。您的金鑰將安全地儲存在本地裝置。
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Cloud API 金鑰
                  </label>
                  <input
                    type="password"
                    value={apiKeys.google}
                    onChange={(e) => setApiKeys({...apiKeys, google: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="輸入您的 Google Cloud API 金鑰"
                  />
                  <a 
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                  >
                    取得 API 金鑰
                  </a>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    翻譯服務
                  </label>
                  <select
                    value={translationProvider}
                    onChange={(e) => setTranslationProvider(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="deepseek">DeepSeek</option>
                  </select>
                </div>
                
                {translationProvider === 'openai' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      OpenAI API 金鑰
                    </label>
                    <input
                      type="password"
                      value={apiKeys.openai}
                      onChange={(e) => setApiKeys({...apiKeys, openai: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="sk-..."
                    />
                    <a 
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                    >
                      取得 API 金鑰
                    </a>
                  </div>
                )}
                
                {translationProvider === 'deepseek' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DeepSeek API 金鑰
                    </label>
                    <input
                      type="password"
                      value={apiKeys.deepseek}
                      onChange={(e) => setApiKeys({...apiKeys, deepseek: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="輸入您的 DeepSeek API 金鑰"
                    />
                  </div>
                )}
                
                <button
                  onClick={saveApiKeys}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  儲存設定
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">翻譯歷史</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-3">
                {translationHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">尚無翻譯記錄</p>
                ) : (
                  translationHistory.map((item, index) => (
                    <div key={index} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleString('zh-TW')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.originalLang} → {item.targetLang}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-gray-100 rounded p-2">
                          <p className="text-sm text-gray-700">{item.originalText}</p>
                        </div>
                        {item.translatedText && (
                          <div className="bg-blue-50 rounded p-2">
                            <p className="text-sm text-gray-700">{item.translatedText}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationApp;
