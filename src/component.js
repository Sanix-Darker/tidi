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
 * THe output of the whole component
 */
export default function App(props) {
    const [isActive, setActive] = useState(false);

    const msgs = [
        {
            usrname: "sanix-darker",
            href: "http://sanix-darker",
            message: "This is a message"
        },{
            usrname: "elhme",
            href: "http://elhme",
            message: "So i was thinking about this idea, this amazing <script>alert('Hello there')</script>",
            isAdmin: true
        },{
            usrname: "doumdoum",
            href: "http://doumdoum",
            message: "On est la noooorrr, je ne pensais pas que les choses devaient se gerer de cette facon, parceque, je penses que nous ne devons pas trouver comment gerer cette solution interessante car parceque et je suis aussi sur que les choses ne se voient pas de cette facon, parceque je me dit que le monde est beau"
        }
    ]

    /**
     * The UsrName component... yeah... a simple a tag
     * what did you expect ?
     *
     */
    const UsrName = ({usrname, color, href, isAdmin=false}) => (
        <b>
            <a className="tsc-usrname" style={{color}} title={isAdmin ? 'admin': 'user'} href={href}>
                {isAdmin ? "**": null}{usrname} :
            </a>
        </b>
    )

    /**
     * The Msg component... too lazy to describe it,
     * as you can see it takes 3 incomming parameters... that's all
     *
     * usrname for the username of the user
     * href for the link of the profile of the user
     * message for the content message of the user
     */
    const Msg = ({usrname, href, message, isAdmin=false}) => {
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

        message = message.slice(0, 120) + (message.length >= 120 ? "..." : "");
        usrname = usrname.slice(0, 14)
        return (
            <div className="tsc-msg">
                <UsrName
                    usrname={usrname} href={href} isAdmin={isAdmin}
                    color={`${CSS_COLOR_NAMES[colorIndiceFromUsr(usrname.slice(0, 4))]}`} />
             &nbsp; {message.escape()}
            </div>
        )
    }

    /**
     * The Feed for the list of incomming messages
     **/
    const Feed = ({msgs}) => {
          const msgsEndRef = useRef(null)

          const scrollToBottom = () => {
            msgsEndRef.current?.scrollIntoView({ behavior: "smooth" })
          }

          useEffect(() => {
            scrollToBottom()
          }, [msgs]);

        return (
            <div id="tsc-messages" className='tsc-scroll-shadows'>
                {msgs.length == 0 ?
                    <div className="tsc-no-msg">No messages yet !</div>:
                    msgs.map(msg => (
                        <Msg usrname={msg.usrname}
                            href={msg.href}
                            message={msg.message}
                            isAdmin={msg.isAdmin ? msg.isAdmin: false}
                        />
                    ))
                }
                <div ref={msgsEndRef} />
            </div>
        )
    }

    /**
     * The maggic toggle button simple as it
     */
    const ToggleButton = () => (
        <button
            onClick={() => setActive(!isActive)}
            className={`tsc-toggle-button ${!isActive ? 'tsc-hide-button': ''}`} >
            {isActive ? 'HIDE': 'SHOW'} TTSPCH CHAT
        </button>
    )

    /**
     * The EmojiBox for the list of all basic emojis we will have
     */
    const EmojiBox = () => (
        <div className="tsc-emojibox">
            {EMOJI_EXPRESSIONS.map(e => <button>{e} </button>)}
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
                        placeholder="Enter your message here..."
                        id="tsc-text-box"/>
            </div>
        )
    }

    return (
        <div id="tsc-ttspch-box" >
            <div className={`${isActive ? 'tsc-hide': 'tsc-show'}`}>
                <Feed msgs={msgs} />
                <EmojiBox />
                <TextBox />
            </div>
            <ToggleButton />
            {isActive ? <button>⚙️</button> : null }
        </div>
  );
}
