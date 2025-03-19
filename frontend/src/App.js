import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';

const logoUrl = "https://cdn.shortpixel.ai/spai/q_glossy+w_408+to_auto+ret_img/www.certara.com/app/uploads/2023/05/certara-logo-2023.png";

/** 
 * A tiny component that shows an encircled "?" 
 * and when hovered, displays a custom tooltip bubble with some info text.
 */
const TooltipIcon = ({ info }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Encircled "?" */}
      <span
        style={{
          display: "inline-block",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          backgroundColor: "#007bff",
          color: "#fff",
          textAlign: "center",
          lineHeight: "18px",
          cursor: "pointer",
          marginLeft: "5px",
          fontSize: "12px",
        }}
      >
        ?
      </span>

      {/* Custom tooltip bubble */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            bottom: "-35px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#333",
            color: "#fff",
            padding: "5px 10px",
            borderRadius: "4px",
            fontSize: "12px",
            whiteSpace: "nowrap",
            zIndex: 999,
          }}
        >
          {info}
        </div>
      )}
    </span>
  );
};

const App = () => {
  // 1) Read 'accessCode' from URL param, hidden from the UI
  const [userCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("accessCode") || "";
  });

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // States for when we get chunks back from layar
  const [usedChunks, setUsedChunks] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);

  const chatContainerRef = useRef(null);

  // When we get a new response back from layar we wanna immediately scroll to the bottom of the convo, this is just for that
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Something to await response "i am thinking"
  const spinnerStyle = {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid #fff",
    borderTopColor: "#007bff",
    borderRadius: "50%",
    animation: "spin 1s infinite linear",
  };

  // State manipulation for chunk boxes
  const toggleRow = (index) => {
    setExpandedRows((prev) => {
      if (prev.includes(index)) {
        // collapse
        return prev.filter((i) => i !== index);
      } else {
        // expand
        return [...prev, index];
      }
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { text: input, user: true }]);
    setInput("");
    setUsedChunks([]);
    setExpandedRows([]);

    setIsLoading(true);

    try {
      const response = await fetch("https://5t7s7a3khd22glbx4s2a2ln7pm0onhoh.lambda-url.us-east-1.on.aws/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          message: input,
          accesscode: userCode,
        }),
      });

      const { generatedContent, chunksUsed } = await response.json();
      setMessages((prev) => [...prev, { text: generatedContent, user: false }]);

      if (Array.isArray(chunksUsed)) {
        setUsedChunks(chunksUsed);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { text: "Error getting response", user: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <img
          src={logoUrl}
          alt="Logo"
          style={{ width: "60px", height: "60px", objectFit: "contain", marginRight: 15 }}
        />
        <h1 style={{ margin: 0 }}>Certara.AI Chatbot</h1>
      </div>

      {/* Chat container */}
      <div
        ref={chatContainerRef}
        style={{
          border: "1px solid #ccc",
          borderRadius: "5px",
          backgroundColor: "#fff",
          padding: "10px",
          height: "350px",
          overflowY: "scroll",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.user ? "right" : "left",
              margin: "5px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "10px",
                borderRadius: "5px",
                background: msg.user ? "#007bff" : "#eaeaea",
                color: msg.user ? "#fff" : "#000",
                whiteSpace: "pre-wrap",
                maxWidth: "80%",
              }}
            >
              {msg.user ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>}
            </span>
          </div>
        ))}
      </div>

      {/* Input + button */}
      <div style={{ display: "flex", marginBottom: "20px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "10px",
            marginRight: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "10px 20px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: isLoading ? "#aaa" : "#007bff",
            color: "#fff",
            cursor: isLoading ? "default" : "pointer",
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <span style={{ display: "flex", alignItems: "center" }}>
              <div style={spinnerStyle} />
              <span style={{ marginLeft: 8 }}>Thinking...</span>
            </span>
          ) : (
            "Send"
          )}
        </button>
      </div>

      {/* Chunks table */}
      {usedChunks.length > 0 && (
        <div style={{ marginTop: "20px", backgroundColor: "#fff", padding: "10px", borderRadius: "5px" }}>
          <h2 style={{ marginTop: 0 }}>Chunks Used</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#efefef", textAlign: "left" }}>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Document Name
                  <TooltipIcon info="Friendly name of the document from Layar." />
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Document ID
                  <TooltipIcon info="Raw Document ID used by Layar." />
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Score
                  <TooltipIcon info="Relevance/Confidence score for this chunk." />
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Text (expand/collapse)
                  <TooltipIcon info="The chunk's text. Click 'Expand' for the entire snippet." />
                </th>
              </tr>
            </thead>
            <tbody>
              {usedChunks.map((chunk, i) => {
                const isExpanded = expandedRows.includes(i);
                const snippet = (chunk.text || "").slice(0, 200);

                return (
                  <tr key={i}>
                    {/* Document Name */}
                    <td style={{ border: "1px solid #ccc", padding: "8px", verticalAlign: "top" }}>
                      {chunk.docName || "No Name"}
                    </td>

                    {/* Document ID */}
                    <td style={{ border: "1px solid #ccc", padding: "8px", verticalAlign: "top" }}>
                      {chunk.documentId}
                    </td>

                    {/* Score */}
                    <td style={{ border: "1px solid #ccc", padding: "8px", verticalAlign: "top" }}>
                      {chunk.score ?? "N/A"}
                    </td>

                    {/* Expand/Collapse Text */}
                    <td style={{ border: "1px solid #ccc", padding: "8px", verticalAlign: "top" }}>
                      {isExpanded
                        ? chunk.text
                        : snippet + (chunk.text?.length > 200 ? "..." : "")}
                      <div style={{ marginTop: "5px" }}>
                        <button
                          onClick={() => {
                            setExpandedRows((prev) => {
                              if (prev.includes(i)) {
                                return prev.filter((rowIdx) => rowIdx !== i);
                              } else {
                                return [...prev, i];
                              }
                            });
                          }}
                          style={{
                            padding: "5px 10px",
                            borderRadius: "4px",
                            border: "none",
                            backgroundColor: "#007bff",
                            color: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          {isExpanded ? "Collapse" : "Expand"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default App;
