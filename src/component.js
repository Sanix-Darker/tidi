import { h } from 'preact';
import { useRef, useEffect, useState } from 'preact/hooks';
import { CSS_COLOR_NAMES, EMOJI_EXPRESSIONS } from './utils';
import "./style.css";


/**
 * A security-check to escape html/js tags expressions
 */
String.prototype.escape = function() {
    return this.replace(/[&<>]/g, function(tag) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            ';': '_',
            '\\\\': '_',
            '//': '_',
            '<script': '__',
            'window.': '__',
            '^': '_',
            '|': '_',
            'alert(': '__',
            '</script': '__'
        }[tag] || tag;
    });
};

// generate a key from the incomming roomKey
const hashCode = (s) => {
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
}

/**
 * Just getting the username indices for each letter nd get
 * the number for the color in the array
 */
const colorIndiceFromUsr = (text) => {
  let result = -3;
  for (let i = 0; i < text.length; i++) {
    let code = text.toUpperCase().charCodeAt(i)
    if (code > 64 && code < 91) result += (code - 64);
  }

  return result > 0 ? result : (Math.random() * CSS_COLOR_NAMES.length) | 0;
}


/**
 * The UsrName component... yeah... a simple a tag
 * what did you expect ?
 *
 */
const UsrName = ({usrname, color, href, isAdmin=false}) => (
    <a className="tsc-usrname" style={{color}} title={isAdmin ? 'admin': 'user'} href={href}>
        {isAdmin ? "**": null}{usrname} :
    </a>
)

/**
 * The Msg component... too lazy to describe it,
 * as you can see it takes 3 incomming parameters... that's all
 *
 * usrname for the username of the user
 * href for the link of the profile of the user
 * message for the content message of the user
 */
const Msg = ({usrname, href, message, isAdmin=false}) => (
    <div className="tsc-msg">
        <UsrName
            usrname={usrname} href={href} isAdmin={isAdmin}
            color={`${CSS_COLOR_NAMES[colorIndiceFromUsr(usrname.slice(0, 4))]}`} />
     &nbsp; {message.escape()}
    </div>
)


/**
 * The message list component that will content the list of messages
 **/
