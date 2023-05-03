import logo from "./logo.svg";
import "./App.css";
// import { DiarizationService } from "lium-spkdiarization";
import { useEffect, useRef, useState } from "react";
import { Configuration, OpenAIApi } from "openai";
import { LineWave, Audio } from "react-loader-spinner";
import jsPDF from "jspdf";

function App() {
    const API_KEY = "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";
    const url = "https://api.openai.com/v1/organizationchat/completions";

    const configuration = new Configuration({
        organization: "org-F9AqANfJQREkSo92hY07vskh",
        apiKey: API_KEY
    });

    const openai = new OpenAIApi(configuration);

    const [recording, setRecording] = useState(false);
    const [voice, setVoice] = useState(null);
    const [input, setInput] = useState(null);
    const [results, setResults] = useState({});
    const [trans_loader, setTranscriptLoader] = useState(false);
    const [api_loader, setApiLoader] = useState(false);
    const recognitionRef = useRef(null);

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
        setResults({ ...results, question: input, answer: null });
    };

    const onlySummary = async () => {
        setApiLoader(true);

        const body = {
            model: "text-davinci-003",
            prompt: `Create a summary of the following text "${input}" The summary should include the following structure: HPI, psychiatric review of symptoms, psychiatric history, medical history, family history, social history, mental status exam, and clinical assessment and plan.`,
            temperature: 0.05,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        };

        const response = await openai.createCompletion({ ...body });
        const summary = response?.data?.choices[0]?.text;
        setResults({ ...results, question: null, answer: summary });
        setApiLoader(false);
        // fetch(url, {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //         Authorization: `Bearer ${API_KEY}`
        //     },
        //     body: JSON.stringify(body)
        // })
        //     .then((response) => response.json())
        //     .then((data) => {
        //         setApiLoader(false);
        //         const summary = data.choices[0].message.content;
        //         setResults([...results, { question: input, answer: summary }]);
        //     });
    };

    const withSummary = async () => {
        setApiLoader(true);

        const body = {
            model: "text-davinci-003",
            prompt: `Create a summary of the following text "${input}" The summary should include the following structure: HPI, psychiatric review of symptoms, psychiatric history, medical history, family history, social history, mental status exam, and clinical assessment and plan.`,
            temperature: 0.05,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        };

        const response = await openai.createCompletion({ ...body });
        const summary = response?.data?.choices[0]?.text;
        setResults({ ...results, question: input, answer: summary });
        setApiLoader(false);
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
                setResults({ ...results, question: input, answer: summary });
            });
    };

    const download = (e, item) => {
        console.log("called", e, item);
        const value = e.target.value;
        if (value === "text") {
            if (results.question && results.answer) {
                copyToClipboard(
                    `Transcript: ${results.question} Summary: ${results.answer} `
                );
            } else if (!results.question) {
                copyToClipboard(`Transcript: ${results.question}`);
            } else {
                copyToClipboard(`Summary: ${results.answer} `);
            }
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

    const reportTemplateRef = useRef(null);

    async function Download(item) {
        const doc = new jsPDF("p", "mm", [1200, 900]);
        doc.setFont("Inter-Regular", "normal");
        doc.setFontSize("11");
        doc.html(reportTemplateRef.current, {
            async callback(doc) {
                await doc.save("document");
            }
        });
    }
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12 border-bottom">
                    <h3 className="p-2 text-success text-center ">
                        Text to speech with GPT-4
                    </h3>
                </div>
                <div className="col-md-12 p-2 ml-2 text-center d-flex justify-content-center">
                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={recording ? stop : start}
                    >
                        {recording ? "stop" : "Initiate Conversation"}
                    </button>
                </div>
                <div className="col-md-3 p-2 d-flex justify-content-center"></div>

                {input && (
                    <div className="col-md-6 p-2 d-flex justify-content-center">
                        {trans_loader ? (
                            <p>Transcripting...</p>
                        ) : (
                            <>
                                <button
                                    className="btn btn-sm  w-50 btn-success"
                                    onClick={onlyTranscripting}
                                >
                                    Only Transcript
                                </button>
                                <button
                                    className="btn btn-sm mx-2 w-50 btn-info"
                                    onClick={onlySummary}
                                >
                                    Only Summary
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

            <div className="row text-dark">
                <div className="col-md-12 text-right ">
                    <h6 className="p-2 mt-4 text-secondary text-center w-100 border-bottom">
                        Output{" "}
                        {api_loader && (
                            <p className="mt-2 d-flex flex-column justify-content-center align-items-center">
                                <Audio
                                    height="50"
                                    width="50"
                                    radius="9"
                                    color="green"
                                    ariaLabel="loading"
                                    wrapperStyle
                                    wrapperClass
                                />
                                <br />
                                <p>Processing...</p>
                            </p>
                        )}
                    </h6>
                </div>
                <div
                    className="col-md-12 border-bottom p-2 bg-light"
                    ref={reportTemplateRef}
                >
                    {(results.question || results.answer) && (
                        <div class="card text-left">
                            <div class="card-body">
                                <p class="card-text w-50">
                                    {results.question && (
                                        <>
                                            {" "}
                                            <strong>Transcript: </strong>
                                            <br />
                                            {results.question}
                                        </>
                                    )}
                                </p>
                                <p class="card-text w-50">
                                    {results.answer && (
                                        <>
                                            <strong>Summary: </strong>
                                            <br />
                                            {results.answer}
                                        </>
                                    )}
                                </p>
                            </div>
                            <div className="card-footer">
                                <div className="row">
                                    <div className="col-md-8"></div>
                                    <div className="col-md-4">
                                        <select
                                            onChange={(e) =>
                                                download(e, results)
                                            }
                                            className="form-control w-30"
                                        >
                                            <option
                                                selected
                                                disabled
                                                className=""
                                                style={{ float: "right" }}
                                            >
                                                Select Download Type
                                            </option>
                                            <option value={"text"}>
                                                Copy Text
                                            </option>
                                            <option value={"file"}>
                                                Download File
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
