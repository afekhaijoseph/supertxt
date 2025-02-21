import React from 'react'
import { useState } from 'react'
import { MdOutlineSend } from "react-icons/md";
import { IconContext } from 'react-icons';
import styles from './homepage.module.css';
import ChatBox from '../Textbox/TextBox';
import NavBar from '../Navbar/NavBar'
const HomePage = () => {
    const [text, setText] = useState('');
    const [paragraphs, setParagraphs] = useState([]);
    const [error, setError] = useState('')


    const handleSelection = (e, text, source, index)=>{
        const target = e.target.value
        const translateLanguage = async () =>{
            if ('ai' in self && 'translator' in self.ai) {
                const translatorCapabilities = await self.ai.translator.capabilities();
                const canTranslate = translatorCapabilities.languagePairAvailable('es', 'fr');
                if (canTranslate === 'no') {
                    return;
                } 
                else if (canTranslate === 'readily') {
                    try{
                      const translator = await self.ai.translator.create({
                        
                        sourceLanguage: source,
                        targetLanguage: target,
                      });
                      
                       const result = await translator.translate(text)
                       const detectedLanguage = await detectLanguage(result); 
                       setParagraphs(prevParagraphs => prevParagraphs.map((oldPara, i)=> {
                        return index === i ? {...oldPara, text: result, language: detectedLanguage.detectedLanguage} : oldPara
                       }))

                    }
                    catch(e){
                      setError("This text couldn't be translated");
                      setTimeout(() => {
                        setError('')
                      }, 2000);
                    }
                    
                       
                       
                  
    
                } 
                else if (canTranslate === 'after-download'){
                    console.log("Creating detector with monitor.");
                    const translator = await self.ai.translator.create({
                        sourceLanguage: source,
                        targetLanguage: target,
                        monitor(m) {
                          m.addEventListener('downloadprogress', (e) => {
                            console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
                          });
                        },
                      });
                      await translator.translate(text);                           
                }
             
            }     
        }
        translateLanguage();
    }

    const handleSummarize = async (text) => {
        if (!('ai' in self) || !('summarizer' in self.ai)) {
          console.error('Summarizer API is not available.');
          return;
        }
      
        const options = {
          sharedContext: 'This is a scientific article',
          type: 'key-points',
          format: 'markdown',
          length: 'medium',
        };
      
        const available = (await self.ai.summarizer.capabilities()).available;
        console.log('Summarizer availability:', available);
        if (available === 'no') {
          return;
        }
        const summarizer = await self.ai.summarizer.create(options);
        if (available === 'after-download') {
        
          summarizer.addEventListener('downloadprogress', (e) => {
            console.log(`Download progress: ${e.loaded} / ${e.total}`);
          });
          await summarizer.ready;
        }
      
        const summary = await summarizer.summarize(text);
        return summary;
      };
      
   
   


    
    const detectLanguage = async (text) => {
      console.log(text);
        if ('ai' in self && 'languageDetector' in self.ai) {
            const languageDetectorCapabilities = await self.ai.languageDetector.capabilities();
            languageDetectorCapabilities.languageAvailable('es');
    
            let detector;
    
                const canDetect = languageDetectorCapabilities.capabilities;
                if (canDetect === 'no') {
                    return;
                
                }

                 else if (canDetect === 'readily') {
                    detector = await self.ai.languageDetector.create();
                } else {
                    detector = await self.ai.languageDetector.create({
                        monitor(m) {
                            m.addEventListener('downloadprogress', (e) => {
                                console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
                            });
                        },
                    });
                    await detector.ready;
                }
                
                const results = await detector.detect(text);
                if (results && results.length > 0) {
                    const detectedLanguage = results[0]
                    return detectedLanguage;
                   
                }
            

        }
    };
    

    const handleClick = async () =>{
        if (!text.trim()){
            return
        }
        const detectedLanguage = await detectLanguage(text); 
        if(detectedLanguage.confidence > 0.7){
          setParagraphs([...paragraphs, {text, language:detectedLanguage.detectedLanguage}]);
          setText('');
        }

        else{
          setParagraphs([...paragraphs, {text, language:"Couldn't detect!"}]);
          setText('');
          
        }
        


}
    
  return (
    <IconContext.Provider value={{ color: 'white', size: "25px"}}>
      <NavBar/>
      {error && <p className={styles.error}>{error}</p>}
      
       <div className={styles.chatcontainer}>
        <div className={styles.chat}>
            {paragraphs.map((paragraph, index) => {
                return (
                    <ChatBox {...paragraph} key={index} index={index} handleSummarize = {handleSummarize} handleSelection = {handleSelection} />
                )
            })}
            
        </div>
        <div className={styles.sendmessagecontainer}>
           <div className={styles.sendmessage}>
           <textarea placeholder="I will detect your texts language, translate and summarize it if it's too long" name="requests" id="requests" onChange={e => setText(e.target.value)} value={text}></textarea>
           <button className={styles.sendbutton} onClick={handleClick}>
           <MdOutlineSend  onMouseOver={({target})=>target.style.color="black"}
            onMouseOut={({target})=>target.style.color="white"}/>
           </button>
        </div>
        </div>
       
       </div>
    </IconContext.Provider>
  )
  

}

export default HomePage