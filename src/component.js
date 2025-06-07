import { h } from "preact";
import { useRef, useEffect, useState, useCallback } from "preact/hooks";
import { CSS_COLOR_NAMES, EMOJI_EXPRESSIONS } from "./utils";
import "./style.css";

/**
 * Safer alternative to extending native prototypes.
 * Escapes a limited set of HTML / JS‑dangerous chars.
 */
const escapeHTML = (str = "") =>
  str.replace(/[&<>;\\/^|%$]/g, c =>
    (
      {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        ";": "_",
        "\\": "_",
        "/": "_",
        "^": "_",
        "|": "_",
        "%": "_",
        "$": "_"
      }[c] || c
    )
  );

/* LocalStorage shorthands */
const lsGet = key => localStorage.getItem(key);
const lsSet = (key, val) => localStorage.setItem(key, val);
const jString = JSON.stringify;
const jParse = JSON.parse;

/**
 * Generates a very lightweight hash (DJB2‑style) for a given string.
 */
const hashCode = str => {
  if (!str) return "0";
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
  return hash & hash;
};

/**
 * Derive a deterministic color index from the username.
 */
const colorIdxFromUser = name => {
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    const code = name.toUpperCase().charCodeAt(i);
    if (code >= 65 && code <= 90) sum += code - 64;
  }
  return (sum > 0 ? sum : Math.random() * CSS_COLOR_NAMES.length) % CSS_COLOR_NAMES.length | 0;
};

const UsrName = ({ usrname, color, href, isAdmin }) => (
  <a className="tsc-usrname" style={{ color }} title={isAdmin ? "admin" : "user"} href={href}>
    {isAdmin && "*"}
    {usrname}:
  </a>
);

const Msg = ({ usrname, href, message, isAdmin }) => (
  <div className="tsc-msg">
    <UsrName
      usrname={usrname}
      href={href}
      isAdmin={isAdmin}
      color={CSS_COLOR_NAMES[colorIdxFromUser(usrname.slice(0, 5))]}
    />
    &nbsp; {escapeHTML(message)}
  </div>
);

