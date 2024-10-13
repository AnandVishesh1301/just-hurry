"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const API_KEY = process.env.NEXT_PUBLIC_OPENAI_KEY;
  console.log("open ai key: ", API_KEY);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      sender: "user",
      direction: "outgoing"
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions", 
        {
          model: "gpt-3.5-turbo",
          messages: [{role: "user", content: message}],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
          }
        }
      );

      const botMessage = {
        message: response.data.choices[0].message.content,
        sender: "ChatGPT",
        direction: "incoming"
      };

      setMessages([...newMessages, botMessage]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          💬
        </button>
      ) : (
        <div style={{ width: '350px', height: '500px' }}>
          <MainContainer>
            <ChatContainer>
              <MessageList>
                {messages.map((message, i) => (
                  <Message 
                    key={i} 
                    model={message}
                    style={message.sender === "ChatGPT" ? { backgroundColor: '#f0f0f0' } : {}}
                  />
                ))}
                {isTyping && <TypingIndicator content="ChatGPT is typing" />}
              </MessageList>
              <MessageInput placeholder="Type message here" onSend={handleSend} />
            </ChatContainer>
          </MainContainer>
          <button 
            onClick={() => setIsOpen(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ✖
          </button>
        </div>
      )}
    </div>
  );
}

export default ChatBot;