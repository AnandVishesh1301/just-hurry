"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { BiXCircle } from "react-icons/bi";

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
          messages: [
            { role: "system", content: "You are a hurricane releif assitant. Your goal is to help people who are facing a hurricane disaster by guiding them to safety." }, // System message or custom prompt
            { role: "user", content: message }          // User's message
          ],
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
          <MainContainer style={{borderRadius: "4vh", flexDirection: 'column', paddingLeft: "1vw", paddingRight: "1vw"}}>
            <ChatContainer>
              <MessageList style={{paddingTop: "8vh"}}>
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
          <button 
            onClick={() => setIsOpen(false)}
            style={{
              marginTop: '1vh',
              marginLeft: '-0.5vw',
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              width: '6vh',
              height: '6vh',
            }}
              > <BiXCircle size={'6vh'} color='#2596be' /></button>
          </MainContainer>
        </div>
      )}
    </div>
  );
}

export default ChatBot;