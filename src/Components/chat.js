import React, { useState, useEffect } from 'react';
import { Client, Account, ID, Databases, Permission, Role } from 'appwrite';

const client = new Client();
const account = new Account(client);
const database = new Databases(client);

client.setEndpoint('https://cloud.appwrite.io/v1');
client.setProject('6452c39d1e3d6cb1c819');

function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    // Authenticate as anonymous user
    account.createAnonymousSession().catch(error => {
      console.error('Failed to authenticate as anonymous user', error);
    });

    // Listen for new chat messages in real-time
    const chatMessages = client.subscribe('documents', response => {
      setMessages(messages => [...messages, response.payload]);
    });

    // Unsubscribe from chat messages when component unmounts
    return () => {
      chatMessages();
    };
  }, []);

  const handleTextChange = event => {
    setText(event.target.value);
  };

  const handleFormSubmit = event => {
    event.preventDefault();

    // Send new chat message to backend
    database.createDocument('6452c3e5da20aaf2605d','6452c3f1327dac051cf0', ID.unique(), {
      text: text,
      timestamp: Date.now()
    }, [
      Permission.read(Role.users()),        //view this document
      Permission.update(Role.users()),      // update this document
      Permission.write(Role.users()),       // write this document
      Permission.delete(Role.users()),      //delete this document
    ]).catch(error => {
      console.error('Failed to send chat message', error);
    });

    // Clear text input
    setText('');
  };

  return (
    <div>
      <h1>Anonymous Chat</h1>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message.text}</li>
        ))}
      </ul>
      <form onSubmit={handleFormSubmit}>
        <input type="text" value={text} onChange={handleTextChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
