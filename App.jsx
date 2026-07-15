App// 🎓 SHIKSHAK+ AI - PROFESSIONAL VERSION
// Complete Virtual Classroom with Animated Avatar, Voice, Whiteboard
// Production-Ready: Deploy to Vercel

import React, { useState, useRef, useEffect, useContext, createContext } from 'react';
import {
  Mic, MicOff, Send, BookOpen, Award, Clock, LogOut, Volume2, RotateCcw,
  Home, Menu, X, ChevronRight, Check, AlertCircle, Zap, Users, Target
} from 'lucide-react';

const API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = process.env.REACT_APP_CLAUDE_API_KEY || '';

// ========== AUTH CONTEXT ==========
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData) => {
    const token = 'token_' + Math.random().toString(36).substring(7);
    setToken(token);
    setUser(userData);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ========== CLAUDE API CALL ==========
async function callClaudeAPI(messages, systemPrompt) {
  if (!CLAUDE_API_KEY) {
    return { error: 'API Key not configured. Set REACT_APP_CLAUDE_API_KEY environment variable.' };
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1500,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error?.message || 'API Error' };
    }

    const data = await response.json();
    return { content: data.content[0].text };
  } catch (err) {
    return { error: err.message };
  }
}

// ========== ANIMATED AVATAR COMPONENT ==========
function AnimatedTeacher({ isSpeaking, isListening, emotion = 'neutral' }) {
  return (
    <svg width="300" height="350" viewBox="0 0 300 350" className="mx-auto">
      {/* Body */}
      <ellipse cx="150" cy="200" rx="40" ry="50" fill="#E8B4A0" />

      {/* Arms */}
      <line x1="110" y1="180" x2="60" y2="220" stroke="#E8B4A0" strokeWidth="12" strokeLinecap="round" />
      <line x1="190" y1="180" x2="240" y2="220" stroke="#E8B4A0" strokeWidth="12" strokeLinecap="round" />

      {/* Hands */}
      <circle cx="60" cy="220" r="15" fill="#E8B4A0" />
      <circle cx="240" cy="220" r="15" fill="#E8B4A0" />

      {/* Neck */}
      <rect x="140" y="160" width="20" height="15" fill="#E8B4A0" />

      {/* Head */}
      <circle cx="150" cy="130" r="35" fill="#E8B4A0" />

      {/* Hair */}
      <path d="M 115 110 Q 150 70 185 110" fill="#1a1a1a" />

      {/* Face */}
      <circle cx="150" cy="130" r="33" fill="none" stroke="#D4A574" strokeWidth="2" />

      {/* Eyes */}
      <circle cx="140" cy="120" r="6" fill="#1a1a1a" />
      <circle cx="160" cy="120" r="6" fill="#1a1a1a" />

      {/* Eye shine */}
      {!isListening && (
        <>
          <circle cx="142" cy="118" r="2" fill="white" />
          <circle cx="162" cy="118" r="2" fill="white" />
        </>
      )}

      {/* Mouth */}
      {isSpeaking ? (
        <ellipse cx="150" cy="145" rx="12" ry="16" fill="#FF6B6B" />
      ) : emotion === 'happy' ? (
        <path d="M 140 142 Q 150 150 160 142" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <line x1="140" y1="142" x2="160" y2="142" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
      )}

      {/* Eyebrows */}
      {emotion === 'happy' ? (
        <>
          <path d="M 130 110 Q 140 105 150 108" stroke="#8B6F47" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 150 108 Q 160 105 170 110" stroke="#8B6F47" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <line x1="130" y1="110" x2="150" y2="108" stroke="#8B6F47" strokeWidth="2" strokeLinecap="round" />
          <line x1="150" y1="108" x2="170" y2="110" stroke="#8B6F47" strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {/* Listening indicator */}
      {isListening && (
        <>
          <circle cx="150" cy="130" r="40" fill="none" stroke="#4F46E5" strokeWidth="2" opacity="0.5" />
          <circle cx="150" cy="130" r="50" fill="none" stroke="#4F46E5" strokeWidth="1" opacity="0.3" />
        </>
      )}

      {/* Speaking indicator */}
      {isSpeaking && (
        <>
          <circle cx="150" cy="130" r="45" fill="none" stroke="#22C55E" strokeWidth="2" opacity="0.6" />
        </>
      )}

      {/* Shirt */}
      <rect x="120" y="210" width="60" height="40" rx="5" fill="#003366" />
      <line x1="150" y1="210" x2="150" y2="250" stroke="#002244" strokeWidth="1" />

      {/* Buttons */}
      <circle cx="150" cy="220" r="3" fill="#FFD700" />
      <circle cx="150" cy="235" r="3" fill="#FFD700" />
    </svg>
  );
}

// ========== WHITEBOARD COMPONENT ==========
function Whiteboard({ content, lesson }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth > 768 ? 700 : 300;
    canvas.height = 400;

    // Background
    ctx.fillStyle = '#FFFEF5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Frame
    ctx.strokeStyle = '#A0826D';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    // Content
    if (content || lesson) {
      ctx.fillStyle = '#000';
      ctx.font = 'bold 18px Arial';
      ctx.textBaseline = 'top';

      const text = content || lesson?.whiteboardContent || '';
      const lines = text.split('\n').slice(0, 15);

      lines.forEach((line, idx) => {
        if (line.trim()) {
          ctx.fillText(line, 25, 30 + idx * 25);
        }
      });

      // Formulas styling
      if (lesson?.formulas && lesson.formulas.length > 0) {
        ctx.fillStyle = '#0066CC';
        ctx.font = 'bold 16px Courier';
        lesson.formulas.forEach((formula, idx) => {
          ctx.fillText(formula, 25, 250 + idx * 30);
        });
      }
    }
  }, [content, lesson]);

  return (
    <div className="bg-gradient-to-b from-yellow-100 to-orange-50 rounded-lg shadow-2xl p-4 border-8 border-amber-900">
      <div className="text-center text-sm font-bold text-gray-700 mb-2">📝 Digital Board</div>
      <canvas
        ref={canvasRef}
        className="w-full border-4 border-amber-800 rounded bg-yellow-50"
      />
    </div>
  );
}

