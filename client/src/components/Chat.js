import React, { useCallback, useEffect, useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Message from "./Message";
import axios from "axios";

const ChatUI = (props) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getMessageResponse = useCallback(
    async (message) => {
      setIsLoading(true);
      try {
        const baseURL = process.env.REACT_APP_CHAT_GPT_URL ?? "";
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_CHAT_GPT_KEY}`,
        };
        const body = {
          model: process.env.REACT_APP_CHAT_GPT_MODEL,
          messages: [{ role: "user", content: `${message.text}` }],
        };
        const response = await axios.post(baseURL, body, { headers });
        if (response?.data?.choices[0]?.message?.content) {
          const newMessage = {
            text: response?.data?.choices[0]?.message?.content,
            sender: "bot",
            timestamp: response?.data?.choices[0]?.created,
          };
          try {
            console.log(
              response?.data?.choices[0]?.message?.content,
              "--------"
            );

            await props.contract.storeMessage(
              response?.data?.choices[0]?.message?.content
            );
            setIsLoading(false);
          } catch (error) {
            console.error("Error uploading text:", error);
            setIsLoading(false);
          }
          setMessages([...messages, newMessage]);
        }
      } catch (error) {
        console.log("error: ", error);
      }
      setIsLoading(false);
    },
    [messages]
  );

  useEffect(() => {
    if (!props.contract) {
      return;
    }

    (async () => {
      try {
        const data = await props.contract.getAllMessages();
        console.log(data);
      } catch (error) {
        console.log("error: ", error);
      }
    })();
  }, [messages]);
  useEffect(() => {
    // Check if there's a new message
    const lastMessage = messages[messages.length - 1];

    // If there's a new message and it's sent by the user, call the API
    if (lastMessage && lastMessage.sender === "user") {
      getMessageResponse(lastMessage);
    }
  }, [messages, getMessageResponse]);

  const handleSend = async () => {
    if (input.trim() === "") return;
    const timestamp = Math.round(+new Date() / 1000);
    const newMessage = {
      text: input.trim(),
      sender: "user",
      timestamp,
    };
    try {
      await props.contract.storeMessage(input);
      setIsLoading(false);
    } catch (error) {
      console.error("Error uploading text:", error);
      setIsLoading(false);
    }

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    setInput("");
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleKeyDownEvent = (e) => {
    if (e.key === "Enter" && input.trim().length > 0) {
      handleSend();
    }
  };

  const renderMessages = () => {
    if (!messages[0]) {
      return (
        <Box sx={{ flexGrow: 1, overflow: "auto", p: 2, textAlign: "center" }}>
          No Messages
        </Box>
      );
    }
    return (
      <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
        {messages.map((message) => (
          <Message key={message.timestamp} message={message} />
        ))}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        height: "87%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {renderMessages()}
      <Box>
        <Box
          sx={{
            display: "flex",
          }}
        >
          <TextField
            fullWidth
            size="small"
            sx={{ borderRadius: "0" }}
            placeholder="Type a message"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDownEvent}
          />
          <Button
            disabled={isLoading}
            color="primary"
            sx={{
              maxWidth: "25px",
              minWidth: "10px",
            }}
            variant="contained"
            endIcon={<SendIcon sx={{ marginLeft: "-8px" }} />}
            onClick={handleSend}
          ></Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatUI;
