// api/explain.js
// Vercel Serverless Function to securely proxy AI API requests (Gemini or Groq)
module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    return;
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Missing parameter: prompt' });
      return;
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'API key is not configured on the Vercel server. Please add GROQ_API_KEY or GEMINI_API_KEY to Vercel environment variables.' });
      return;
    }

    // Detect if key is for Groq or Gemini
    const isGroq = apiKey.startsWith('gsk_') || !!process.env.GROQ_API_KEY;

    if (isGroq) {
      // Call Groq API (OpenAI-compatible)
      const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        res.status(response.status).json({ error: `Groq API error: ${errText}` });
        return;
      }

      const data = await response.json();
      
      // Translate Groq (OpenAI) response schema to Gemini format to avoid client-side changes
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        const text = data.choices[0].message.content;
        const geminiCompatibleData = {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: text
                  }
                ]
              }
            }
          ]
        };
        res.status(200).json(geminiCompatibleData);
      } else {
        res.status(500).json({ error: 'Unexpected response structure from Groq.' });
      }

    } else {
      // Call Gemini API
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        res.status(response.status).json({ error: `Gemini API error: ${errText}` });
        return;
      }

      const data = await response.json();
      res.status(200).json(data);
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
