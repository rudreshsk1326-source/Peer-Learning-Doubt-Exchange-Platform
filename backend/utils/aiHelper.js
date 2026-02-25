const Groq = require('groq-sdk');

const apiKey = process.env.GROQ_API_KEY;

const groq = new Groq({
  apiKey: apiKey
});

const generateAIAnswer = async (prompt) => {
  try {
    if (!apiKey) {
      console.error('GROQ_API_KEY not found in environment variables');
      return "API key not configured. Please check server configuration.";
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant. Answer questions clearly and accurately. Provide educational explanations when appropriate."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1000
    });

    return completion.choices[0]?.message?.content || "Unable to generate answer at this time.";
  } catch (error) {
    console.error('AI Answer Generation Error:', error.message);
    if (error.message.includes('401')) {
      return "Invalid API key. Please check your Groq API key.";
    }
    if (error.message.includes('429')) {
      return "Rate limit exceeded. Please try again in a moment.";
    }
    return `AI service error: ${error.message}`;
  }
};

module.exports = { generateAIAnswer };