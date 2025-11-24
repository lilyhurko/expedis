import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../assets/styles/ChatBot.module.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

const IconChat = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>);
const IconClose = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const IconSend = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>);
const IconBotFace = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>);
const IconBack = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>);
const IconTrash = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>);
const IconPower = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>);

const CHAT_CONTENT = {
  en: {
    greeting: "Hi! 👋 I'm Expedis Bot. Pick a topic to get started:",
    greeting_personal: "Hi, {name}! 👋 Nice to see you again. Planning a new trip? ✈️",
    placeholder: "Type a question...",
    unknown: "I'm mostly trained on travel & booking. Try using the categories above! 👆",
    login_req: "Please log in to access this feature. 🔒",
    wallet_msg: "💰 Your balance:",
    held_msg: "Held:",
    no_bookings: "No active bookings found. Time for a vacation? ✈️",
    booking_msg: "Latest booking info:",
    end_chat_confirm: "End current chat session?",
    guide_intro: "Booking Guide:",
    guide_steps: [
      "1️⃣ Explore 'All Offers' page.",
      "2️⃣ Choose a trip and click 'Book Now'.",
      "3️⃣ Select dates, guests & confirm payment. Easy!"
    ],
    cancel_policy: "Cancellation is free up to 48h before the trip. Refund is instant to your wallet. 🛡️",
    applying_filter: "Applying filters... 🚀",
    feedback_ask: "Was this helpful?",
    feedback_thanks: "Thanks for your feedback! 🙏",
    
    easter_eggs: {
      money: [
        "If you find a discount >50%, tell me. I'll be shocked. 🤯",
        "My algorithms suggest today is a good day to save money. 😉",
        "Payment confirmed! (Just kidding, I'm just a bot, but I believe in you 💸)"
      ],
      travel: [
        "They say those who travel are happier. They say. Not me. 🤖",
        "In my next life, I want to be carry-on luggage. At least I'd go somewhere. 😔✈️",
        "I'm not a cat. But I purr when you pick a cheap flight. 🐈"
      ],
      general: [
        "I'm a bot, but even I dream of a vacation. Spain. Beach. Stable Wi-Fi. 😌",
        "Working 110%. Devs promised to patch in 'sleep' mode next update...",
        "Secret tip: discounts get bigger during full moon. Allegedly. 🌕😉",
        "If you click 'Booking' three times, a portal opens. Jk... or am I? 🤫"
      ]
    },

    flows: {
      main: [
        { id: 'cat_payment', label: "💸 Payments", action: 'switch_flow', target: 'flow_payment', styleClass: 'btnPayment' },
        { id: 'cat_booking', label: "✈️ Booking", action: 'switch_flow', target: 'flow_booking', styleClass: 'btnBooking' },
        { id: 'cat_cancel', label: "❌ Cancellation", action: 'switch_flow', target: 'flow_cancel', styleClass: 'btnCancel' },
        { id: 'cat_account', label: "🔐 Account", action: 'switch_flow', target: 'flow_account', styleClass: 'btnAccount' },
        { id: 'cat_general', label: "🧭 General", action: 'switch_flow', target: 'flow_general', styleClass: 'btnGeneral' },
      ],
      flow_payment: [
        { id: 'wallet', label: "💰 Check Balance", action: 'fetch_wallet' },
        { id: 'topup', label: "💵 How to Top Up?", action: 'simple_response', text: "Go to Profile > Wallet > Click 'Top Up'. Enter amount & wait for approval.", needsFeedback: true },
        { id: 'safe', label: "🛡️ Is payment safe?", action: 'simple_response', text: "Yes! We use secure encrypted connections.", needsFeedback: true },
        { id: 'back', label: "⬅️ Main Menu", action: 'switch_flow', target: 'main', styleClass: 'btnBack' },
      ],
      flow_booking: [
        { id: 'my_books', label: "📅 My Bookings", action: 'fetch_bookings' },
        { id: 'cheap', label: "📉 Cheap Trips (<500)", action: 'navigate', url: '/trips?maxPrice=500' },
        { id: 'weekend', label: "⚡ Weekend Trip", action: 'navigate', url: '/trips?duration=2' },
        { id: 'guide', label: "❓ How to book?", action: 'start_guide' },
        { id: 'back', label: "⬅️ Main Menu", action: 'switch_flow', target: 'main', styleClass: 'btnBack' },
      ],
      flow_cancel: [
        { id: 'policy', label: "📜 Refund Policy", action: 'show_policy', needsFeedback: true },
        { id: 'how_cancel', label: "🚫 How to cancel?", action: 'simple_response', text: "Go to Profile > My Bookings > Select Trip > Click 'Cancel'. Refund is automatic.", needsFeedback: true },
        { id: 'back', label: "⬅️ Main Menu", action: 'switch_flow', target: 'main', styleClass: 'btnBack' },
      ],
      flow_account: [
        { id: 'login', label: "🔑 Login Issue", action: 'simple_response', text: "Ensure your email is correct. Reset password if needed.", needsFeedback: true },
        { id: 'support', label: "📞 Contact Support", action: 'simple_response', text: "Email: support@expedis.com\nPhone: +48 123 456 789" },
        { id: 'back', label: "⬅️ Main Menu", action: 'switch_flow', target: 'main', styleClass: 'btnBack' },
      ],
      flow_general: [
        { id: 'about', label: "🌍 About Expedis", action: 'navigate', url: '/about' },
        { id: 'back', label: "⬅️ Main Menu", action: 'switch_flow', target: 'main', styleClass: 'btnBack' },
      ]
    },
    keywords: [
      { keys: ["balance", "wallet", "money"], action: 'fetch_wallet' },
      { keys: ["book", "reservation", "history"], action: 'fetch_bookings' },
      { keys: ["cancel", "refund"], action: 'show_policy', needsFeedback: true },
      { keys: ["cheap", "budget"], action: 'navigate', url: '/trips?maxPrice=500', response: "Checking budget options..." },
    ]
  },
  pl: {
    greeting: "Cześć! 👋 Jestem Expedis Bot. Wybierz temat:",
    greeting_personal: "Cześć, {name}! 👋 Miło Cię widzieć. Planujesz nową podróż? ✈️",
    placeholder: "Wpisz pytanie...",
    unknown: "Spróbuj wybrać kategorię z menu powyżej! 👆",
    login_req: "Zaloguj się, aby uzyskać dostęp. 🔒",
    wallet_msg: "💰 Saldo:",
    held_msg: "Zablokowane:",
    no_bookings: "Brak aktywnych rezerwacji. ✈️",
    booking_msg: "Ostatnia rezerwacja:",
    end_chat_confirm: "Zakończyć czat?",
    guide_intro: "Poradnik rezerwacji:",
    guide_steps: [
      "1️⃣ Wybierz wycieczkę w 'All Offers'.",
      "2️⃣ Kliknij 'Book Now'.",
      "3️⃣ Wybierz datę i zapłać. Gotowe! 🎉"
    ],
    cancel_policy: "Anulacja do 48h przed wyjazdem jest darmowa. Zwrot na portfel. 🛡️",
    applying_filter: "Filtruję oferty... 🚀",
    feedback_ask: "Czy to było pomocne?",
    feedback_thanks: "Dzięki za opinię! 🙏",

    easter_eggs: {
      money: [
        "Jak znajdziesz zniżkę >50%, daj znać. Będę w szoku. 🤯",
        "Moje algorytmy podpowiadają: dziś dobry dzień, żeby nie przepłacać 😉",
        "Płatność zaakceptowana! (Żartuję, jestem tylko botem, ale wierzę w Ciebie 💸)"
      ],
      travel: [
        "Mówią, że podróże kształcą. Mnie zaprogramowali, więc nie wiem. 🤖",
        "W następnym życiu chcę być bagażem podręcznym. Przynajmniej gdzieś polecę. 😔✈️",
        "Nie jestem kotem, ale mruczę jak widzę tani bilet. 🐈"
      ],
      general: [
        "Jestem botem, ale nawet ja marzę o wakacjach. Hiszpania. Plaża. Stabilne Wi-Fi. 😌",
        "Pracuję na 110%. Programiści obiecali dodać mi sen w następnej aktualizacji...",
        "Sekretna rada: w pełnię księżyca zniżki są podobno większe. Ale ciii... 🌕😉",
        "Widziałem w kodzie zniżkę, którą przede mną ukryli. Sprytni ci programiści. 🤫"
      ]
    },

    flows: {
      main: [
        { id: 'cat_payment', label: "💸 Płatności", action: 'switch_flow', target: 'flow_payment', styleClass: 'btnPayment' },
        { id: 'cat_booking', label: "✈️ Rezerwacje", action: 'switch_flow', target: 'flow_booking', styleClass: 'btnBooking' },
        { id: 'cat_cancel', label: "❌ Anulacje", action: 'switch_flow', target: 'flow_cancel', styleClass: 'btnCancel' },
        { id: 'cat_account', label: "🔐 Konto", action: 'switch_flow', target: 'flow_account', styleClass: 'btnAccount' },
        { id: 'cat_general', label: "🧭 Ogólne", action: 'switch_flow', target: 'flow_general', styleClass: 'btnGeneral' },
      ],
      flow_payment: [
        { id: 'wallet', label: "💰 Sprawdź saldo", action: 'fetch_wallet' },
        { id: 'topup', label: "💵 Jak doładować?", action: 'simple_response', text: "Profil > Portfel > 'Doładuj'. Wpisz kwotę i czekaj na akceptację.", needsFeedback: true },
        { id: 'safe', label: "🛡️ Czy to bezpieczne?", action: 'simple_response', text: "Tak! Używamy szyfrowanych połączeń.", needsFeedback: true },
        { id: 'back', label: "⬅️ Menu główne", action: 'switch_flow', target: 'main', styleClass: 'btnBack' },
      ],
      flow_booking: [
        { id: 'my_books', label: "📅 Moje rezerwacje", action: 'fetch_bookings' },
        { id: 'cheap', label: "📉 Tanie (<500)", action: 'navigate', url: '/trips?maxPrice=500' },
        { id: 'weekend', label: "⚡ Weekend", action: 'navigate', url: '/trips?duration=2' },
        { id: 'guide', label: "❓ Jak rezerwować?", action: 'start_guide' },
        { id: 'back', label: "⬅️ Menu główne", action: 'switch_flow', target: 'main', styleClass: 'btnBack' },
      ],
      flow_cancel: [
        { id: 'policy', label: "📜 Zasady zwrotów", action: 'show_policy', needsFeedback: true },
        { id: 'how_cancel', label: "🚫 Jak anulować?", action: 'simple_response', text: "Profil > Rezerwacje > Wybierz > 'Anuluj'. Zwrot jest automatyczny.", needsFeedback: true },
        { id: 'back', label: "⬅️ Menu główne", action: 'switch_flow', target: 'main', styleClass: 'btnBack' },
      ],
      flow_account: [
        { id: 'login', label: "🔑 Problem z logowaniem", action: 'simple_response', text: "Sprawdź email. W razie potrzeby zresetuj hasło.", needsFeedback: true },
        { id: 'support', label: "📞 Wsparcie", action: 'simple_response', text: "Email: support@expedis.com\nTelefon: +48 123 456 789" },
        { id: 'back', label: "⬅️ Menu główne", action: 'switch_flow', target: 'main', styleClass: 'btnBack' },
      ],
      flow_general: [
        { id: 'about', label: "🌍 O Expedis", action: 'navigate', url: '/about' },
        { id: 'back', label: "⬅️ Menu główne", action: 'switch_flow', target: 'main', styleClass: 'btnBack' },
      ]
    },
    keywords: [
      { keys: ["saldo", "kasa"], action: 'fetch_wallet' },
      { keys: ["rezerwacj", "bilet"], action: 'fetch_bookings' },
      { keys: ["anuluj", "zwrot"], action: 'show_policy', needsFeedback: true },
      { keys: ["tanie", "budżet"], action: 'navigate', url: '/trips?maxPrice=500', response: "Szukam tanich opcji..." },
    ]
  }
};

