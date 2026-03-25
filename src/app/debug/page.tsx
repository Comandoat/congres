"use client";

import { useState } from "react";

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([]);

  const log = (msg: string) => {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
    setLogs((prev) => [...prev, `[${timestamp}] ${msg}`]);
  };

  const testFetch = async () => {
    setLogs([]);
    log("=== TEST 1: fetch POST /api/scores ===");

    try {
      log("Sending fetch...");
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_name: "DEBUG_FETCH",
          score: 111,
          correct_answers: 1,
          total_questions: 4,
        }),
      });
      const text = await res.text();
      log(`Response status: ${res.status}`);
      log(`Response body: ${text}`);
    } catch (e) {
      log(`ERROR: ${e}`);
    }
  };

  const testBeacon = async () => {
    log("=== TEST 2: sendBeacon POST /api/scores ===");

    const payload = JSON.stringify({
      player_name: "DEBUG_BEACON",
      score: 222,
      correct_answers: 2,
      total_questions: 4,
    });

    try {
      const result = navigator.sendBeacon(
        "/api/scores",
        new Blob([payload], { type: "application/json" })
      );
      log(`sendBeacon returned: ${result}`);
      log("Waiting 3s then checking DB...");

      await new Promise((r) => setTimeout(r, 3000));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/scores?order=created_at.desc&limit=5`,
        {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          },
        }
      );
      const data = await res.json();
      log(`Latest 5 scores in DB:`);
      for (const row of data) {
        log(`  - ${row.player_name}: ${row.score} pts (${row.created_at})`);
      }
    } catch (e) {
      log(`ERROR: ${e}`);
    }
  };

  const testBeaconTextPlain = async () => {
    log("=== TEST 3: sendBeacon with text/plain ===");

    const payload = JSON.stringify({
      player_name: "DEBUG_TEXTPLAIN",
      score: 333,
      correct_answers: 3,
      total_questions: 4,
    });

    try {
      // Some browsers send sendBeacon as text/plain regardless
      const result = navigator.sendBeacon("/api/scores", payload);
      log(`sendBeacon (text/plain) returned: ${result}`);
    } catch (e) {
      log(`ERROR: ${e}`);
    }
  };

  const testFetchKeepalive = async () => {
    log("=== TEST 4: fetch with keepalive ===");

    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_name: "DEBUG_KEEPALIVE",
          score: 444,
          correct_answers: 4,
          total_questions: 4,
        }),
        keepalive: true,
      });
      log(`Response status: ${res.status}`);
      const text = await res.text();
      log(`Response body: ${text}`);
    } catch (e) {
      log(`ERROR: ${e}`);
    }
  };

  const checkDB = async () => {
    log("=== CHECKING DATABASE ===");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/scores?order=created_at.desc&limit=10`,
        {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          },
        }
      );
      const data = await res.json();
      log(`Total entries returned: ${data.length}`);
      for (const row of data) {
        log(`  ${row.player_name} | score:${row.score} | ${row.created_at}`);
      }
    } catch (e) {
      log(`ERROR fetching DB: ${e}`);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 text-green-400 font-mono text-sm">
      <h1 className="text-xl mb-4 text-white">🔧 Debug — Score Saving</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={testFetch} className="bg-green-900 px-3 py-2 rounded hover:bg-green-800">
          Test 1: fetch
        </button>
        <button onClick={testBeacon} className="bg-blue-900 px-3 py-2 rounded hover:bg-blue-800">
          Test 2: sendBeacon (json)
        </button>
        <button onClick={testBeaconTextPlain} className="bg-yellow-900 px-3 py-2 rounded hover:bg-yellow-800">
          Test 3: sendBeacon (text/plain)
        </button>
        <button onClick={testFetchKeepalive} className="bg-purple-900 px-3 py-2 rounded hover:bg-purple-800">
          Test 4: fetch keepalive
        </button>
        <button onClick={checkDB} className="bg-gray-700 px-3 py-2 rounded hover:bg-gray-600">
          Check DB
        </button>
        <button onClick={() => setLogs([])} className="bg-red-900 px-3 py-2 rounded hover:bg-red-800">
          Clear
        </button>
      </div>

      <div className="bg-gray-950 rounded-lg p-4 max-h-[70vh] overflow-y-auto border border-green-900">
        {logs.length === 0 && <p className="text-gray-600">Clique sur un test pour commencer...</p>}
        {logs.map((line, i) => (
          <div key={i} className={line.includes("ERROR") ? "text-red-400" : ""}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
