export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, sourceLang, targetLang, provider, apiKey } = req.body;

  if (!text || !apiKey) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    let translation = '';
    
    // 語言代碼映射
    const langMap = {
      'zh-TW': '繁體中文',
      'zh': '繁體中文',
      'ja-JP': '日文',
      'ja': '日文',
      'en-US': '英文',
      'en': '英文'
    };

    const sourceLangName = langMap[sourceLang] || sourceLang;
    const targetLangName = langMap[targetLang] || targetLang;

    if (provider === 'openai') {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `你是專業的翻譯員。請將以下${sourceLangName}文字翻譯成${targetLangName}。只提供翻譯結果，不要有任何解釋。`
              },
              {
                role: 'user',
                content: text
              }
            ],
            temperature: 0.3,
            max_tokens: 1000
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        return res.status(400).json({ error: data.error.message });
      }

      translation = data.choices[0].message.content.trim();

    } else if (provider === 'deepseek') {
      const response = await fetch(
        'https://api.deepseek.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: `你是專業的翻譯員。請將以下${sourceLangName}文字翻譯成${targetLangName}。只提供翻譯結果，不要有任何解釋。`
              },
              {
                role: 'user',
                content: text
              }
            ],
            temperature: 0.3,
            max_tokens: 1000
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        return res.status(400).json({ error: data.error.message });
      }

      translation = data.choices[0].message.content.trim();
    }

    return res.status(200).json({ translation });

  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
