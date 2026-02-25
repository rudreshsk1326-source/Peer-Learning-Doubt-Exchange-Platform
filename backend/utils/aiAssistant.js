const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const generateAIAnswer = async (title, description, subject) => {
  try {
    const prompt = `You are an AI tutor helping students with their academic questions. 
    
Question: ${title}
Description: ${description}
Subject: ${subject}

Please provide a clear, educational answer that:
1. Directly addresses the question
2. Explains concepts step-by-step
3. Uses simple language appropriate for students
4. Includes examples when helpful
5. Keeps the response concise but comprehensive

Answer:`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 1000
    });

    return completion.choices[0]?.message?.content || "I apologize, but I couldn't generate an answer at this time. Please try again later.";
  } catch (error) {
    console.error('AI Answer Generation Error:', error);
    return "I'm currently unable to provide an AI answer. Please check back later or rely on community answers.";
  }
};

module.exports = { generateAIAnswer };