const ChatBot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentFlow, setCurrentFlow] = useState('main');
  const messagesEndRef = useRef(null);

  const msgCountRef = useRef(0);
  const nextEggThresholdRef = useRef(Math.floor(Math.random() * 5) + 5); 

  const [lang, setLang] = useState(() => localStorage.getItem("chat_lang") || 'en');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chat_messages");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem("chat_messages", JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem("chat_lang", lang); }, [lang]);

  useEffect(() => {
    if (messages.length === 0) {
        let greetingText = CHAT_CONTENT[lang].greeting;
        if (user && user.name) {
            greetingText = CHAT_CONTENT[lang].greeting_personal.replace("{name}", user.name);
        }
        setMessages([{ id: Date.now(), text: greetingText, sender: "bot" }]);
    }
  }, [lang, user]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isOpen, isTyping]);

  const toggleChat = () => setIsOpen(!isOpen);
  
  const addMessage = (text, sender, isFeedback = false) => {
    setMessages((prev) => [...prev, { id: Date.now(), text, sender, isFeedback }]);
  };

  const handleFeedback = async (msgId, vote) => {
    console.log(`Feedback collected: ${vote}`);
    const targetMessage = messages.find(m => m.id === msgId);
    const botText = targetMessage ? targetMessage.text : "Unknown";

    try {
        await fetch(`${API_URL}/api/chat/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vote, botMessage: botText })
        });
    } catch (err) { console.error("Feedback error", err); }

    setMessages(prev => prev.map(msg => {
        if (msg.id === msgId) {
            return { ...msg, text: CHAT_CONTENT[lang].feedback_thanks, isFeedback: false };
        }
        return msg;
    }));
  };

  const changeLanguage = (newLang) => {
    setLang(newLang);
    setCurrentFlow('main');
  };

  const endChat = () => {
    if(window.confirm(CHAT_CONTENT[lang].end_chat_confirm || "End chat?")) {
        let greetingText = CHAT_CONTENT[lang].greeting;
        if (user && user.name) {
            greetingText = CHAT_CONTENT[lang].greeting_personal.replace("{name}", user.name);
        }
        setMessages([{ id: Date.now(), text: greetingText, sender: "bot" }]);
        setCurrentFlow('main');
        msgCountRef.current = 0; 
        setIsOpen(false);
    }
  };

  const t = (key) => CHAT_CONTENT[lang][key]; 

  const getEasterEgg = () => {
    const eggs = CHAT_CONTENT[lang].easter_eggs;
    let categoryEggs = eggs.general;

    if (currentFlow.includes('payment')) categoryEggs = eggs.money;
    else if (currentFlow.includes('booking')) categoryEggs = eggs.travel;
    
    return categoryEggs[Math.floor(Math.random() * categoryEggs.length)];
  };

  const simulateBotResponse = (text, delay = 0, needsFeedback = false) => {
    setIsTyping(true);
    const calcDelay = delay || Math.min(Math.max(text.length * 20, 600), 2500);
    
    setTimeout(() => {
      setIsTyping(false);
      
      setMessages((prev) => {
          msgCountRef.current += 1;
          const newMsgs = [...prev, { id: Date.now(), text, sender: "bot", isFeedback: false }];
          return newMsgs;
      });

      if (msgCountRef.current >= nextEggThresholdRef.current) {
          const eggText = getEasterEgg();
          setTimeout(() => {
              addMessage(eggText, "bot"); 
          }, 800); 
          
          msgCountRef.current = 0;
          nextEggThresholdRef.current = Math.floor(Math.random() * 5) + 5; 
      } else if (needsFeedback) {
          setTimeout(() => {
              addMessage(t('feedback_ask'), "bot", true);
          }, 600);
      }

    }, calcDelay);
  };

  const fetchWalletData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { simulateBotResponse(t('login_req')); return; }
    setIsTyping(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      simulateBotResponse(`${t('wallet_msg')} **${data.balance?.toFixed(2)} PLN**\n(${t('held_msg')} ${data.balance_held?.toFixed(2)} PLN)`);
    } catch { simulateBotResponse("Error."); }
  };

  const fetchBookingsData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { simulateBotResponse(t('login_req')); return; }
    setIsTyping(true);
    try {
      const res = await fetch(`${API_URL}/api/bookings/my-bookings`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.length === 0) { simulateBotResponse(t('no_bookings')); } 
      else {
        const latest = data[0];
        simulateBotResponse(`${t('booking_msg')}\n📍 **${latest.offer?.title}**\n📅 ${new Date(latest.selectedDate).toLocaleDateString()}\n✅ ${latest.status}`);
      }
    } catch { simulateBotResponse("Error."); }
  };

  const executeAction = (actionType, payload, needsFeedback = false) => {
    switch (actionType) {
      case 'switch_flow': setCurrentFlow(payload); break;
      case 'navigate':
        simulateBotResponse(t('applying_filter'));
        setTimeout(() => { navigate(payload); if (window.innerWidth < 768) setIsOpen(false); }, 1500);
        break;
      case 'fetch_wallet': fetchWalletData(); break;
      case 'fetch_bookings': fetchBookingsData(); break;
      case 'start_guide':
        setIsTyping(true);
        setTimeout(() => { setIsTyping(false); addMessage(t('guide_intro'), "bot"); }, 1000);
        t('guide_steps').forEach((step, i) => {
            setTimeout(() => { setIsTyping(true); }, 1100 + (i * 2000));
            setTimeout(() => { setIsTyping(false); addMessage(step, "bot"); }, 2500 + (i * 2000));
        });
        msgCountRef.current += 3; 
        break;
      case 'show_policy': simulateBotResponse(t('cancel_policy'), 0, true); break;
      case 'simple_response': simulateBotResponse(payload, 0, needsFeedback); break;
      default: break;
    }
  };

  const handleOptionClick = (option) => {
    if (option.id !== 'back') addMessage(option.label, "user");
    
    if (option.action === 'navigate') executeAction('navigate', option.url);
    else if (option.action === 'switch_flow') executeAction('switch_flow', option.target);
    else if (option.action === 'fetch_wallet') executeAction('fetch_wallet');
    else if (option.action === 'fetch_bookings') executeAction('fetch_bookings');
    else if (option.action === 'start_guide') executeAction('start_guide');
    else if (option.action === 'show_policy') executeAction('show_policy');
    else if (option.action === 'simple_response') executeAction('simple_response', option.text, option.needsFeedback);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    addMessage(text, "user");
    setInputValue("");

    setTimeout(() => {
      const lowerText = text.toLowerCase();
      const match = CHAT_CONTENT[lang].keywords.find(k => k.keys.some(word => lowerText.includes(word)));
      if (match) {
        if (match.response) simulateBotResponse(match.response, 0, match.needsFeedback);
        executeAction(match.action, match.url, match.needsFeedback);
      } else {
        simulateBotResponse(t('unknown'));
      }
    }, 500);
  };

  const optionsContainerClass = currentFlow === 'main' ? styles.categoryGrid : styles.listGrid;

  return (
    <div className={styles.chatContainer}>
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.headerInfo}>
              <div className={styles.botAvatar}><IconBotFace /></div>
              <span>Expedis Assistant</span>
            </div>
            <div style={{display: 'flex', gap: '5px', marginLeft: 'auto', marginRight: '5px', alignItems: 'center'}}>
                <button onClick={endChat} className={styles.clearBtn} title="End chat"><IconPower/></button>
                <button onClick={() => changeLanguage('en')} style={{opacity: lang === 'en' ? 1 : 0.5, border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0 2px'}}>🇬🇧</button>
                <button onClick={() => changeLanguage('pl')} style={{opacity: lang === 'pl' ? 1 : 0.5, border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0 2px'}}>🇵🇱</button>
            </div>
            <button onClick={toggleChat} className={styles.closeBtn}><IconClose /></button>
          </div>

          <div className={styles.messagesArea}>
            {messages.map((msg, index) => (
              <div key={`${msg.id}-${index}`} className={`${styles.message} ${msg.sender === "bot" ? styles.botMessage : styles.userMessage} ${msg.isFeedback ? styles.feedbackMessage : ''}`}>
                {msg.text.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                
                {msg.isFeedback && (
                    <div className={styles.feedbackButtons}>
                        <button onClick={() => handleFeedback(msg.id, 'up')} className={styles.feedbackBtn}>👍</button>
                        <button onClick={() => handleFeedback(msg.id, 'down')} className={styles.feedbackBtn}>👎</button>
                    </div>
                )}
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
            <div className={optionsContainerClass}>
              {CHAT_CONTENT[lang].flows[currentFlow].map((option) => (
                <button 
                  key={option.id} 
                  className={`${styles.optionBtn} ${option.styleClass ? styles[option.styleClass] : styles.btnGeneral}`} 
                  onClick={() => handleOptionClick(option)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <form className={styles.inputArea} onSubmit={handleSendMessage}>
            <input type="text" className={styles.chatInput} placeholder={t('placeholder')} value={inputValue} onChange={(e) => setInputValue(e.target.value)} disabled={isTyping} />
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