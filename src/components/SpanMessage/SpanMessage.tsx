// src/components/SpanMessage.tsx

import React, { useEffect, useState } from "react";
import "./SpanMessage.css";

interface SpanMessageProps {
  message: string;
  status: string;
}

const SpanMessage: React.FC<SpanMessageProps> = ({ message, status }) => {
  const [showSpanMessage, setShowSpanMessage] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpanMessage(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    showSpanMessage && (
      <div className={`span-message-container ${status}`}>
        <p className="span-message-text">{message}</p>
      </div>
    )
  );
};

export default SpanMessage;
