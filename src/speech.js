import logo from "./logo.svg";
import "./App.css";
// import { DiarizationService } from "lium-spkdiarization";
import { useEffect, useRef, useState } from "react";

function App() {
    const API_KEY = "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";
    const url = "https://api.openai.com/v1/chat/completions";
    const [recording, setRecording] = useState(false);
    const [voice, setVoice] = useState(null);
    const [input, setInput] = useState(null);
    const [results, setResults] = useState([
        // { question: "saad", answer: "answere" }
    ]);
    const [trans_loader, setTranscriptLoader] = useState(false);
    const [api_loader, setApiLoader] = useState(false);
    const recognitionRef = useRef(null);
    useEffect(() => {
        var msg = new SpeechSynthesisUtterance();
        msg.text = "Hello World";
        window.speechSynthesis.speak(msg);
    }, []);

    const start = () => {
        setTranscriptLoader(true);
        // let timeout = null;
        setInput(null);
        // Check if the browser supports the Web Speech API
        if ("webkitSpeechRecognition" in window) {
            setRecording(true);
            // Create a new instance of the SpeechRecognition object
            let recognition = new window.webkitSpeechRecognition();

            // Set the continuous flag to true
            recognition.continuous = true;

            // Set the language to the user's default language
            recognition.lang = window.navigator.language;

            // Set the interimResults flag to show interim results
            recognition.interimResults = true;

            // Add an event listener to handle the results
            recognition.onresult = function (event) {
                setInput(event.results[event.results.length - 1][0].transcript);
            };

            // Start the speech recognition
            recognition.start();

            recognition.onend = function (event) {
                setTranscriptLoader(false);
                setRecording(false);
            };
            // timeout = setTimeout(() => {
            //     recognition.stop();
            //     setRecording(false);
            // }, 5000);
            recognitionRef.current = recognition;
        }
    };

    const stop = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setRecording(false);
        }
    };

    const onlyTranscripting = () => {
        setResults([...results, { question: input }]);
    };

    const onlySummary = () => {
        setApiLoader(true);

        const body = {
            model: "gpt-4",
            temperature: 0.05,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            messages: [
                { role: "system", content: "" },
                {
                    role: "assistant",
                    content:
                        "HPI, psychiatric review of symptoms, psychiatric history, medical history, family history, social history, mental status exam, and clinical assessment and plan"
                },
                { role: "user", content: input }
            ]
        };

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`
            },
            body: JSON.stringify(body)
        })
            .then((response) => response.json())
            .then((data) => {
                setApiLoader(false);
                const summary = data.choices[0].message.content;
                setResults([...results, { question: input, answer: summary }]);
            });
    };

    const withSummary = () => {
        setApiLoader(true);
        const body = {
            model: "gpt-4",
            temperature: 0.05,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            messages: [
                { role: "system", content: "" },
                {
                    role: "assistant",
                    content:
                        "HPI, psychiatric review of symptoms, psychiatric history, medical history, family history, social history, mental status exam, and clinical assessment and plan"
                },
                { role: "user", content: input }
            ]
        };

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`
            },
            body: JSON.stringify(body)
        })
            .then((response) => response.json())
            .then((data) => {
                setApiLoader(false);
                const summary = data.choices[0].message.content;
                setResults([...results, { question: input, answer: summary }]);
            });
    };

    const fetchResults = async () => {
        const body = {
            model: "gpt-4",
            temperature: 0.05,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            messages: [
                { role: "system", content: "" },
                {
                    role: "assistant",
                    content:
                        "HPI, psychiatric review of symptoms, psychiatric history, medical history, family history, social history, mental status exam, and clinical assessment and plan"
                },
                { role: "user", content: input }
            ]
        };
        const res = fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`
            },
            body: JSON.stringify(body)
        })
            .then((response) => response.json())
            .then((data) => {
                setApiLoader(false);
                const summary = data.choices[0].message.content;
                setResults([...results, { question: input, answer: summary }]);
            });
    };

    const download = (e, item) => {
        console.log("called", e, item);
        const value = e.target.value;
        if (value === "text") {
            copyToClipboard(JSON.stringify(item));
        } else {
            Download(item);
        }
    };
    function copyToClipboard(code) {
        if (navigator.clipboard?.writeText) {
            try {
                navigator.clipboard.writeText(code);
            } catch (e) {
                console.error("Error while copying code", e);
            }
        }
    }

    function Download(item) {
        var name = item.question;

        const content = JSON.stringify(item); //content
        const element = document.createElement("a");
        const blob = new Blob([content], {
            type: "plain/text"
        });
        const fileurl = URL.createObjectURL(blob);
        element.setAttribute("href", fileurl);
        element.setAttribute("download", name + ".html");
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();

        document.body.removeChild(element);
    }
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12 border-bottom">
                    <h3 className="p-2 text-success text-center ">
                        Text to speech with GPT-4
                    </h3>
                </div>
                <div className="col-md-6 p-2 text-center d-flex justify-content-between">
                    {/* <input
                        className="form-control"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    /> */}
                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={recording ? stop : start}
                    >
                        {recording ? "stop" : "Voice"}
                    </button>
                </div>
                {input && (
                    <div className="col-md-6 p-2 d-flex justify-content-between">
                        {trans_loader ? (
                            <p>Transcripting...</p>
                        ) : (
                            <>
                                <button
                                    className="btn btn-sm w-50 btn-success"
                                    onClick={onlyTranscripting}
                                >
                                    Only Transcript
                                </button>
                                <button
                                    className="btn btn-sm w-50 btn-info"
                                    onClick={onlySummary}
                                >
                                    Only Transcript
                                </button>
                                <button
                                    className="btn btn-sm w-50 btn-warning"
                                    onClick={withSummary}
                                >
                                    Transcript + Summary
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
            <div className="row">
                <div className="col-md-12 text-right ">
                    <h6 className="p-2 text-secondary text-center w-100 border-bottom">
                        Results {api_loader && <p>Fetching...</p>}
                    </h6>
                </div>
                {results.map((item, index) => {
                    return (
                        <div
                            key={index}
                            className="col-md-12 border-bottom p-2 bg-light "
                        >
                            <p className="text-info">
                                Question: {item.question}
                            </p>
                            <p className="text-danger">Answer: {item.answer}</p>
                            <select onChange={(e) => download(e, item)}>
                                <option
                                    selected
                                    disabled
                                    className=""
                                    style={{ float: "right" }}
                                >
                                    Download
                                </option>
                                <option value={"text"}>Copy Text</option>
                                <option value={"file"}>download file</option>
                            </select>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default App;
