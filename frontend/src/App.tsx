import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
};

function App() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const response = await fetch("/api/health");

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data: HealthResponse = await response.json();
        setStatus(data.status);
      } catch {
        setStatus("error");
      }
    };

    void loadHealth();
  }, []);

  return (
    <main>
      <h1>Mini ERP</h1>
      <p>Backend status: {status}</p>
    </main>
  );
}

export default App;
