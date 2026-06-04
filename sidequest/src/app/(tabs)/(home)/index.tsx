import { useState, useRef, useEffect } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const QUESTS = [
  { id: 1, emoji: "🥣", title: "Breakfast Champion", category: "Food",    xp: 150, difficulty: "EASY",   desc: "Find a box of sugary cereal in the wild. Store shelf or someone's pantry counts." },
  { id: 2, emoji: "☕", title: "Caffeine Fix",        category: "Explore", xp: 200, difficulty: "EASY",   desc: "Photograph a local coffee shop sign. Bonus points if it's an indie spot." },
  { id: 3, emoji: "🐈", title: "Urban Wildlife",      category: "Nature",  xp: 350, difficulty: "MEDIUM", desc: "Find and photograph a cat roaming outside. No indoor cats — they must be free." },
  { id: 4, emoji: "🌆", title: "Golden Hour",         category: "Photo",   xp: 500, difficulty: "HARD",   desc: "Capture a building lit by golden hour light. Timing is everything." },
  { id: 5, emoji: "📮", title: "Snail Mail Lives",    category: "Explore", xp: 180, difficulty: "EASY",   desc: "Find a mailbox or post office. Bonus XP if you actually mail something." },
  { id: 6, emoji: "🌳", title: "Bark Whisperer",      category: "Nature",  xp: 275, difficulty: "MEDIUM", desc: "Photograph a tree bigger than you can hug. Attempt the hug anyway." },
  { id: 7, emoji: "🎨", title: "Street Art Hunter",   category: "Photo",   xp: 420, difficulty: "MEDIUM", desc: "Find a graffiti mural or street art piece at least 4 feet tall." },
  { id: 8, emoji: "🛒", title: "Grocery Gauntlet",    category: "Food",    xp: 120, difficulty: "EASY",   desc: "Find the longest checkout queue at a grocery store. Document the suffering." },
];

const AVATAR_OPTIONS = [
  { id: "rocket",   emoji: "🚀" },
  { id: "wolf",     emoji: "🐺" },
  { id: "ghost",    emoji: "👻" },
  { id: "alien",    emoji: "👾" },
  { id: "ninja",    emoji: "🥷" },
  { id: "dragon",   emoji: "🐉" },
  { id: "wizard",   emoji: "🧙" },
  { id: "robot",    emoji: "🤖" },
  { id: "fox",      emoji: "🦊" },
  { id: "bear",     emoji: "🐻" },
  { id: "cat",      emoji: "😸" },
  { id: "skull",    emoji: "💀" },
  { id: "fire",     emoji: "🔥" },
  { id: "lightning",emoji: "⚡" },
  { id: "crown",    emoji: "👑" },
  { id: "diamond",  emoji: "💎" },
  { id: "sword",    emoji: "⚔️" },
  { id: "shield",   emoji: "🛡️" },
  { id: "star",     emoji: "⭐" },
  { id: "comet",    emoji: "☄️" },
];

const DIFF_STYLE = {
  EASY:   { bg: "#0b2118", color: "#34c97a", border: "#164d30" },
  MEDIUM: { bg: "#241a00", color: "#f0a030", border: "#4a3400" },
  HARD:   { bg: "#240a14", color: "#f06090", border: "#4a1428" },
};

const CAT_COLOR = { Food: "#f06090", Explore: "#30d5f0", Nature: "#34c97a", Photo: "#f0a030" };

// ─── AI VERIFY ───────────────────────────────────────────────────────────────

