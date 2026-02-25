import { useState, useEffect } from 'react';

const MotivationalQuotes = () => {
  const quotes = [
    {
      text: "The beautiful thing about learning is that no one can take it away from you.",
      author: "B.B. King",
      icon: "📚"
    },
    {
      text: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela",
      icon: "🌍"
    },
    {
      text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.",
      author: "Brian Herbert",
      icon: "🎁"
    },
    {
      text: "Learning never exhausts the mind.",
      author: "Leonardo da Vinci",
      icon: "🧠"
    },
    {
      text: "The expert in anything was once a beginner.",
      author: "Helen Hayes",
      icon: "⭐"
    },
    {
      text: "Success is the sum of small efforts repeated day in and day out.",
      author: "Robert Collier",
      icon: "🚀"
    }
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <div className="motivational-quotes">
      <div className="quote-container">
        <div className="quote-icon">{quotes[currentQuote].icon}</div>
        <blockquote className="quote-text">
          "{quotes[currentQuote].text}"
        </blockquote>
        <cite className="quote-author">— {quotes[currentQuote].author}</cite>
      </div>
      <div className="quote-indicators">
        {quotes.map((_, index) => (
          <button
            key={index}
            className={`quote-dot ${index === currentQuote ? 'active' : ''}`}
            onClick={() => setCurrentQuote(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default MotivationalQuotes;