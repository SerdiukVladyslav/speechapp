import React, { useState } from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import Select from "react-select";

const App = () => {
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [recognitionLanguage, setRecognitionLanguage] = useState(null);
  const [translationLanguage, setTranslationLanguage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const languages = [
    { value: "en-US", label: "English" },
    { value: "fr-FR", label: "French" },
    { value: "de-DE", label: "German" },
    { value: "es-ES", label: "Spanish" },
    { value: "ru-RU", label: "Russian" },
    { value: "uk-UA", label: "Ukrainian" },
    { value: "lt-LT", label: "Lithuanian" },
  ];

  const speechKey = "44bGNqlLk0XCP2EFDlgUuLdcfveY4fCnklduBnoLgQUBfdSx0XzxJQQJ99BAAC5RqLJXJ3w3AAAYACOGouBG";
  const speechRegion = "westeurope";
  const translatorKey = "53EWYuWCvPGXfTyc73EstzmCW0fvtAF84FvYvOMLc7Sy4DeZ4sypJQQJ99BAAC5RqLJXJ3w3AAAbACOGcQNH";
  const translatorRegion = "westeurope";

  const startRecognition = () => {
    if (!recognitionLanguage || !translationLanguage) {
      alert("Please select both recognition and translation languages.");
      return;
    }

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechRecognitionLanguage = recognitionLanguage.value;
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    setIsRecording(true);

    recognizer.recognizeOnceAsync(
      (result) => {
        setText(result.text);
        translateText(result.text);
        setIsRecording(false);
      },
      (err) => {
        console.error(err);
        setIsRecording(false);
      }
    );
  };

  const translateText = (inputText) => {
    fetch(
      `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${translationLanguage.value}`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": translatorKey,
          "Ocp-Apim-Subscription-Region": translatorRegion,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ Text: inputText }]),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const translated = data[0].translations[0].text;
        setTranslatedText(translated);
        speakText(translated);
      })
      .catch((error) => {
        console.error("Translation error:", error);
        alert("Translation failed");
      });
  };

  const speakText = (text) => {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechSynthesisLanguage = translationLanguage.value;

    const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig);
    synthesizer.speakTextAsync(
      text,
      () => synthesizer.close(),
      (err) => {
        console.error(err);
        synthesizer.close();
      }
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Speech Translation App</h1>
      <button onClick={startRecognition} disabled={isRecording}>
        {isRecording ? "Recording..." : "Start Speaking"}
      </button>
      <p>
        <b>Recognized Text:</b> {text}
      </p>
      <Select
        options={languages}
        onChange={(lang) => setRecognitionLanguage(lang)}
        placeholder="Select Recognition Language"
      />
      <Select
        options={languages}
        onChange={(lang) => setTranslationLanguage(lang)}
        placeholder="Select Translation Language"
      />
      <p>
        <b>Translated Text:</b> {translatedText}
      </p>
    </div>
  );
};

export default App;