async function verifyQuestImage(base64, mediaType, quest) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: `You are verifying a photo for the quest "${quest.title}": "${quest.desc}". Respond ONLY with JSON: {"verified":true/false,"confidence":0-100,"reason":"one sentence","detected":"what you see"}` }
          ]
        }]
      })
    });
    const data = await res.json();
    const raw = data.content?.map(b => b.text || "").join("") || "";
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return { verified: false, confidence: 0, reason: "Verification unavailable.", detected: "Unknown" };
  }
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function App() {
  // Onboarding
  const [onboarded, setOnboarded]   = useState(false);
  const [username, setUsername]     = useState("");
  const [avatar, setAvatar]         = useState(AVATAR_OPTIONS[0]);
  const [obStep, setObStep]         = useState(0); // 0=name, 1=avatar

  // Core state
  const [tab, setTab]               = useState("home");
  const [quests, setQuests]         = useState(QUESTS.map(q => ({ ...q, completed: false })));
  const [totalXP, setTotalXP]       = useState(0);
  const [streak]                    = useState(0);
  const [filterCat, setFilterCat]   = useState("All");

  // XP celebration
  const [xpFlash, setXpFlash]       = useState(null);

  // Quest submit flow
  const [activeQuest, setActiveQuest] = useState(null);
  const [submitStep, setSubmitStep]   = useState(null); // "detail"|"photo"|"preview"|"verifying"|"result"
  const [capturedImg, setCapturedImg] = useState(null);
  const [capturedType, setCapturedType] = useState("image/jpeg");
  const [verifyRes, setVerifyRes]     = useState(null);

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName]     = useState("");
  const [editAvatar, setEditAvatar] = useState(null);

  // Refs for hidden inputs
  const cameraInputRef  = useRef(null);
  const galleryInputRef = useRef(null);
  const profileImgRef   = useRef(null);

  const level      = Math.max(1, Math.floor(totalXP / 300) + 1);
  const xpInLevel  = totalXP % 300;
  const xpProgress = (xpInLevel / 300) * 100;
  const xpToNext   = 300 - xpInLevel;
  const done       = quests.filter(q => q.completed);
  const active     = quests.filter(q => !q.completed);
  const filtered   = filterCat === "All" ? active : active.filter(q => q.category === filterCat);

  // ── helpers ──

  const openQuest = (q) => { setActiveQuest(q); setSubmitStep("detail"); setCapturedImg(null); setVerifyRes(null); };
  const closeQuest = () => { setActiveQuest(null); setSubmitStep(null); setCapturedImg(null); setVerifyRes(null); };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = ev => { setCapturedImg(ev.target.result); setSubmitStep("preview"); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const runVerify = async () => {
    setSubmitStep("verifying");
    const base64 = capturedImg.split(",")[1];
    const result = await verifyQuestImage(base64, capturedType, activeQuest);
    setVerifyRes(result);
    setSubmitStep("result");
  };

  const claimReward = () => {
    setQuests(prev => prev.map(q => q.id === activeQuest.id ? { ...q, completed: true } : q));
    const gained = activeQuest.xp;
    setTotalXP(prev => prev + gained);
    setXpFlash({ xp: gained, quest: activeQuest });
    closeQuest();
    setTimeout(() => setXpFlash(null), 2800);
  };

  // ── onboarding ──

  if (!onboarded) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
          *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
          html,body,#root{background:#08080f;width:100%;min-height:100vh;}
          input{outline:none;font-family:inherit;}
        `}</style>
        <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", background:"#08080f", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 28px" }}>

          {obStep === 0 && (
            <div style={{ width:"100%", maxWidth:360, textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:20 }}>⚔️</div>
              <div style={{ fontSize:26, fontWeight:800, color:"#f0f0ff", marginBottom:8, letterSpacing:-0.5 }}>Welcome to Sidequest</div>
              <div style={{ fontSize:14, color:"#4a4a6a", marginBottom:36, lineHeight:1.6 }}>Complete real-world challenges, earn XP, and compete with friends.</div>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Pick a username"
                maxLength={18}
                style={{ width:"100%", background:"#111120", border:"1px solid #1e1e38", borderRadius:14, padding:"15px 18px", fontSize:16, color:"#f0f0ff", marginBottom:14 }}
              />
              <button
                onClick={() => username.trim().length >= 2 && setObStep(1)}
                style={{ width:"100%", background: username.trim().length >= 2 ? "#34c97a" : "#1a1a2e", border:"none", borderRadius:14, padding:"16px", fontSize:15, fontWeight:700, color: username.trim().length >= 2 ? "#05140d" : "#2a2a45", cursor: username.trim().length >= 2 ? "pointer" : "default", transition:"all .2s" }}
              >
                Continue →
              </button>
            </div>
          )}

          {obStep === 1 && (
            <div style={{ width:"100%", maxWidth:380, textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:800, color:"#f0f0ff", marginBottom:6, letterSpacing:-0.5 }}>Choose your avatar</div>
              <div style={{ fontSize:13, color:"#4a4a6a", marginBottom:24 }}>You can change this anytime</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:28 }}>
                {AVATAR_OPTIONS.map(a => (
                  <div key={a.id} onClick={() => setAvatar(a)}
                    style={{ height:58, background: avatar.id === a.id ? "#0e2a1c" : "#111120", border:`2px solid ${avatar.id === a.id ? "#34c97a" : "#1a1a30"}`, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, cursor:"pointer", transition:"all .15s" }}>
                    {a.emoji}
                  </div>
                ))}
              </div>
              <div style={{ fontSize:48, marginBottom:10 }}>{avatar.emoji}</div>
              <div style={{ fontSize:15, color:"#888899", marginBottom:24 }}>{username}</div>
              <button
                onClick={() => setOnboarded(true)}
                style={{ width:"100%", background:"#34c97a", border:"none", borderRadius:14, padding:"16px", fontSize:15, fontWeight:700, color:"#05140d", cursor:"pointer" }}>
                Let's Go ⚡
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  // ── main app ──

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
        html,body,#root{background:#08080f;width:100%;min-height:100vh;}
        ::-webkit-scrollbar{display:none;}
        input,textarea{outline:none;font-family:inherit;}
        @keyframes popIn{0%{transform:translate(-50%,-50%) scale(.6);opacity:0}70%{transform:translate(-50%,-50%) scale(1.05)}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
        .qi:active{opacity:.7;transform:scale(.99);}
        .tap:active{opacity:.7;}
      `}</style>

      <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", background:"#08080f", color:"#e0e0f0", minHeight:"100vh", width:"100%", display:"flex", flexDirection:"column", position:"relative" }}>

        {/* ── XP FLASH ── */}
        {xpFlash && (
          <div style={{ position:"fixed", top:"50%", left:"50%", zIndex:9999, animation:"popIn .35s cubic-bezier(.34,1.56,.64,1) forwards", background:"#0a1e12", border:"2px solid #34c97a", borderRadius:24, padding:"28px 44px", textAlign:"center", pointerEvents:"none" }}>
            <div style={{ fontSize:44, marginBottom:8 }}>{xpFlash.quest.emoji}</div>
            <div style={{ fontSize:11, color:"#34c97a", fontWeight:700, letterSpacing:2, marginBottom:6 }}>QUEST COMPLETE</div>
            <div style={{ fontSize:18, fontWeight:700, color:"#f0f0ff", marginBottom:10 }}>{xpFlash.quest.title}</div>
            <div style={{ fontSize:40, fontWeight:800, color:"#34c97a" }}>+{xpFlash.xp} XP</div>
          </div>
        )}

        {/* ── QUEST SHEET ── */}
        {activeQuest && submitStep && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:800, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={closeQuest}>
            <div style={{ background:"#0d0d1c", borderRadius:"22px 22px 0 0", padding:"18px 22px 40px", width:"100%", maxWidth:460, animation:"slideUp .25s ease" }} onClick={e => e.stopPropagation()}>
              <div style={{ width:36, height:4, background:"#1e1e38", borderRadius:2, margin:"0 auto 22px" }} />

              {/* DETAIL */}
              {submitStep === "detail" && (
                <>
                  <div style={{ textAlign:"center", marginBottom:18 }}>
                    <div style={{ fontSize:52, marginBottom:12 }}>{activeQuest.emoji}</div>
                    <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:14 }}>
                      <span style={{ ...tagStyle(DIFF_STYLE[activeQuest.difficulty]) }}>{activeQuest.difficulty}</span>
                      <span style={{ ...tagStyle({ bg:"rgba(48,213,240,.1)", color:"#30d5f0", border:"rgba(48,213,240,.25)" }) }}>{activeQuest.category}</span>
                    </div>
                    <div style={{ fontSize:21, fontWeight:800, color:"#f0f0ff", marginBottom:8, letterSpacing:-0.3 }}>{activeQuest.title}</div>
                    <div style={{ fontSize:13, color:"#555575", lineHeight:1.6, marginBottom:16 }}>{activeQuest.desc}</div>
                    <div style={{ fontSize:34, fontWeight:800, color:"#34c97a" }}>+{activeQuest.xp} <span style={{ fontSize:14, fontWeight:600, color:"#2a6a44" }}>XP</span></div>
                  </div>
                  <div style={{ background:"#0a0a18", border:"1px solid #1a1a30", borderRadius:12, padding:"11px 14px", marginBottom:18, display:"flex", gap:10, alignItems:"center" }}>
                    <span style={{ fontSize:18 }}>🤖</span>
                    <span style={{ fontSize:12, color:"#44445a", lineHeight:1.5 }}><span style={{ color:"#30d5f0", fontWeight:600 }}>AI checks your photo</span> to confirm you completed the quest.</span>
                  </div>
                  <button className="tap" onClick={() => setSubmitStep("photo")}
                    style={{ ...btnStyle("#34c97a","#05140d"), marginBottom:10 }}>
                    📷 Submit Photo
                  </button>
                  <button className="tap" onClick={closeQuest} style={btnStyle("transparent","#444460","1px solid #1e1e38")}> Cancel </button>
                </>
              )}

              {/* PHOTO CHOICE */}
              {submitStep === "photo" && (
                <>
                  <div style={{ fontSize:14, fontWeight:700, color:"#888899", textAlign:"center", marginBottom:24, letterSpacing:1 }}>HOW DO YOU WANT TO SUBMIT?</div>
                  <input ref={cameraInputRef}  type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={handleImageFile} />
                  <input ref={galleryInputRef} type="file" accept="image/*"                        style={{ display:"none" }} onChange={handleImageFile} />
                  <button className="tap" onClick={() => cameraInputRef.current?.click()}
                    style={{ ...btnStyle("#34c97a","#05140d"), marginBottom:12, fontSize:16 }}>
                    📸 Take a Photo Now
                  </button>
                  <button className="tap" onClick={() => galleryInputRef.current?.click()}
                    style={{ ...btnStyle("#1e1e38","#c0c0d8"), marginBottom:12 }}>
                    🖼️ Choose from Gallery
                  </button>
                  <button className="tap" onClick={() => setSubmitStep("detail")} style={btnStyle("transparent","#333350","1px solid #1a1a30")}> ← Back </button>
                </>
              )}

              {/* PREVIEW */}
              {submitStep === "preview" && capturedImg && (
                <>
                  <div style={{ fontSize:12, fontWeight:700, color:"#555575", textAlign:"center", marginBottom:14, letterSpacing:1 }}>PREVIEW</div>
                  <img src={capturedImg} alt="submission" style={{ width:"100%", height:220, objectFit:"cover", borderRadius:16, marginBottom:14 }} />
                  <div style={{ fontSize:12, color:"#444460", textAlign:"center", marginBottom:18 }}>
                    Quest: <span style={{ color:"#c0c0d8", fontWeight:600 }}>{activeQuest.title}</span>
                  </div>
                  <button className="tap" onClick={runVerify} style={{ ...btnStyle("#30d5f0","#03141a"), marginBottom:10 }}>
                    🤖 Verify with AI
                  </button>
                  <button className="tap" onClick={() => setSubmitStep("photo")} style={btnStyle("transparent","#444460","1px solid #1a1a30")}>Retake / Choose Different</button>
                </>
              )}

              {/* VERIFYING */}
              {submitStep === "verifying" && (
                <div style={{ textAlign:"center", padding:"24px 0 12px" }}>
                  <div style={{ fontSize:44, marginBottom:14, animation:"blink 1.2s infinite" }}>🤖</div>
                  <div style={{ fontSize:16, fontWeight:700, color:"#30d5f0", marginBottom:6 }}>Analyzing your photo…</div>
                  <div style={{ fontSize:12, color:"#333350", marginBottom:28 }}>Claude is checking for quest completion</div>
                  <div style={{ width:32, height:32, border:"3px solid #1a1a30", borderTopColor:"#34c97a", borderRadius:"50%", margin:"0 auto", animation:"spin .8s linear infinite" }} />
                </div>
              )}

              {/* RESULT */}
              {submitStep === "result" && verifyRes && (
                <>
                  {capturedImg && <img src={capturedImg} alt="submission" style={{ width:"100%", height:160, objectFit:"cover", borderRadius:14, marginBottom:14 }} />}
                  <div style={{ background: verifyRes.verified ? "#061610" : "#160608", border:`1px solid ${verifyRes.verified ? "#153d25" : "#3d1520"}`, borderRadius:13, padding:"14px 16px", marginBottom:16 }}>
                    <div style={{ fontSize:15, fontWeight:700, color: verifyRes.verified ? "#34c97a" : "#f06090", marginBottom:5 }}>
                      {verifyRes.verified ? "✅ Quest Verified!" : "❌ Verification Failed"}
                    </div>
                    <div style={{ fontSize:12, color:"#666680", lineHeight:1.5, marginBottom:8 }}>{verifyRes.reason}</div>
                    {verifyRes.detected && <div style={{ fontSize:11, color:"#333350" }}>Detected: <span style={{ color:"#55556a" }}>{verifyRes.detected}</span></div>}
                    <div style={{ background:"#0d0d20", borderRadius:5, height:5, overflow:"hidden", marginTop:10 }}>
                      <div style={{ height:"100%", width:`${verifyRes.confidence}%`, background: verifyRes.verified ? "#34c97a" : "#f06090", borderRadius:5, transition:"width .8s ease" }} />
                    </div>
                    <div style={{ fontSize:10, color:"#2a2a40", marginTop:4 }}>Confidence: {verifyRes.confidence}%</div>
                  </div>
                  {verifyRes.verified ? (
                    <>
                      <div style={{ textAlign:"center", marginBottom:14 }}>
                        <div style={{ fontSize:32, fontWeight:800, color:"#34c97a" }}>+{activeQuest.xp} XP</div>
                      </div>
                      <button className="tap" onClick={claimReward} style={{ ...btnStyle("#34c97a","#05140d"), marginBottom:10 }}>🎉 Claim Reward</button>
                    </>
                  ) : (
                    <>
                      <button className="tap" onClick={() => setSubmitStep("photo")} style={{ ...btnStyle("#34c97a","#05140d"), marginBottom:10 }}>📷 Try Again</button>
                      <button className="tap" onClick={closeQuest} style={btnStyle("transparent","#444460","1px solid #1a1a30")}>Give Up (for now)</button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── PROFILE EDIT SHEET ── */}
        {editingProfile && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:800, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={() => setEditingProfile(false)}>
            <div style={{ background:"#0d0d1c", borderRadius:"22px 22px 0 0", padding:"18px 22px 44px", width:"100%", maxWidth:460, animation:"slideUp .25s ease", maxHeight:"80vh", overflowY:"auto" }} onClick={e => e.stopPropagation()}>
              <div style={{ width:36, height:4, background:"#1e1e38", borderRadius:2, margin:"0 auto 22px" }} />
              <div style={{ fontSize:15, fontWeight:700, color:"#888899", textAlign:"center", marginBottom:20, letterSpacing:1 }}>EDIT PROFILE</div>
              <div style={{ fontSize:11, color:"#444460", letterSpacing:1, marginBottom:8 }}>USERNAME</div>
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                maxLength={18}
                style={{ width:"100%", background:"#111120", border:"1px solid #1e1e38", borderRadius:12, padding:"13px 16px", fontSize:15, color:"#f0f0ff", marginBottom:20 }}
              />
              <div style={{ fontSize:11, color:"#444460", letterSpacing:1, marginBottom:12 }}>AVATAR</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:9, marginBottom:24 }}>
                {AVATAR_OPTIONS.map(a => (
                  <div key={a.id} onClick={() => setEditAvatar(a)}
                    style={{ height:52, background: editAvatar?.id === a.id ? "#0e2a1c" : "#111120", border:`2px solid ${editAvatar?.id === a.id ? "#34c97a" : "#1a1a30"}`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, cursor:"pointer" }}>
                    {a.emoji}
                  </div>
                ))}
              </div>
              <button className="tap" onClick={() => {
                if (editName.trim().length >= 2) setUsername(editName.trim());
                if (editAvatar) setAvatar(editAvatar);
                setEditingProfile(false);
              }} style={btnStyle("#34c97a","#05140d")}>Save Changes</button>
            </div>
          </div>
        )}

        {/* ── SCROLL AREA ── */}
        <div style={{ flex:1, overflowY:"auto", paddingBottom:80 }}>

          {/* ══════ HOME ══════ */}
          {tab === "home" && (
            <>
              {/* Header */}
              <div style={{ padding:"52px 22px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                  <div>
                    <div style={{ fontSize:12, color:"#333350", letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>Today's quests</div>
                    <div style={{ fontSize:24, fontWeight:800, color:"#f0f0ff", letterSpacing:-0.5 }}>
                      {avatar.emoji} {username}
                    </div>
                  </div>
                  <div style={{ background:"linear-gradient(135deg,#e0306a,#7030d0)", borderRadius:20, padding:"7px 14px", fontSize:12, fontWeight:700, color:"#fff" }}>
                    LVL {level}
                  </div>
                </div>
                {/* XP bar */}
                <div style={{ background:"#111120", borderRadius:6, height:6, overflow:"hidden", marginBottom:5 }}>
                  <div style={{ height:"100%", width:`${xpProgress}%`, background:"linear-gradient(90deg,#34c97a,#30d5f0)", borderRadius:6, transition:"width .6s ease" }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#333350" }}>
                  <span>{totalXP.toLocaleString()} XP</span>
                  <span>{xpToNext} to Level {level + 1}</span>
                </div>
              </div>

              {/* Streak pill */}
              {streak > 0 && (
                <div style={{ margin:"0 22px 18px", background:"#1c0e00", border:"1px solid #3a1e00", borderRadius:14, padding:"12px 16px", display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:24 }}>🔥</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#f0a030" }}>{streak}-Day Streak</div>
                    <div style={{ fontSize:11, color:"#5a3a10", marginTop:1 }}>Complete 1 quest today to keep it alive</div>
                  </div>
                  <div style={{ marginLeft:"auto", fontSize:28, fontWeight:800, color:"#f0a030" }}>{streak}</div>
                </div>
              )}

              {/* Empty state when no streak yet */}
              {streak === 0 && (
                <div style={{ margin:"0 22px 18px", background:"#0d0d1c", border:"1px solid #1a1a30", borderRadius:14, padding:"14px 16px" }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"#c0c0d8", marginBottom:3 }}>Start your streak</div>
                  <div style={{ fontSize:12, color:"#333350" }}>Complete your first quest to begin a streak 🔥</div>
                </div>
              )}

              {/* Category filters */}
              <div style={{ display:"flex", gap:7, padding:"0 22px", marginBottom:16, overflowX:"auto" }}>
                {["All","Food","Explore","Nature","Photo"].map(cat => (
                  <div key={cat} onClick={() => setFilterCat(cat)}
                    style={{ background: filterCat===cat ? (CAT_COLOR[cat]||"#34c97a") : "#0d0d1c", color: filterCat===cat ? "#08080f" : "#444460", border:`1px solid ${filterCat===cat ? (CAT_COLOR[cat]||"#34c97a") : "#1a1a30"}`, borderRadius:20, padding:"6px 14px", fontSize:12, fontWeight: filterCat===cat ? 700 : 500, cursor:"pointer", whiteSpace:"nowrap" }}>
                    {cat}
                  </div>
                ))}
              </div>

              {/* Quest list */}
              <div style={{ padding:"0 22px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"#333350" }}>Active</div>
                  <div style={{ fontSize:11, color:"#2a2a40" }}>{filtered.length} quests</div>
                </div>

                {filtered.length === 0 && (
                  <div style={{ textAlign:"center", padding:"32px 0", color:"#252535", fontSize:13 }}>All done in this category!</div>
                )}

                {filtered.map(q => (
                  <div key={q.id} className="qi" onClick={() => openQuest(q)}
                    style={{ background:"#0d0d1c", border:"1px solid #1a1a2e", borderRadius:16, padding:"14px 15px", marginBottom:9, display:"flex", alignItems:"center", gap:13, cursor:"pointer", transition:"all .1s" }}>
                    <div style={{ width:44, height:44, background:"#141428", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{q.emoji}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:"#e0e0f0", marginBottom:2 }}>{q.title}</div>
                      <div style={{ fontSize:11, color:"#33334a", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{q.desc}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:14, fontWeight:800, color:"#f06090", marginBottom:4 }}>+{q.xp}</div>
                      <span style={tagStyle(DIFF_STYLE[q.difficulty])}>{q.difficulty}</span>
                    </div>
                  </div>
                ))}

                {done.length > 0 && (
                  <>
                    <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"#252535", margin:"20px 0 10px" }}>Completed ({done.length})</div>
                    {done.map(q => (
                      <div key={q.id} style={{ background:"#0a0a18", borderRadius:14, padding:"12px 14px", marginBottom:8, display:"flex", alignItems:"center", gap:12, opacity:0.45 }}>
                        <div style={{ fontSize:18 }}>{q.emoji}</div>
                        <div style={{ flex:1, fontSize:13, fontWeight:600, color:"#e0e0f0", textDecoration:"line-through" }}>{q.title}</div>
                        <div style={{ fontSize:12, fontWeight:700, color:"#34c97a" }}>+{q.xp} ✓</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}

          {/* ══════ LEADERBOARD ══════ */}
          {tab === "leaderboard" && (
            <div style={{ padding:"52px 22px 20px" }}>
              <div style={{ fontSize:12, color:"#333350", letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>Rankings</div>
              <div style={{ fontSize:24, fontWeight:800, color:"#f0f0ff", letterSpacing:-0.5, marginBottom:28 }}>Leaderboard</div>

              {/* Your card */}
              <div style={{ background:"#0d0d1c", border:"1px solid #1e1e38", borderRadius:18, padding:"20px", marginBottom:16, textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:8 }}>{avatar.emoji}</div>
                <div style={{ fontSize:17, fontWeight:700, color:"#f0f0ff", marginBottom:2 }}>{username}</div>
                <div style={{ fontSize:13, color:"#444460", marginBottom:16 }}>Level {level} · {totalXP.toLocaleString()} XP</div>
                <div style={{ display:"flex", gap:1 }}>
                  <div style={{ flex:1, background:"#141424", borderRadius:"10px 0 0 10px", padding:"12px 0", textAlign:"center" }}>
                    <div style={{ fontSize:18, fontWeight:800, color:"#30d5f0" }}>{done.length}</div>
                    <div style={{ fontSize:10, color:"#333350", letterSpacing:1, textTransform:"uppercase", marginTop:2 }}>Quests</div>
                  </div>
                  <div style={{ flex:1, background:"#141424", padding:"12px 0", textAlign:"center" }}>
                    <div style={{ fontSize:18, fontWeight:800, color:"#f0a030" }}>{streak}</div>
                    <div style={{ fontSize:10, color:"#333350", letterSpacing:1, textTransform:"uppercase", marginTop:2 }}>Streak</div>
                  </div>
                  <div style={{ flex:1, background:"#141424", borderRadius:"0 10px 10px 0", padding:"12px 0", textAlign:"center" }}>
                    <div style={{ fontSize:18, fontWeight:800, color:"#34c97a" }}>{totalXP.toLocaleString()}</div>
                    <div style={{ fontSize:10, color:"#333350", letterSpacing:1, textTransform:"uppercase", marginTop:2 }}>XP</div>
                  </div>
                </div>
              </div>

              <div style={{ background:"#0d0d1c", border:"1px solid #1a1a2e", borderRadius:16, padding:"18px", textAlign:"center" }}>
                <div style={{ fontSize:28, marginBottom:10 }}>🔗</div>
                <div style={{ fontSize:14, fontWeight:700, color:"#c0c0d8", marginBottom:6 }}>Invite Friends</div>
                <div style={{ fontSize:12, color:"#333350", lineHeight:1.6 }}>Leaderboards unlock when you add friends. Share your invite link to compete!</div>
                <button className="tap" style={{ ...btnStyle("#1e1e38","#c0c0d8"), marginTop:16, fontSize:13 }}>
                  Copy Invite Link
                </button>
              </div>
            </div>
          )}

          {/* ══════ PROFILE ══════ */}
          {tab === "profile" && (
            <div style={{ paddingBottom:20 }}>
              {/* Hero */}
              <div style={{ padding:"52px 22px 0", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center" }}>
                <div style={{ position:"relative", marginBottom:14 }}>
                  <div style={{ width:88, height:88, background:"linear-gradient(135deg,#1a0830,#081a30)", border:"2px solid #e0306a", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40 }}>
                    {avatar.emoji}
                  </div>
                </div>
                <div style={{ fontSize:22, fontWeight:800, color:"#f0f0ff", marginBottom:3, letterSpacing:-0.3 }}>{username}</div>
                <div style={{ fontSize:12, color:"#333350", marginBottom:14 }}>Member since {new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"})}</div>
                <div style={{ background:"#0a0a1e", border:"1px solid #1a1a38", borderRadius:12, padding:"6px 16px", fontSize:12, color:"#30d5f0", fontWeight:600 }}>
                  Level {level} · {totalXP.toLocaleString()} XP
                </div>
              </div>

              {/* XP progress */}
              <div style={{ margin:"20px 22px 0" }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#2a2a40", marginBottom:5 }}>
                  <span>Level {level}</span><span>Level {level+1}</span>
                </div>
                <div style={{ background:"#111120", borderRadius:6, height:8, overflow:"hidden", marginBottom:4 }}>
                  <div style={{ height:"100%", width:`${xpProgress}%`, background:"linear-gradient(90deg,#34c97a,#30d5f0)", borderRadius:6, transition:"width .6s ease" }} />
                </div>
                <div style={{ fontSize:11, color:"#2a2a40", textAlign:"right" }}>{xpToNext} XP to next level</div>
              </div>

              {/* Stats */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, margin:"20px 22px" }}>
                {[
                  { val: totalXP.toLocaleString(), lbl:"Total XP",    color:"#30d5f0" },
                  { val: done.length,               lbl:"Completed",   color:"#34c97a" },
                  { val: `${streak}d`,              lbl:"Streak",      color:"#f0a030" },
                  { val: level,                     lbl:"Level",       color:"#e0306a" },
                  { val: active.length,             lbl:"Remaining",   color:"#888899" },
                  { val: `${Math.round((done.length/quests.length)*100)}%`, lbl:"Done", color:"#a060f0" },
                ].map((s,i) => (
                  <div key={i} style={{ background:"#0d0d1c", border:"1px solid #1a1a2e", borderRadius:13, padding:"14px 10px", textAlign:"center" }}>
                    <div style={{ fontSize:20, fontWeight:800, color:s.color, marginBottom:4 }}>{s.val}</div>
                    <div style={{ fontSize:10, color:"#2a2a40", letterSpacing:1, textTransform:"uppercase" }}>{s.lbl}</div>
                  </div>
                ))}
              </div>

              {/* Choose avatar section */}
              <div style={{ margin:"0 22px 20px" }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#333350", letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Avatar</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
                  {AVATAR_OPTIONS.map(a => (
                    <div key={a.id} onClick={() => setAvatar(a)}
                      style={{ height:52, background: avatar.id===a.id ? "#0e2a1c" : "#0d0d1c", border:`2px solid ${avatar.id===a.id ? "#34c97a" : "#1a1a2e"}`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, cursor:"pointer", transition:"all .12s" }}>
                      {a.emoji}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent completions */}
              {done.length > 0 && (
                <div style={{ margin:"0 22px 20px" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#333350", letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Completed Quests</div>
                  <div style={{ background:"#0d0d1c", border:"1px solid #1a1a2e", borderRadius:16, overflow:"hidden" }}>
                    {done.map((q, i) => (
                      <div key={q.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 15px", borderBottom: i < done.length-1 ? "1px solid #111122" : "none" }}>
                        <span style={{ fontSize:20 }}>{q.emoji}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:"#b0b0c8" }}>{q.title}</div>
                          <div style={{ fontSize:11, color:"#2a2a40", marginTop:1 }}>{q.category}</div>
                        </div>
                        <div style={{ fontSize:13, fontWeight:700, color:"#34c97a" }}>+{q.xp}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Menu */}
              <div style={{ margin:"0 22px" }}>
                {[
                  { emoji:"✏️", label:"Edit Profile",   action: () => { setEditName(username); setEditAvatar(avatar); setEditingProfile(true); } },
                  { emoji:"🔔", label:"Notifications",  action: () => {} },
                  { emoji:"👥", label:"Friends",         action: () => setTab("leaderboard") },
                  { emoji:"⚙️", label:"Settings",        action: () => {} },
                ].map((btn, i) => (
                  <div key={i} className="tap" onClick={btn.action}
                    style={{ display:"flex", alignItems:"center", gap:13, background:"#0d0d1c", border:"1px solid #1a1a2e", borderRadius:13, padding:"15px 16px", marginBottom:9, cursor:"pointer" }}>
                    <span style={{ fontSize:17 }}>{btn.emoji}</span>
                    <span style={{ fontSize:14, fontWeight:600, color:"#b0b0c8" }}>{btn.label}</span>
                    <span style={{ marginLeft:"auto", color:"#222235", fontSize:18 }}>›</span>
                  </div>
                ))}
                <button className="tap" onClick={() => { setOnboarded(false); setTotalXP(0); setQuests(QUESTS.map(q=>({...q,completed:false}))); setTab("home"); }}
                  style={{ width:"100%", background:"rgba(240,60,90,.05)", border:"1px solid rgba(240,60,90,.2)", borderRadius:13, padding:"15px", fontSize:14, fontWeight:600, color:"#f03c5a", cursor:"pointer", marginBottom:9 }}>
                  🚪 Log Out
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ── TAB BAR ── */}
        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(8,8,15,0.97)", borderTop:"1px solid #111120", display:"flex", paddingBottom:14, zIndex:500 }}>
          {[
            { id:"home",        emoji:"⚔️", label:"Quests"  },
            { id:"leaderboard", emoji:"🏆", label:"Ranks"   },
            { id:"profile",     emoji:"👤", label:"Profile" },
          ].map(t => (
            <div key={t.id} onClick={() => setTab(t.id)}
              style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", paddingTop:12, cursor:"pointer", gap:3 }}>
              <span style={{ fontSize:20, opacity: tab===t.id ? 1 : 0.22, transform: tab===t.id ? "scale(1.18)" : "scale(1)", transition:"all .15s", display:"block" }}>{t.emoji}</span>
              <span style={{ fontSize:10, fontWeight: tab===t.id ? 700 : 400, color: tab===t.id ? "#34c97a" : "#252535", letterSpacing:1, textTransform:"uppercase" }}>{t.label}</span>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}

// ─── TINY HELPERS ────────────────────────────────────────────────────────────

function tagStyle({ bg, color, border }) {
  return { display:"inline-block", background:bg, color, border:`1px solid ${border}`, borderRadius:6, padding:"3px 7px", fontSize:10, fontWeight:700, letterSpacing:0.8 };
}

function btnStyle(bg, color, border) {
  return { width:"100%", background:bg, border: border || "none", borderRadius:14, padding:"15px", fontSize:14, fontWeight:700, color, cursor:"pointer", display:"block" };
}