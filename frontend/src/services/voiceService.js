class VoiceService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isSupported = false;
    this.language = 'hi-IN'; // Default to Hindi (India)
    this.onResult = null;
    this.onError = null;
    this.onStart = null;
    this.onEnd = null;

    this.init();
  }

  init() {
    // Check for browser support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      this.isSupported = true;
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }

  setupRecognition() {
    if (!this.recognition) return;

    // Configuration
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.language;
    this.recognition.maxAlternatives = 3;

    // Event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onStart) this.onStart();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd) this.onEnd();
    };

    this.recognition.onerror = (event) => {
      const error = this.handleError(event.error);
      if (this.onError) this.onError(error);
    };

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (this.onResult) {
        this.onResult({
          finalTranscript: finalTranscript.trim(),
          interimTranscript: interimTranscript.trim(),
          isFinal: finalTranscript.length > 0
        });
      }
    };
  }

  handleError(error) {
    const errorMessages = {
      'no-speech': 'No speech was detected. Please try again.',
      'audio-capture': 'Audio capture failed. Please check your microphone.',
      'not-allowed': 'Microphone access was denied. Please allow microphone access.',
      'network': 'Network error occurred. Please check your internet connection.',
      'service-not-allowed': 'Speech recognition service is not allowed.',
      'bad-grammar': 'Grammar error in speech recognition.',
      'language-not-supported': 'Language not supported.',
      'aborted': 'Speech recognition was aborted.'
    };

    return {
      code: error,
      message: errorMessages[error] || `Speech recognition error: ${error}`
    };
  }

  startListening(options = {}) {
    if (!this.isSupported) {
      throw new Error('Speech recognition is not supported in this browser');
    }

    if (this.isListening) {
      this.stopListening();
    }

    // Apply options
    if (options.language) {
      this.setLanguage(options.language);
    }

    if (options.continuous !== undefined) {
      this.recognition.continuous = options.continuous;
    }

    if (options.interimResults !== undefined) {
      this.recognition.interimResults = options.interimResults;
    }

    try {
      this.recognition.start();
    } catch (error) {
      throw new Error(`Failed to start speech recognition: ${error.message}`);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  setLanguage(language) {
    this.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  // Event handler setters
  onStartListening(callback) {
    this.onStart = callback;
  }

  onStopListening(callback) {
    this.onEnd = callback;
  }

  onSpeechResult(callback) {
    this.onResult = callback;
  }

  onSpeechError(callback) {
    this.onError = callback;
  }

  // Utility methods
  isSupported() {
    return this.isSupported;
  }

  getCurrentLanguage() {
    return this.language;
  }

  isCurrentlyListening() {
    return this.isListening;
  }

  // Process voice order using NLP
  async processVoiceOrder(transcript, userId) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/process-voice-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          transcript,
          userId,
          language: this.language
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process voice order');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Voice order processing failed: ${error.message}`);
    }
  }

  // Extract items from Hindi/English mixed text
  extractOrderItems(transcript) {
    const cleanText = transcript.toLowerCase().trim();
    const items = [];

    // Common patterns for quantities and items
    const patterns = [
      // Hindi patterns
      /(\d+)\s*(किलो|kg|kilo)\s*([^\d,]+?)(?=\s*(?:\d+|और|,|$))/gi,
      /(\d+)\s*(ग्राम|gram|gm)\s*([^\d,]+?)(?=\s*(?:\d+|और|,|$))/gi,
      /(\d+)\s*(लीटर|liter|litre)\s*([^\d,]+?)(?=\s*(?:\d+|और|,|$))/gi,

      // English patterns
      /(\d+)\s*(kg|kilo|kilogram)\s*([^\d,]+?)(?=\s*(?:\d+|and|,|$))/gi,
      /(\d+)\s*(gram|gm|g)\s*([^\d,]+?)(?=\s*(?:\d+|and|,|$))/gi,
      /(\d+)\s*(liter|litre|l)\s*([^\d,]+?)(?=\s*(?:\d+|and|,|$))/gi,
      /(\d+)\s*(piece|pieces|pc)\s*([^\d,]+?)(?=\s*(?:\d+|and|,|$))/gi
    ];

    patterns.forEach(pattern => {
      const matches = [...cleanText.matchAll(pattern)];
      matches.forEach(match => {
        const quantity = parseInt(match[1]);
        const unit = this.normalizeUnit(match[2]);
        const itemName = this.normalizeItemName(match[3]);

        if (quantity > 0 && itemName) {
          items.push({
            name: itemName,
            quantity,
            unit
          });
        }
      });
    });

    return this.deduplicateItems(items);
  }

  normalizeUnit(unit) {
    const unitMappings = {
      'किलो': 'kg',
      'kilo': 'kg',
      'kilogram': 'kg',
      'ग्राम': 'gram',
      'gm': 'gram',
      'g': 'gram',
      'लीटर': 'liter',
      'litre': 'liter',
      'l': 'liter',
      'piece': 'piece',
      'pieces': 'piece',
      'pc': 'piece'
    };

    return unitMappings[unit.toLowerCase()] || unit.toLowerCase();
  }

  normalizeItemName(itemName) {
    const cleanName = itemName.trim();
    
    // Hindi to English mappings for common items
    const itemMappings = {
      'प्याज': 'onion',
      'आलू': 'potato',
      'टमाटर': 'tomato',
      'हरी मिर्च': 'green chili',
      'धनिया': 'coriander',
      'अदरक': 'ginger',
      'लहसुन': 'garlic',
      'चावल': 'rice',
      'दाल': 'lentils',
      'तेल': 'oil',
      'नमक': 'salt',
      'चीनी': 'sugar',
      'आटा': 'flour',
      'दूध': 'milk',
      'दही': 'curd'
    };

    return itemMappings[cleanName] || cleanName;
  }

  deduplicateItems(items) {
    const uniqueItems = {};
    
    items.forEach(item => {
      const key = `${item.name}_${item.unit}`;
      if (uniqueItems[key]) {
        uniqueItems[key].quantity += item.quantity;
      } else {
        uniqueItems[key] = { ...item };
      }
    });

    return Object.values(uniqueItems);
  }

  // Text-to-speech for feedback
  speak(text, options = {}) {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || this.language;
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      window.speechSynthesis.speak(utterance);
    }
  }

  // Get available voices
  getAvailableVoices() {
    if ('speechSynthesis' in window) {
      return window.speechSynthesis.getVoices();
    }
    return [];
  }

  // Check microphone permissions
  async checkMicrophonePermission() {
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'microphone' });
        return permission.state;
      }
      return 'unknown';
    } catch (error) {
      console.warn('Could not check microphone permission:', error);
      return 'unknown';
    }
  }

  // Request microphone access
  async requestMicrophoneAccess() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately as we just wanted to request permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone access denied:', error);
      return false;
    }
  }
}

// Create singleton instance
const voiceService = new VoiceService();

export default voiceService;