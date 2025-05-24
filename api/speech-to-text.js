export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { audio, apiKey, mode, targetLanguage } = req.body;

  if (!audio || !apiKey) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // 根據模式調整語音識別設定
    const config = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: mode === 'lecture' ? targetLanguage : 'auto',
      alternativeLanguageCodes: mode === 'conversation' 
        ? ['zh-TW', 'zh', 'en-US', 'ja-JP'] 
        : [],
      enableAutomaticPunctuation: true,
      enableWordTimeOffsets: mode === 'lecture',
      model: 'default'
    };

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config,
          audio: {
            content: audio,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    if (data.results && data.results[0]) {
      const result = data.results[0];
      const transcript = result.alternatives[0].transcript;
      const detectedLanguage = result.languageCode || targetLanguage;

      return res.status(200).json({
        text: transcript,
        language: detectedLanguage,
        mode: mode
      });
    }

    return res.status(200).json({ text: '', language: targetLanguage });
  } catch (error) {
    console.error('Speech-to-text error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
