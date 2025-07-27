import React, { useState, useRef, useEffect } from 'react';

const VoiceOrder = ({ user }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processedOrder, setProcessedOrder] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'hi-IN'; // Hindi language

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          processVoiceOrder(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setProcessedOrder(null);
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const processVoiceOrder = async (voiceText) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/process-voice-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: voiceText,
          userId: user.uid
        }),
      });
      
      const data = await response.json();
      setProcessedOrder(data);
    } catch (error) {
      console.error('Error processing voice order:', error);
    }
  };

  const confirmOrder = async () => {
    if (!processedOrder) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...processedOrder,
          vendorId: user.uid,
          status: 'pending',
          createdAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        alert('Voice order placed successfully!');
        setTranscript('');
        setProcessedOrder(null);
      }
    } catch (error) {
      console.error('Error placing voice order:', error);
      alert('Failed to place order');
    }
  };

  if (!isSupported) {
    return (
      <div className="voice-order">
        <div className="voice-not-supported">
          <h2>🎤 Voice Ordering</h2>
          <p>Sorry, your browser doesn't support voice recognition. Please use the regular ordering method.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-order">
      <div className="voice-header">
        <h2>🎤 Voice Order</h2>
        <p>Speak your order in Hindi or English. Example: "मुझे 2 किलो प्याज और 1 किलो आलू चाहिए"</p>
      </div>

      <div className="voice-controls">
        <button 
          className={`voice-btn ${isListening ? 'listening' : ''}`}
          onClick={isListening ? stopListening : startListening}
        >
          {isListening ? (
            <>
              <span className="mic-animation">🎤</span>
              Stop Listening
            </>
          ) : (
            <>
              🎤 Start Voice Order
            </>
          )}
        </button>

        {isListening && (
          <div className="listening-indicator">
            <div className="sound-waves">
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="wave"></div>
            </div>
            <p>Listening... Speak now</p>
          </div>
        )}
      </div>

      {transcript && (
        <div className="transcript-section">
          <h3>What you said:</h3>
          <div className="transcript-box">{transcript}</div>
        </div>
      )}

      {processedOrder && (
        <div className="processed-order">
          <h3>Processed Order:</h3>
          <div className="order-items">
            {processedOrder.items.map((item, index) => (
              <div key={index} className="order-item">
                <span>{item.name}</span>
                <span>{item.quantity} {item.unit}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="order-total">
            <strong>Total: ₹{processedOrder.totalAmount}</strong>
          </div>
          <div className="order-actions">
            <button className="confirm-btn" onClick={confirmOrder}>
              Confirm Order
            </button>
            <button className="cancel-btn" onClick={() => setProcessedOrder(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="voice-tips">
        <h4>💡 Voice Order Tips:</h4>
        <ul>
          <li>Speak clearly and at normal speed</li>
          <li>Mention quantity and item name (e.g., "2 kilo onions")</li>
          <li>You can speak in Hindi, English, or mix both</li>
          <li>Wait for processing after you finish speaking</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceOrder;