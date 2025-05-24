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
                content: `You are a professional translator. Translate the following text from ${sourceLang} to ${targetLang}. Only provide the translation without any explanation.`
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
                content: `You are a professional translator. Translate the following text from ${sourceLang} to ${targetLang}. Only provide the translation without any explanation.`
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