// ========== VOICE INPUT ==========
function VoiceInput({ onTranscript, isListening, setIsListening }) {
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'hi-IN';

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + ' ';
      }
      if (event.results[event.results.length - 1].isFinal) {
        onTranscript(transcript.trim());
      }
    };
    recognitionRef.current.onend = () => setIsListening(false);
  }, [onTranscript, setIsListening]);

  const toggle = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  return (
    <button
      onClick={toggle}
      className={`p-5 rounded-full shadow-2xl transition transform hover:scale-110 ${
        isListening
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {isListening ? <MicOff size={28} /> : <Mic size={28} />}
    </button>
  );
}

// ========== LOGIN PAGE ==========
function LoginPage({ onLoginSuccess }) {
  const [step, setStep] = useState('login');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [classLevel, setClassLevel] = useState('8');
  const [board, setBoard] = useState('CBSE');
  const [loading, setLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const { login } = useContext(AuthContext);

  const sendOTP = async () => {
    if (!email) return;
    setLoading(true);
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(otp);
    alert(`OTP for testing: ${otp}`);
    setStep('otp');
    setLoading(false);
  };

  const verifyOTP = () => {
    if (otp !== generatedOtp) {
      alert('Wrong OTP');
      return;
    }
    setStep('signup');
  };

  const completeSignup = () => {
    if (!name) return;
    login({
      email, name,
      classLevel: parseInt(classLevel),
      board, language: 'hi'
    });
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">🎓</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Shikshak+ AI
          </h1>
          <p className="text-gray-600 mt-3">Your Personal AI School</p>
        </div>

        {step === 'login' && (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="📧 Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={sendOTP}
              disabled={!email || loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '⏳...' : '📤 Send OTP'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <p className="text-center text-gray-600">OTP sent to {email}</p>
            <input
              type="text"
              placeholder="🔐 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.slice(0, 6))}
              maxLength="6"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-center text-2xl tracking-widest font-bold"
            />
            <button
              onClick={verifyOTP}
              disabled={otp.length !== 6}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
            >
              ✅ Verify
            </button>
          </div>
        )}

        {step === 'signup' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="👤 Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <select
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((cls) => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
            <select
              value={board}
              onChange={(e) => setBoard(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="CBSE">📚 CBSE</option>
              <option value="State">🏛️ State</option>
            </select>
            <button
              onClick={completeSignup}
              disabled={!name}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50"
            >
              🚀 Start Learning
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== MAIN CLASSROOM ==========
function Classroom({ user, logout }) {
  const [currentPage, setCurrentPage] = useState('classroom');
  const [topic, setTopic] = useState('');
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('progress');
    return saved ? JSON.parse(saved) : { lessons: [], quizzes: [] };
  });

  const getLesson = async (topicText) => {
    if (!topicText) return;
    setLoading(true);
    setLesson(null);

    const systemPrompt = `You are Mr. Sharma, a professional AI teacher for Indian students in Class ${user.classLevel}.

PERSONALITY:
- Warm, encouraging, and patient
- Explains in simple Hindi/Hinglish
- Uses real-world examples
- Never gets frustrated
- Motivates students

RESPONSE FORMAT - RETURN ONLY VALID JSON:
{
  "topic": "${topicText}",
  "greeting": "Good morning! Today we'll learn about...",
  "explanation": "3-4 paragraph clear explanation",
  "keyPoints": ["point1", "point2", "point3"],
  "formulas": ["formula1", "formula2"],
  "examples": ["example1", "example2"],
  "whiteboardContent": "Content for whiteboard",
  "practiceQuestion": "Practice question for student"
}`;

    const result = await callClaudeAPI(
      [{ role: 'user', content: `Teach me about: ${topicText}` }],
      systemPrompt
    );

    if (result.error) {
      alert('Error: ' + result.error);
      setLoading(false);
      return;
    }

    try {
      const lessonData = JSON.parse(result.content);
      setLesson(lessonData);
      setProgress(prev => ({
        ...prev,
        lessons: [...new Set([...prev.lessons, topicText])]
      }));
      localStorage.setItem('progress', JSON.stringify(progress));
      setTimeout(() => speakText(lessonData.explanation), 800);
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setLoading(false);
  };

  const handleVoiceInput = (transcript) => {
    if (transcript.length > 3) {
      getLesson(transcript);
    }
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const generateQuiz = async () => {
    if (!lesson) return;
    setLoading(true);

    const result = await callClaudeAPI(
      [{ role: 'user', content: `Generate 5 MCQ questions for Class ${user.classLevel} about ${lesson.topic}` }],
      `Generate quiz ONLY in this JSON format:
{"questions": [{"id": 1, "question": "?", "options": ["A) ", "B) ", "C) ", "D) "], "correct": "A"}]}`
    );

    if (result.error) {
      alert('Error: ' + result.error);
    } else {
      try {
        const quizData = JSON.parse(result.content);
        setQuiz(quizData);
        setQuizAnswers({});
      } catch (e) {
        alert('Error parsing quiz');
      }
    }
    setLoading(false);
  };

  const submitQuiz = () => {
    let score = 0;
    quiz.questions.forEach(q => {
      if (quizAnswers[q.id] === q.correct) score++;
    });
    const results = {
      score,
      total: quiz.questions.length,
      percentage: Math.round((score / quiz.questions.length) * 100),
      topic: lesson.topic
    };
    setQuizResults(results);
    setProgress(prev => ({
      ...prev,
      quizzes: [...prev.quizzes, results]
    }));
    localStorage.setItem('progress', JSON.stringify(progress));
  };

  const ncertTopics = [
    '🌱 Photosynthesis',
    '✖️ Quadratic Equations',
    '🌍 Physical Features of India',
    '⚡ Electricity',
    '🔬 Cell Division',
    '📐 Triangles',
    '📚 Nouns in English',
    '🎨 Renaissance',
    '💧 Water Cycle',
    '🧬 Heredity'
  ];

  // ===== PAGE: CLASSROOM =====
  if (currentPage === 'classroom' && !lesson && !quiz && !quizResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">🎓 Shikshak+ AI Classroom</h1>
              <p className="text-blue-100">Class {user.classLevel} • {user.board}</p>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-white"
            >
              {sidebarOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
            <div className="hidden md:flex gap-3">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-50"
              >
                📊 Dashboard
              </button>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
          {/* Main Classroom */}
          <div className="md:col-span-2 space-y-6">
            {/* Teacher Area */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-blue-200">
              <div className="text-center mb-4">
                <p className="text-lg font-semibold text-gray-700">Mr. Sharma - Your AI Teacher</p>
              </div>
              <AnimatedTeacher isSpeaking={isSpeaking} isListening={isListening} />
              <p className="text-center mt-4 text-gray-600 font-semibold">
                {isListening && '🎤 I\'m listening...'}
                {isSpeaking && '🔊 I\'m speaking...'}
                {!isListening && !isSpeaking && 'Ready to teach! Ask me anything.'}
              </p>
            </div>

            {/* Input Area */}
            <div className="bg-white roun
