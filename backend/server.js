const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());
dotenv.config();


async function getLayarToken(envURL, clientId, clientSecret) {
    return axios({
      method: 'post',
      url: `https://${envURL}/connect/oauth/token`, 
      headers: { 'Accept': 'application/json' },
      auth: { username: clientId, password: clientSecret },
      params: { 
        grant_type: 'client_credentials',
        scope: 'read write'
      }
    }).then(res => res.data.access_token);
   }

app.post("/api/chat", async (req, res) => {

    env_url = 'dldev01.vyasa.com'; 
    client_id = process.env.client_id;  
    client_secret = process.env.client_secret; 
    const generateURL = `https://${env_url}/layar/gpt/generate`;

    const token = await getLayarToken(env_url, client_id, client_secret);
    const message = req.body.message;
    const accessCode = req.body.accesscode;


    const prompt = `Answer the following question using only the source material provided in the context, provide evidence substantiating your claims. Question : ${message}`;
    const generatePayload = {
        content: `Answer questions involving the attached context using only the source material, the question is: ${message}`,
        sources: [{
          savedListId: accessCode
        }],
        task: "generate"
       };

    console.log(generatePayload);
    if (!message) {
        return res.status(400).send({ error: "Message is required" });
    }

    try {
        const response = await axios.post(generateURL, generatePayload, {
            headers: {
                'Accept' : 'application/json',
                'Authorization' : `Bearer ${token}`,
                'X-Vyasa-Client-Hint': 'layar'
            }
        }
        )

        console.log(response.data);
        const generatedContent = response.data.content;
        res.send({ generatedContent });
    } catch (error) {
        console.error("Error calling Layar API:", error.response?.data || error.message);
        res.status(500).send({ error: "Error generating response" });
    }
    
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