const MsgList = ({ conn }) => {
  const [msgs, setMsgs] = useState([]);
  const bottomRef = useRef();

  // Scroll helper – stable identity prevents re‑registration.
  const scrollToBottom = useCallback(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), []);

  // Add message – stable identity as well.
  const addMsg = useCallback(payload => {
    setMsgs(prev => {
      const next = [...prev, { usrname: payload.author ?? "x", message: payload.message }];
      return next.slice(-100); // keep last 100
    });
    // After DOM paints, scroll.
    requestAnimationFrame(scrollToBottom);
  }, [scrollToBottom]);

  // Register WS listener once.
  useEffect(() => {
    conn.onmessage = evt => {
      try {
        const payload = jParse(evt.data);
        if (payload.author && payload.message) addMsg(payload);
      } catch (err) {
        console.error("tsc‑err:", err);
      }
    };
  }, [conn, addMsg]);

  return (
    <div id="tsc-messages" className="tsc-scroll-shadows">
      {msgs.length === 0 ? (
        <div className="tsc-no-msg">No messages yet, be the first to post a message !</div>
      ) : (
        msgs.map((m, i) => (
          <Msg key={i} usrname={m.usrname} href={m.href} message={m.message} isAdmin={m.isAdmin} />
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
};

const validURL = str => {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const twitterSpaceKey = url =>
  validURL(url) && url.includes("twitter.com") && url.includes("space")
    ? url.split("/").pop().split("?")[0]
    : "";

let prevRoom = "";

const connectRoom = (conn, roomKey, action = "subscribe") => {
  conn.send(jString({ action, topic: formatRoomKey(roomKey) }));
  console.log(`tsc::${action} on ${roomKey}`);
};

const cleanConnectRoom = (conn, roomKey) => {
  prevRoom = lsGet("roomKey") ?? prevRoom;
  if (prevRoom) connectRoom(conn, prevRoom, "unsubscribe");
  connectRoom(conn, roomKey);
};

const settingUpdate = (conn, key, value, keyCode = 1) => {
  if (keyCode === 13 && value) {
    if (key === "roomKey") cleanConnectRoom(conn, value);
    lsSet(key, value);
  }
};

const formatRoomKey = rk => hashCode(twitterSpaceKey(rk) || rk);

/***********************************
 * SETTINGS BOARD
 ***********************************/
const SettingBoard = ({ conn, setSettingsActive, usr = "" }) => {
  const [roomKey, setRoomKey] = useState(lsGet("roomKey") ?? "");
  const [usrIn, setUsrIn] = useState(usr || lsGet("usrIn") || "");
  const labelRoom = "Write a room Key";
  const labelUsr = "Write your username";

  // persist usrIn live – avoids extra effects.
  useEffect(() => lsSet("usrIn", usrIn), [usrIn]);

  const connect = () => {
    if (!roomKey || !usrIn) return alert("Credentials cannot be empty…");
    settingUpdate(conn, "roomKey", roomKey, 13);
    settingUpdate(conn, "usrIn", usrIn, 13);

    conn.send(jString({ action: "goo", topic: roomKey, message: jString({ u: usrIn, r: formatRoomKey(roomKey) }) }));
    setSettingsActive(false);
  };

  return (
    <div id="tsc-setting-box">
      <h2>tidi-settings</h2>
      <hr />
      <b>
        {formatRoomKey(roomKey)}|{usrIn}
      </b>
      <hr />
      <small>
        {labelRoom}: <b>{roomKey}</b>
      </small>
      <input
        className="tsc-setting-input"
        placeholder={labelRoom}
        value={roomKey}
        onInput={e => {
          setRoomKey(e.target.value);
          if (e.target.value) lsSet("roomKey", e.target.value);
        }}
        onKeyUp={e => settingUpdate(conn, "roomKey", e.target.value, e.keyCode)}
      />
      {usr.length === 0 && (
        <>
          <small>
            {labelUsr}: <b>{usrIn}</b>
          </small>
          <input
            className="tsc-setting-input"
            placeholder={labelUsr}
            value={usrIn}
            onInput={e => {
              setUsrIn(e.target.value);
              if (e.target.value) lsSet("usrIn", e.target.value);
            }}
            onKeyUp={e => settingUpdate(conn, "usrIn", e.target.value, e.keyCode)}
          />
        </>
      )}
      <br />
      <button className="tsc-setting-connect" onClick={connect}>
        CONNECT TO THE ROOM
      </button>
      <br />
      <div className="tsc-foot">
        by&nbsp;<a target="_blank" href="https://twitter.com/sanixdarker">
          @sanixdarker
        </a>
      </div>
    </div>
  );
};

const Board = ({ conn, setSettingsActive, usr = "", isSettingsActive }) => (
  <>
    {isSettingsActive ? (
      <SettingBoard conn={conn} setSettingsActive={setSettingsActive} usr={usr} />
    ) : (
      <MsgList conn={conn} />
    )}
  </>
);

let LAST_MESSAGE = "";
let LAST_MESSAGE_TIME = 0;

export default function App({ conn, usr }) {
  const [isActive, setActive] = useState(true);
  const [isSettingsActive, setSettingsActive] = useState(false);
  const [txtMsg, setTxtMsg] = useState("");
  const inputRef = useRef();

  /* Auto‑join stored room once */
  useEffect(() => {
    const rk = lsGet("roomKey");
    if (rk) cleanConnectRoom(conn, rk);
  }, [conn]);

  /* Keep focus in textbox */
  useEffect(() => inputRef.current?.focus(), [txtMsg]);

  const publish = useCallback(() => {
    if (!txtMsg) return;
    if (!lsGet("usrIn")) return alert("Please set up your username.");
    if (!lsGet("roomKey")) return alert("Please set up your roomKey.");

    if (txtMsg !== LAST_MESSAGE || Date.now() - LAST_MESSAGE_TIME > 1e4) {
      LAST_MESSAGE = txtMsg;
      LAST_MESSAGE_TIME = Date.now();

      const msgpayload = {
        author: escapeHTML(lsGet("usrIn")).substring(0, 13),
        message: escapeHTML(txtMsg).substring(0, 120)
      };
      conn.send(
        jString({ action: "publish", topic: formatRoomKey(lsGet("roomKey")), message: jString(msgpayload) })
      );
    }
    setTxtMsg("");
  }, [txtMsg, conn]);

  const onKey = e => (e.key === "Enter" ? publish() : void 0);

  const ToggleButton = () => (
    <button onClick={() => setActive(!isActive)} className={`tsc-toggle-button ${!isActive ? "tsc-hide-button" : ""}`}>
      {isActive ? "HIDE" : "SHOW"} TIDI BOX
    </button>
  );

  const EmojiBox = () => (
    <div className="tsc-emojibox">
      {EMOJI_EXPRESSIONS.map((e, i) => (
        <button key={i} onClick={() => setTxtMsg(p => p + e)}>
          {e}
        </button>
      ))}
    </div>
  );

  const TextBox = () => (
    <input
      id="tsc-text-box"
      type="text"
      maxLength="130"
      value={txtMsg}
      autoComplete="off"
      onInput={e => setTxtMsg(e.target.value)}
      onKeyUp={onKey}
      ref={inputRef}
      placeholder="Enter your message here"
    />
  );

  return (
    <div id="tsc-ttspch-box">
      <div className={isActive ? "tsc-hide" : "tsc-show"}>
        <Board conn={conn} setSettingsActive={setSettingsActive} isSettingsActive={isSettingsActive} usr={usr} />
        {!isSettingsActive && (
          <>
            <EmojiBox />
            <TextBox />
          </>
        )}
      </div>
      <ToggleButton />
      {isActive && (
        <button onClick={() => setSettingsActive(s => !s)} aria-label="settings">
          ⚙️
        </button>
      )}
    </div>
  );
}
