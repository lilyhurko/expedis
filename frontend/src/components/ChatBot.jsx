import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaTimes, FaCommentDots } from "react-icons/fa";
import styles from "../assets/styles/ChatBot.module.css";

const FAQ_DATA = [
  { id: 1, label: "💵 How to top up wallet?", answer: "Go to Profile > Wallet and click on the 'Top Up' button. You can enter any amount." },
  { id: 2, label: "✈️ How to book a trip?", answer: "Find a trip you like in the 'All Offers' section, click on it, and press 'Book Now'. Make sure you are logged in!" },
  { id: 3, label: "📞 Support contacts", answer: "You can email us at support@expedis.com or call +48 123 456 789 (Mon-Fri, 9am-5pm)." },
  { id: 4, label: "❌ Cancellation policy", answer: "You can cancel your booking up to 48 hours before the trip for a full refund to your wallet." },
  { id: 5, label: "🔐 Is my data safe?", answer: "Yes, we use encrypted connections and secure MongoDB storage for all user data." },
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! 👋 I'm Expedis Bot. How can I help you today?", sender: "bot" }
  ]);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    const userMsg = { id: Date.now(), text: option.label, sender: "user" };
    
    const botMsg = { id: Date.now() + 1, text: option.answer, sender: "bot" };

    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <div className={styles.chatContainer}>
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <span>Expedis Assistant</span>
            <button onClick={toggleChat} className={styles.closeBtn}>
              <FaTimes />
            </button>
          </div>

          <div className={styles.messagesArea}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.message} ${
                  msg.sender === "bot" ? styles.botMessage : styles.userMessage
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.optionsArea}>
            {FAQ_DATA.map((option) => (
              <button
                key={option.id}
                className={styles.optionBtn}
                onClick={() => handleOptionClick(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button className={styles.toggleButton} onClick={toggleChat}>
        {isOpen ? <FaTimes /> : <FaCommentDots />}
      </button>
    </div>
  );
};

export default ChatBot;