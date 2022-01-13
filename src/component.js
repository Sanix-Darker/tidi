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

const MsgList = () => {
    // For incoming messages...
    const [msgs, setMsgs] = useState([])

    const msgsEndRef = useRef(null)

    const scrollToBottom = () => {
        msgsEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    setInterval(() => {
        const randomPayload = {
            usrname: "asdasda",
            href: "http://elhme",
            message: "So iello there')</script>",
        }

        // print only the 50 last elements from the array
        setMsgs([...msgs, randomPayload])
    }, 1500)

    useEffect(() => {
        scrollToBottom()
    }, [msgs]);

    return (
        <div>
            {msgs.length == 0 ?
                <div className="tsc-no-msg">No messages yet, be the first to post a message !</div>:
                msgs.map((msg, index) => <Msg usrname={msg.usrname.slice(0, 14)}
                                            key={index} href={msg.href}
                                            message={msg.message.slice(0, 120) + (msg.message.length >= 120 ? "..." : "")}
                                            isAdmin={msg.isAdmin ? msg.isAdmin: false} />)
            } <div ref={msgsEndRef} />
        </div>
    )
}

/**
 * The Feed for the list of incomming messages
 **/
const Board = () => {

    return (
        <div id="tsc-messages" className='tsc-scroll-shadows'>
            <MsgList />
        </div>
    )
}


/**
 * THe output of the whole component
 */
export default function App(props) {
    // For the visibility of the component
    const [isActive, setActive] = useState(true); // default should be false
    // For the message am writing...
    const [txtMessage, setTxtMessage] = useState('');

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
            {EMOJI_EXPRESSIONS.map((e, index) => <button key={index} onClick={() => setTxtMessage(`${txtMessage}${e}`)}>{e}</button>)}
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
                        value={txtMessage}
                        autoFocus
                        placeholder="Enter your message here..."
                        id="tsc-text-box"/>
            </div>
        )
    }

    return (
        <div id="tsc-ttspch-box" >
            <div className={`${isActive ? 'tsc-hide': 'tsc-show'}`}>
                <Board />
                <EmojiBox />
                <TextBox />
            </div>
            <ToggleButton />
            {isActive ? <button>⚙️</button> : null }
        </div>
  );
}
