import React, { useState, useRef, useEffect } from "react";
import styles from "../assets/styles/ChatBot.module.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

const IconChat = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
);
const IconClose = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);
const IconBotFace = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
    <circle cx="12" cy="5" r="2"></circle>
    <path d="M12 7v4"></path>
    <line x1="8" y1="16" x2="8" y2="16"></line>
    <line x1="16" y1="16" x2="16" y2="16"></line>
  </svg>
);

const OPTIONS_DATA = [
  { 
    id: 'wallet', 
    label: "💰 My Balance", 
    action: 'fetch_wallet',
    keywords: ["balance", "money", "funds", "wallet", "cash", "amount"]
  },
  { 
    id: 'bookings', 
    label: "📅 My Bookings", 
    action: 'fetch_bookings',
    keywords: ["booking", "trip", "reservation", "history", "flights"]
  },
  { 
    id: 'support', 
    label: "📞 Support", 
    answer: "Email: support@expedis.com or Call: +48 123 456 789 (Mon-Fri, 9am-5pm).",
    keywords: ["support", "contact", "email", "phone", "help"]
  },
  { 
    id: 'faq_topup', 
    label: "How to top up?", 
    answer: "Go to Profile > Wallet and click 'Top Up'. Enter amount and wait for admin approval.",
    keywords: ["top up", "deposit", "recharge"]
  },
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! 👋 I'm Expedis Bot. I can check your balance and bookings.", sender: "bot" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isTyping]);

  const toggleChat = () => setIsOpen(!isOpen);

  const addMessage = (text, sender) => {
    setMessages((prev) => [...prev, { id: Date.now(), text, sender }]);
  };


  const fetchWallet = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      simulateBotResponse("Please log in to see your wallet balance. 🔒");
      return;
    }

    setIsTyping(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Failed to fetch wallet");
      
      const data = await res.json();
      setIsTyping(false);
      addMessage(`💰 Your current balance is: **${data.balance?.toFixed(2)} PLN**`, "bot");
      
      if (data.balance_held > 0) {
        setTimeout(() => addMessage(`(Held funds: ${data.balance_held.toFixed(2)} PLN)`, "bot"), 500);
      }
    } catch (error) {
      setIsTyping(false);
      addMessage("I couldn't access your wallet details right now. Please try again later.", "bot");
    }
  };

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      simulateBotResponse("Please log in to see your bookings. 🔒");
      return;
    }

    setIsTyping(true);
    try {
      const res = await fetch(`${API_URL}/api/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to fetch bookings");

      const bookings = await res.json();
      setIsTyping(false);

      if (bookings.length === 0) {
        addMessage("You don't have any upcoming bookings yet. Time to plan a trip? ✈️", "bot");
      } else {
        addMessage(`You have ${bookings.length} booking(s). Here is the latest one:`, "bot");
        const latest = bookings[0];
        const date = new Date(latest.selectedDate).toLocaleDateString();
        setTimeout(() => {
          addMessage(`📍 **${latest.offer?.title}**\n📅 Date: ${date}\n✅ Status: ${latest.status}`, "bot");
        }, 500);
      }
    } catch (error) {
      setIsTyping(false);
      addMessage("Could not fetch your bookings info.", "bot");
    }
  };


  const simulateBotResponse = (text) => {
    setIsTyping(true);
    const delay = Math.min(Math.max(text.length * 20, 600), 2000);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(text, "bot");
    }, delay);
  };

  const handleOptionClick = (option) => {
    addMessage(option.label, "user");
    
    if (option.action === 'fetch_wallet') {
      fetchWallet();
    } else if (option.action === 'fetch_bookings') {
      fetchBookings();
    } else {
      simulateBotResponse(option.answer);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    addMessage(userText, "user");
    setInputValue("");

    setTimeout(() => {
      const lowerText = userText.toLowerCase();
      
      const matchedOption = OPTIONS_DATA.find(opt => 
        opt.keywords.some(kw => lowerText.includes(kw))
      );

      if (matchedOption) {
        if (matchedOption.action === 'fetch_wallet') fetchWallet();
        else if (matchedOption.action === 'fetch_bookings') fetchBookings();
        else simulateBotResponse(matchedOption.answer);
      } else {
        simulateBotResponse("I'm not sure about that. 🤔 You can ask about 'balance', 'bookings' or check the menu.");
      }
    }, 400);
  };

  return (
    <div className={styles.chatContainer}>
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.headerInfo}>
              <div className={styles.botAvatar}><IconBotFace /></div>
              <span>Expedis Assistant</span>
            </div>
            <button onClick={toggleChat} className={styles.closeBtn}><IconClose /></button>
          </div>

          <div className={styles.messagesArea}>
            {messages.map((msg, index) => (
              <div
                key={`${msg.id}-${index}`}
                className={`${styles.message} ${
                  msg.sender === "bot" ? styles.botMessage : styles.userMessage
                }`}
              >
                {msg.text.split('**').map((part, i) => 
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                )}
              </div>
            ))}
            {isTyping && (
              <div className={styles.typingContainer}>
                <div className={styles.typingDot}></div>
                <div className={styles.typingDot}></div>
                <div className={styles.typingDot}></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.optionsArea}>
            {OPTIONS_DATA.map((option) => (
              <button
                key={option.id}
                className={styles.optionBtn}
                onClick={() => handleOptionClick(option)}
                disabled={isTyping}
              >
                {option.label}
              </button>
            ))}
          </div>

          <form className={styles.inputArea} onSubmit={handleSendMessage}>
            <input
              type="text"
              className={styles.chatInput}
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping} 
            />
            <button type="submit" className={styles.sendButton} disabled={!inputValue.trim() || isTyping}>
              <IconSend />
            </button>
          </form>
        </div>
      )}

      <button className={styles.toggleButton} onClick={toggleChat}>
        {isOpen ? <IconClose /> : <IconChat />}
      </button>
    </div>
  );
};

export default ChatBot;