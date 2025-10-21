import React, { createContext, useState, ReactNode } from "react";
import { Snackbar } from "react-native-paper";

interface SnackbarContextProps {
  show: (message: string, duration?: number, color?: string) => void;
}

export const SnackbarContext = createContext<SnackbarContextProps | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState(3000);
  const [color, setColor] = useState("#4caf50");

  const show = (msg: string, time: number = 3000, c: string = "#4caf50") => {
    setMessage(msg);
    setDuration(time);
    setColor(c);
    setVisible(true);
  };

  return (
    <SnackbarContext.Provider value={{ show }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={duration}
        style={{
          backgroundColor: color,
        }}
      >
        {message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
}
