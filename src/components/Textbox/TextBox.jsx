import React from 'react'
import styles from './textbox.module.css'
import {useState} from 'react'

const ChatBox = ({handleSelection, handleSummarize, text, language, index}) => {
  const [select, setSelect] = useState(false)

  const showSelection = () =>{
    setSelect(true)

  }
  const hideSelection = () => {
    setSelect(false)
  }


  const languages = {
    en: 'English',
    pt: 'Portuguese',
    es: 'Spanish',
    ru: 'Russian',
    tr: 'Turkish',
    fr: 'French'
}

  return (
    <div className={styles.chatitem}>
      <div className={styles.display}>
        <p>{text}</p>
        <p className={styles.originlang}>Language: {language in languages ? languages[language] : language}</p>
      </div>
      <div className={styles.functionscontainer}>
      <div className={styles.functions}>
        { select &&  <select onChange={e => handleSelection(e, text, language, index)} name="languages" id="languages">
          <option value="en">English</option>
          <option value="pt">Portugese</option>
          <option value="es">Spanish</option>
          <option value="ru">Russian</option>
          <option value="tr">Turkish </option>
          <option value="en">English</option>
        </select> }
        {select ? <button onClick={hideSelection} className={styles.translate}>Done</button> : <button onClick={showSelection} className={styles.translate}>Translate</button>}
        
        {text.length > 150 && <button className={styles.summarize} onClick = {e => handleSummarize(e, text)}>Summarize</button>}
        </div>
      </div>
     
        
    </div> 

  )
}

export default ChatBox