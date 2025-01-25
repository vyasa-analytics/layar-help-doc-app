const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

async function getLayarToken(envURL, clientId, clientSecret) {
    return axios({
        method: "post",
        url: `https://${envURL}/connect/oauth/token`,
        headers: { Accept: "application/json" },
        auth: { username: clientId, password: clientSecret },
        params: {
            grant_type: "client_credentials",
            scope: "read write",
        },
    }).then((res) => res.data.access_token);
}

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { message, accesscode } = body;

        const env_url = "dldev01.vyasa.com";
        const client_id = process.env.CLIENT_ID;
        const client_secret = process.env.CLIENT_SECRET;

        if (!message) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ error: "Message is required" }),
            };
        }

        const generateURL = `https://${env_url}/layar/gpt/generate`;
        const token = await getLayarToken(env_url, client_id, client_secret);

        const generatePayload = {
            content: `Answer questions involving the attached context using only the source material, the question is: ${message}`,
            sources: [{ savedListId: accesscode }],
            task: "generate",
        };

        const response = await axios.post(generateURL, generatePayload, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
                "X-Vyasa-Client-Hint": "layar",
            },
        });

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ generatedContent: response.data.content }),
        };
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ error: "Error generating response" }),
        };
    }
};