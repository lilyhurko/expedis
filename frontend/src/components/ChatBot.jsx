import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../assets/styles/ChatBot.module.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

const IconChat = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>);
const IconClose = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const IconSend = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>);
const IconBotFace = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>);
const IconBack = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>);

const BOT_FLOWS = {
  main: [
    { id: 'find_trip', label: "🔍 Find a Trip", action: 'switch_flow', target: 'discovery' },
    { id: 'wallet', label: "💰 My Balance", action: 'fetch_wallet' },
    { id: 'guide', label: "❓ How to book?", action: 'start_guide' },
    { id: 'support', label: "📞 Help & Support", action: 'switch_flow', target: 'support_flow' },
  ],
  discovery: [
    { id: 'cheap', label: "💸 Cheap (< 1000 PLN)", action: 'navigate', url: '/trips?maxPrice=1000' },
    { id: 'weekend', label: "⏱️ Weekend (2 days)", action: 'navigate', url: '/trips?duration=2' },
    { id: 'warm', label: "☀️ Warm Places", action: 'navigate', url: '/trips?destination=Spain' }, 
    { id: 'back', label: "⬅️ Back", action: 'switch_flow', target: 'main' },
  ],
  support_flow: [
    { id: 'cancel', label: "❌ Cancellation Policy", action: 'show_policy' },
    { id: 'contacts', label: "📞 Contacts", action: 'simple_response', text: "Email: support@expedis.com\nPhone: +48 123 456 789" },
    { id: 'back', label: "⬅️ Back", action: 'switch_flow', target: 'main' },
  ]
};

const KEYWORDS_MAP = [
  { keys: ["cheap", "budget", "low cost"], action: 'navigate', url: '/trips?maxPrice=500', response: "I found some budget-friendly options for you! 💸" },
  { keys: ["balance", "wallet", "money"], action: 'fetch_wallet' },
  { keys: ["cancel", "refund"], action: 'show_policy' },
  { keys: ["book", "guide", "how to"], action: 'start_guide' },
];

const ChatBot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! 👋 I'm Expedis Bot. How can I help you today?", sender: "bot" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentFlow, setCurrentFlow] = useState('main'); 
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isTyping]);

  const toggleChat = () => setIsOpen(!isOpen);

  const addMessage = (text, sender) => {
    setMessages((prev) => [...prev, { id: Date.now(), text, sender }]);
  };


  const simulateBotResponse = (text, delay = 0) => {
    setIsTyping(true);
    const calcDelay = delay || Math.min(Math.max(text.length * 20, 600), 2500);
    
    setTimeout(() => {
      setIsTyping(false);
      addMessage(text, "bot");
    }, calcDelay);
  };

  const executeAction = (actionType, payload) => {
    switch (actionType) {
      case 'switch_flow':
        setCurrentFlow(payload); 
        break;
      
      case 'navigate':
        simulateBotResponse("Sure! Applying filters for you... 🚀");
        setTimeout(() => {
            navigate(payload); 
            if (window.innerWidth < 768) setIsOpen(false);
        }, 1500);
        break;

      case 'fetch_wallet':
        fetchWalletData();
        break;

      case 'start_guide':
        startBookingGuide();
        break;

      case 'show_policy':
        addMessage("You can cancel up to 48h before the trip for a full refund. 🛡️", "bot");
        setTimeout(() => {
            addMessage("Would you like to check your active bookings?", "bot");
        }, 1000);
        break;

      case 'simple_response':
        simulateBotResponse(payload);
        break;

      default:
        break;
    }
  };

  const handleOptionClick = (option) => {
    if (option.id !== 'back') {
        addMessage(option.label, "user");
    }
    

    if (option.action === 'navigate') executeAction('navigate', option.url);
    else if (option.action === 'switch_flow') executeAction('switch_flow', option.target);
    else if (option.action === 'fetch_wallet') executeAction('fetch_wallet');
    else if (option.action === 'start_guide') executeAction('start_guide');
    else if (option.action === 'show_policy') executeAction('show_policy');
    else if (option.action === 'simple_response') executeAction('simple_response', option.text);
  };


  const fetchWalletData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      simulateBotResponse("Please log in to see your wallet. 🔒");
      return;
    }
    setIsTyping(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      simulateBotResponse(`💰 Balance: **${data.balance?.toFixed(2)} PLN**`);
    } catch {
      simulateBotResponse("Couldn't check wallet right now.");
    }
  };


  const startBookingGuide = () => {
    setIsTyping(true);
    setTimeout(() => { setIsTyping(false); addMessage("It's easy! Here is how:", "bot"); }, 1000);
    
    setTimeout(() => { setIsTyping(true); }, 1100);
    setTimeout(() => { setIsTyping(false); addMessage("1️⃣ Go to 'All Offers' and pick a trip.", "bot"); }, 2500);

    setTimeout(() => { setIsTyping(true); }, 2600);
    setTimeout(() => { setIsTyping(false); addMessage("2️⃣ Click 'Book Now' on the card.", "bot"); }, 4500);

    setTimeout(() => { setIsTyping(true); }, 4600);
    setTimeout(() => { setIsTyping(false); addMessage("3️⃣ Choose a date & pay from wallet. Done! 🎉", "bot"); }, 6500);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const text = inputValue.trim();
    addMessage(text, "user");
    setInputValue("");


    setTimeout(() => {
      const lowerText = text.toLowerCase();
      const match = KEYWORDS_MAP.find(k => k.keys.some(word => lowerText.includes(word)));

      if (match) {
        if (match.response) simulateBotResponse(match.response);
        executeAction(match.action, match.url);
      } else {
        simulateBotResponse("I'm mostly trained on travel & booking. Try using the menu buttons below! 👇");
      }
    }, 500);
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
              <div key={`${msg.id}-${index}`} className={`${styles.message} ${msg.sender === "bot" ? styles.botMessage : styles.userMessage}`}>
                {msg.text.split('\n').map((line, i) => <div key={i}>{line}</div>)}
              </div>
            ))}
            {isTyping && (
              <div className={styles.typingContainer}>
                <div className={styles.typingDot}></div><div className={styles.typingDot}></div><div className={styles.typingDot}></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.optionsArea}>
            {BOT_FLOWS[currentFlow].map((option) => (
              <button key={option.id} className={styles.optionBtn} onClick={() => handleOptionClick(option)}>
                {option.id === 'back' && <span style={{marginRight: '5px'}}><IconBack/></span>}
                {option.label}
              </button>
            ))}
          </div>

          <form className={styles.inputArea} onSubmit={handleSendMessage}>
            <input type="text" className={styles.chatInput} placeholder="Type a question..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} disabled={isTyping} />
            <button type="submit" className={styles.sendButton} disabled={!inputValue.trim() || isTyping}><IconSend /></button>
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