import https from 'https';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    const postData = JSON.stringify(req.body);

    const aiResponse = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'ai.replit.dev',
        port: 443,
        path: '/v1beta/models/gemini-2.5-flash:generateContent',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const aiReq = https.request(options, (aiRes) => {
        let data = '';
        aiRes.on('data', chunk => data += chunk);
        aiRes.on('end', () => {
          resolve({ status: aiRes.statusCode, data });
        });
      });

      aiReq.on('error', reject);
      aiReq.write(postData);
      aiReq.end();
    });

    res.status(aiResponse.status).end(aiResponse.data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}
