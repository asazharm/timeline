import React, { useEffect, useState } from "react";
import "./App.css";
import Timeline, { Channel } from "./Timeline/Timeline";
import axios from "axios";

function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [epg, setEpg] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3004/channels")
      .then((resp) => setChannels(resp.data));
    axios.get("http://localhost:3004/epg").then((resp) => setEpg(resp.data));
  }, []);

  return (
    <div className="App p-12">
      <Timeline data={{ channels, epg }} />
    </div>
  );
}

export default App;
