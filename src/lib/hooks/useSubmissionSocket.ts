import { useEffect, useRef } from "react";
import { useSubmissionStore } from "@/store";
import { API_URLS } from "../constants";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

/**
 * Hook that connects to the Submission Service WebSocket for real‑time updates.
 * It listens for messages related to the current submission ID stored in the
 * submission store and updates the store accordingly.
 */
export function useSubmissionSocket() {
  const {
    currentSubmissionId,
    setResults,
    setError,
    updateStatus,
    isSubmitting,
  } = useSubmissionStore();

  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    // Only connect to WebSocket for Submissions (Run utilizes polling via CXE)
    if (!currentSubmissionId || !isSubmitting) return;
    
    // Cleanup previous connection if any
    if (clientRef.current) {
        clientRef.current.deactivate();
    }

    const socketUrl = `${API_URLS.SUBMISSION}/ws`; // SockJS endpoint
    
    const client = new Client({
        webSocketFactory: () => new SockJS(socketUrl),
        debug: function (str) {
            console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    client.onConnect = function (frame) {
        console.log('Connected: ' + frame);
        // Subscribe to submission updates
        client.subscribe(`/topic/submissions/${currentSubmissionId}`, (message) => {
             if (message.body) {
                try {
                    const data = JSON.parse(message.body);
                    // Expected shape: { status, verdict, runtimeMs, memoryKb, passedTestCases, totalTestCases, errorMessage, compilationOutput, testCaseResults }
                    if (data.status) {
                        updateStatus(data.status);
                    }
                    if (data.status === 'FAILED' || data.status === 'ERROR') {
                         setError(data.errorMessage || "Submission Failed");
                    } else if (data.status === 'COMPLETED') {
                        setResults({
                            verdict: data.verdict,
                            runtimeMs: data.runtimeMs,
                            memoryKb: data.memoryKb,
                            passedTestCases: data.passedTestCases,
                            totalTestCases: data.totalTestCases,
                            errorMessage: data.errorMessage,
                            compilationOutput: data.compilationOutput,
                            testCaseResults: data.testCaseResults,
                        });
                    }
                } catch(e) {
                   console.error("Failed to parse STOMP message", e); 
                }
             }
        });
    };

    client.onStompError = function (frame) {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [currentSubmissionId, isSubmitting, setResults, setError, updateStatus]);
}
