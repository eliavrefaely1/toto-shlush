import React from "react";

const quotes = [
  "לטוטו שלוש הגעת – כמעט לקחת! 🎯",
  "מי שלא מנחש הרבה, יצאת עגל! 🐄",
  "הכסף קורא לך - תענה! 💰",
  "עוד משחק אחד נכון ואתה במקום הראשון! 🏆",
  "הקופה מחכה לזוכה החכם! 💼",
  "טוטו זה לא מזל, זה כישרון! ⚽"
];

export default function MotivationalQuotes() {
  const [currentQuote, setCurrentQuote] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-xl shadow-lg mb-6">
      <div className="text-center">
        <div className="text-2xl mb-2">🎪</div>
        <p className="text-white font-bold text-lg animate-pulse">
          {quotes[currentQuote]}
        </p>
      </div>
    </div>
  );
}