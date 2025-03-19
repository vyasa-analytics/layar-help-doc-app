const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

async function getLayarToken(envURL, clientId, clientSecret) {
  try {
    console.log(`Fetching token from ${envURL}`);
    const response = await axios({
      method: "post",
      url: `https://${envURL}/connect/oauth/token`,
      headers: { Accept: "application/json" },
      auth: { username: clientId, password: clientSecret },
      params: {
        grant_type: "client_credentials",
        scope: "read write",
      },
    });
    console.log("Token fetched successfully:", response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching Layar token:", error.response?.data || error.message);
    throw new Error(`Failed to fetch Layar token: ${error.response?.data?.error || error.message}`);
  }
}

async function enrichChunksWithDocNames(chunks, envURL, token) {
  if (!Array.isArray(chunks)) return chunks;

  const uniqueDocIds = [...new Set(chunks.map((c) => c.documentId))];
  const docNameMap = {};

  await Promise.all(
    uniqueDocIds.map(async (docId) => {
      try {
        const docResp = await axios.get(`https://${envURL}/layar/sourceDocument/${docId}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "X-Vyasa-Client-Hint": "layar",
          },
        });
        docNameMap[docId] = docResp.data.name || docId;
      } catch (err) {
        console.error(`Error fetching doc info for ${docId}:`, err.message);
        docNameMap[docId] = docId; // fallback
      }
    })
  );

  const updated = chunks.map((chunk) => ({
    ...chunk,
    docName: docNameMap[chunk.documentId] || chunk.documentId,
  }));

  return updated;
}

exports.handler = async (event) => {
  try {
    console.log("Received event:", JSON.stringify(event));
    const body = JSON.parse(event.body);
    const { message, accesscode } = body;

    const env_url = "internal-dev.certara.ai"; 
    const client_id = process.env.client_id;
    const client_secret = process.env.client_secret;

    console.log("Client ID:", client_id);
    console.log("Client Secret:", client_secret ? "****" : "undefined");

    if (!message) {
      console.warn("Message is required");
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Message is required" }),
      };
    }
    if (!accesscode) {
      console.warn("Access code is required");
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Access code is required" }),
      };
    }

    // 1) Fetch Layar OAuth token
    const token = await getLayarToken(env_url, client_id, client_secret);
    console.log("Generated token:", token);

    // 2) Build the 'generate' payload
    const generatePayload = {
      content: `Answer questions involving the attached context using only the source material, the question is: ${message}`,
      sources: [{ savedListId: accesscode }],
      task: "generate",
    };

    console.log("Generate Payload:", generatePayload);

    const generateURL = `https://${env_url}/layar/gpt/generate`;
    const response = await axios.post(generateURL, generatePayload, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-Vyasa-Client-Hint": "layar",
      },
    });
    console.log("Response from Layar:", response.data);

    const generatedContent = response.data.content;
    let chunksUsed = response.data.chunksUsed; 

    // Grab names of each chunk's relevant docID that it's pulling from
    if (Array.isArray(chunksUsed) && chunksUsed.length > 0) {
      chunksUsed = await enrichChunksWithDocNames(chunksUsed, env_url, token);
    }

    // Spit back info including the chunks
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generatedContent,
        chunksUsed,
      }),
    };
  } catch (error) {
    console.error("Error:", error.message);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: `Error generating response: ${error.message}` }),
    };
  }
};
