// Copy this code into your Cloudflare Worker script

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    };

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      const apiKey = env.OPENAI_API_KEY; // set this secret in your Worker environment
      if (!apiKey) {
        return new Response(
          JSON.stringify({
            error: "OPENAI_API_KEY not set in Worker environment",
          }),
          { status: 500, headers: corsHeaders }
        );
      }

      const apiUrl = "https://api.openai.com/v1/chat/completions";

      // Parse incoming JSON safely
      let userInput;
      try {
        userInput = await request.json();
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      // Build request body. Use provided model or default to a safe choice.
      const model = userInput.model || "gpt-4o";
      const messages = userInput.messages || [];
      const maxTokens =
        userInput.max_tokens || userInput.max_completion_tokens || 300;

      const requestBody = {
        model,
        messages,
        max_tokens: maxTokens,
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      // If OpenAI returned an error, forward an informative message
      if (!response.ok) {
        return new Response(JSON.stringify({ error: data }), {
          status: response.status,
          headers: corsHeaders,
        });
      }

      // Extract the assistant text to return a simpler shape the frontend expects
      let reply = null;
      if (
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content
      ) {
        reply = data.choices[0].message.content;
      }

      // Return normalized shape but also include raw data for debugging if needed
      return new Response(JSON.stringify({ reply, raw: data }), {
        status: 200,
        headers: corsHeaders,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};
