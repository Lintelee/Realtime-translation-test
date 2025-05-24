export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { audio, apiKey, targetLanguage } = req.body;

  if (!audio || !apiKey) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: 'zh-TW',
            alternativeLanguageCodes: [
              'en-US', 'ja-JP', 'fr-FR', 'de-DE',
              'es-ES', 'ko-KR', 'ru-RU', 'it-IT'
            ],
            enableAutomaticPunctuation: true,
            model: 'latest_long',
          },
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
      const detectedLanguage = result.languageCode || 'zh-TW';

      return res.status(200).json({
        text: transcript,
        language: detectedLanguage,
      });
    }

    return res.status(200).json({ text: '', language: 'zh-TW' });
  } catch (error) {
    console.error('Speech-to-text error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
