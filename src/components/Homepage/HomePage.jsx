import { useState } from "react";
import { MdOutlineSend } from "react-icons/md";
import { IconContext } from "react-icons";
import styles from "./homepage.module.css";
import ChatBox from "../Textbox/TextBox";
import NavBar from "../Navbar/NavBar";

const HomePage = () => {
  const [text, setText] = useState("");
  const [paragraphs, setParagraphs] = useState([]);
  const [error, setError] = useState("");

  const handleSelection = async (e, text, source, index) => {
    const target = e.target.value;
    if ("ai" in self && "translator" in self.ai) {
      try {
        const translatorCapabilities = await self.ai.translator.capabilities();
        const canTranslate = translatorCapabilities.languagePairAvailable("es", "fr");

        if (canTranslate === "readily") {
          const translator = await self.ai.translator.create({
            sourceLanguage: source,
            targetLanguage: target,
          });

          const result = await translator.translate(text);
          const detectedLanguage = await detectLanguage(result);
          setParagraphs((prev) =>
            prev.map((oldPara, i) =>
              i === index ? { ...oldPara, text: result, language: detectedLanguage.detectedLanguage } : oldPara
            )
          );
        }
      } catch {
        setError("This text couldn't be translated");
        setTimeout(() => setError(""), 2000);
      }
    }

    else {
      setError("This text couldn't be translated");
      setTimeout(() => setError(""), 2000);
    }
  };

  const handleSummarize = async (text) => {
    if (!("ai" in self) || !("summarizer" in self.ai)){
      setError("This text couldn't be summarizerised");
      setTimeout(() => setError(""), 2000);
      return;
    }
      

    const options = {
      sharedContext: "This is a scientific article",
      type: "key-points",
      format: "markdown",
      length: "medium",
    };

    const available = (await self.ai.summarizer.capabilities()).available;
    if (available === "no"){
      setError("The summarizer isn't available");
      setTimeout(() => setError(""), 2000);
      return;
    } 

    const summarizer = await self.ai.summarizer.create(options);
    if (available === "after-download") {
      summarizer.addEventListener("downloadprogress", (e) => {
        console.log(`Download progress: ${e.loaded} / ${e.total}`);
      });
      await summarizer.ready;
    }

    return await summarizer.summarize(text);
  };

  const detectLanguage = async (text) => {
    if ("ai" in self && "languageDetector" in self.ai) {
      try {
        const languageDetectorCapabilities = await self.ai.languageDetector.capabilities();
        if (languageDetectorCapabilities.capabilities === "no") {
          setError("Language detection is unavailable");
          setTimeout(() => setError(""), 2000);
        }

        const detector = await self.ai.languageDetector.create();
        const results = await detector.detect(text);
        return results.length > 0 ? results[0] : null;
      } catch {
        setError("The language couldn't be detected");
        setTimeout(() => setError(""), 2000);
        return ;
      }
    }
  };

  const handleClick = async () => {
    if (!text) return;


    const detectedLanguage = await detectLanguage(text);
    if (!detectedLanguage) {
      setError("Error detecting this language");
      setTimeout(() => setError(""), 2000);
      console.log(paragraphs)
      
    } else if (detectedLanguage.confidence < 0.6){
      setParagraphs((prev) => [...prev, { text, language: "Couldn't detect!" }]);
    }
    else{
      setParagraphs((prev) => [...prev, { text, language: detectedLanguage.detectedLanguage }]);
    }

    setText("");
  };

  return (
    <IconContext.Provider value={{ color: "white", size: "30px" }}>
      <NavBar />
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.chatcontainer}>
        <div className={styles.chat}>
          {paragraphs.map((paragraph, index) => (
            <ChatBox {...paragraph} key={index} index={index} handleSummarize={handleSummarize} handleSelection={handleSelection} />
          ))}
        </div>
        <div className={styles.sendmessagecontainer}>
          <div className={styles.sendmessage}>
            <textarea
              placeholder="Language detector, translator, and summarizer"
              name="requests"
              id="requests"
              onChange={(e) => setText(e.target.value)}
              value={text}
            ></textarea>
            <button className={styles.sendbutton} onClick={handleClick}>
              <MdOutlineSend onMouseOver={({ target }) => (target.style.color = "black")} onMouseOut={({ target }) => (target.style.color = "white")} />
            </button>
          </div>
        </div>
      </div>
    </IconContext.Provider>
  );
};

export default HomePage;