const MsgList = () => {
    // For incoming messages...
    const [msgs, setMsgs] = useState([])

    const msgsEndRef = useRef(null)

    const scrollToBottom = () => {
        msgsEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const addMsg = (payload) => {
        // print only the 50 last elements from the array
        setMsgs([...msgs, payload].slice(Math.max(msgs.length - 100, 0)))
    }

    // useEffect(() => {
    //     scrollToBottom()
    // }, [msgs]);

    return (
        <div>
            {msgs.length == 0 ?
                <div className="tsc-no-msg">
                    No messages yet, be the first to post a message !
                </div>:
                msgs.map((msg, index) => <Msg usrname={msg.usrname}
                                    key={index} href={msg.href}
                                    message={msg.message}
                                    isAdmin={msg.isAdmin ? msg.isAdmin: false} />
                )
            } <div ref={msgsEndRef} />
        </div>
    )
}


// TO prevent an user to print the same message multipletime
let LAST_MESSAGE = ""
let LAST_MESSAGE_TIME_SENT = Date.now()

const SettingBoard = ({usr=''}) => {
    const [roomKey, setRoomKey] = useState(localStorage.getItem("roomKey"))
    const [usrIn, setUsrIn] = useState(usr.length > 0 ? usr : localStorage.getItem("usrIn"))

    const settingUpdate = (key, ev) => {
        if (ev.keyCode === 13){
            if (ev.target.value.length > 0){
                localStorage.setItem(key, ev.target.value)
            }
        }
    }

    return (
        <div>
            <h2>ttspch</h2>
            <hr/>
            <b>{hashCode(roomKey)}</b>|<b>{usrIn}</b>
            <hr/>
            <input type="text"
                    className="tsc-setting-input"
                    placeholder="Your roomKey and press ENTER"
                    onChange={(e) => setRoomKey(e.target.value)}
                    onKeyUp={(e) => settingUpdate("roomKey", e)}
                    value={roomKey} />

            {usr.length == 0 ?
                <input className="tsc-setting-input"
                    type="text"
                    onChange={(e) => setUsrIn(e.target.value)}
                    onKeyUp={(e) => settingUpdate("usrIn", e)}
                    placeholder="Your username and press ENTER"
                    value={usr} />: null }

            <br/><br/>
            <div className="tsc-foot">ttspch was made by <a href="https://twitter.com/sanixdarker">@sanixdarker</a></div>
        </div>

    )
}


/**
 * The Feed for the list of incomming messages
 **/
const Board = ({usr='', isSettingsActive=false}) => {

    return (
        <div id="tsc-messages" className='tsc-scroll-shadows'>
            {isSettingsActive ? <SettingBoard usr={usr}/>: <MsgList />}
        </div>
    )
}


/**
 * THe output of the whole component
 */
export default function App(props) {
    // For the visibility of the component
    const [isActive, setActive] = useState(true); // default should be false
    // for the settings board
    const [isSettingsActive, setSettingsActive] = useState(false); // default should be false

    // For the message am writing...
    const [txtMessage, setTxtMessage] = useState('');
    // A ref for the input text
    const inputRef = useRef(null)

    useEffect(() => {
        inputRef.current.focus();
    }, [txtMessage]);

    const checkAndSendTxtMessage = (ev) => {
        if (ev.keyCode === 13){
            if (ev.target.value.length > 0){
                const msgg = ev.target.value
                if (msgg.length > 0){
                    // if it's past 10s you can send the same message or if
                    // your new message is different from the precedent
                    if (LAST_MESSAGE != msgg || Date.now() - LAST_MESSAGE_TIME_SENT > 10000){
                        LAST_MESSAGE = msgg
                        LAST_MESSAGE_TIME_SENT = Date.now()

                        // for the serveur to breath...
                        setTimeout(() => {
                            console.log(msgg)
                        }, 100)
                    }
                    setTxtMessage('')
                }
            }
        }
    }

    /**
     * The maggic toggle button simple as it
     */
    const ToggleButton = () => (
        <button
            onClick={() => setActive(!isActive)}
            className={`tsc-toggle-button ${!isActive ? 'tsc-hide-button': ''}`} >
            {isActive ? 'HIDE': 'SHOW'} TTSPCH BOX
        </button>
    )

    /**
     * The EmojiBox for the list of all basic emojis we will have
     */
    const EmojiBox = () => (
        <div className="tsc-emojibox">
            {EMOJI_EXPRESSIONS.map((e, index) => <button
                key={index}
                onClick={() => setTxtMessage(`${txtMessage}${e}`)}>{e}</button>)}
        </div>
    )

    /**
     * This TextBox is the component for handling the input text of users
     * like the message w or /w emojis
     **/
    const TextBox = () => {
        return (
            <div>
                <input type="text"
                        maxlength="130"
                        onChange={(e) => setTxtMessage(e.target.value)}
                        onKeyUp={(e) => checkAndSendTxtMessage(e)}
                        value={txtMessage}
                        autoComplete="off"
                        autoFocus
                        ref={inputRef}
                        placeholder="Enter your message here..."
                        id="tsc-text-box"/>
            </div>
        )
    }

    return (
        <div id="tsc-ttspch-box" >
            <div className={`${isActive ? 'tsc-hide': 'tsc-show'}`}>
                <Board isSettingsActive={isSettingsActive} usr='darker' />
                {!isSettingsActive ?
                    <div>
                        <EmojiBox /><TextBox />
                    </div> : null
                }
            </div>
            <ToggleButton />
            {isActive ? <button onClick={() => setSettingsActive(!isSettingsActive)}>⚙️</button> : null }
        </div>
  );
}
