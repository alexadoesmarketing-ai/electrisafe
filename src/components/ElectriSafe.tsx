"use client";
import { useState, useEffect, useRef } from "react";

const C = {
  royalBlue:"#1a3fa6",blue2:"#1e4fc2",blue3:"#2563eb",blueLight:"#dbeafe",blueMid:"#93c5fd",
  yellow:"#f5c400",white:"#ffffff",offWhite:"#f8fafc",
  gray100:"#f1f5f9",gray300:"#cbd5e1",gray500:"#64748b",gray700:"#334155",gray900:"#0f172a",
  red:"#dc2626",redLight:"#fee2e2",orange:"#ea580c",orangeLight:"#ffedd5",
  green:"#16a34a",greenLight:"#dcfce7",
};

// ── SPONSORED PARTNERS (Tier 1 — behind the scenes) ──
const SPONSORED = [{
  id:"onlehane", name:"OnLehane Electric LLC", init:"OL",
  phone:"(860) 310-6714", website:"https://www.onlehane.com",
  rating:5.0, reviews:94, years:15, license:"ELC-0209263-E1",
  location:"South Windsor, CT", avail:"Available 24/7",
  bg:"#1a3fa6", fg:"#ffffff",
  serviceZips:[
    "06074","06001","06002","06010","06016","06019","06023","06026","06029",
    "06032","06033","06037","06040","06042","06043","06060","06062","06066",
    "06067","06070","06073","06075","06076","06078","06080","06082","06083",
    "06084","06085","06088","06089","06095","06096","06101","06103","06105",
    "06106","06107","06108","06109","06110","06111","06112","06114","06117",
    "06118","06119","06120"
  ],
}];

const ZIP_COORDS: Record<string,[number,number]> = {
  "06074":[41.8370,-72.5579],"06001":[41.9748,-72.8454],"06002":[41.8751,-72.7290],
  "06010":[41.6718,-72.9479],"06016":[41.8979,-72.5440],"06019":[41.8615,-72.8737],
  "06023":[41.7865,-72.5204],"06026":[41.9290,-72.7204],"06029":[41.9040,-72.4454],
  "06032":[41.7740,-72.8454],"06033":[41.7429,-72.5079],"06037":[41.6215,-72.7829],
  "06040":[41.7726,-72.5204],"06042":[41.7890,-72.5129],"06043":[41.7540,-72.4329],
  "06060":[41.9748,-72.9079],"06062":[41.6815,-72.8579],"06066":[41.8451,-72.4579],
  "06067":[41.7040,-72.6454],"06070":[41.8565,-72.8204],"06073":[41.7329,-72.5579],
  "06075":[41.9929,-72.4079],"06076":[41.9040,-72.3954],"06078":[41.9040,-72.7454],
  "06080":[41.8865,-72.6829],"06082":[41.9840,-72.5829],"06083":[41.8079,-72.5704],
  "06084":[41.8890,-72.4204],"06085":[41.7515,-72.8079],"06088":[41.8629,-72.5079],
  "06089":[41.8290,-72.8329],"06095":[41.8865,-72.6454],"06096":[41.9040,-72.6579],
  "06101":[41.7629,-72.6829],"06103":[41.7665,-72.6754],"06105":[41.7740,-72.7079],
  "06106":[41.7540,-72.6954],"06107":[41.7540,-72.7454],"06108":[41.7790,-72.6079],
  "06109":[41.7290,-72.6454],"06110":[41.7390,-72.7329],"06111":[41.6979,-72.7329],
  "06112":[41.7890,-72.6829],"06114":[41.7440,-72.6704],"06117":[41.7829,-72.7454],
  "06118":[41.7390,-72.6204],"06119":[41.7679,-72.7204],"06120":[41.7829,-72.6629],
};

function haversineMiles(lat1:number,lon1:number,lat2:number,lon2:number){
  const R=3958.8,dL=(lat2-lat1)*Math.PI/180,dO=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dL/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dO/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function getSponsoredForZip(zip:string){
  return SPONSORED.filter(s=>{
    if(s.serviceZips.includes(zip)) return true;
    const uc=ZIP_COORDS[zip],sc=ZIP_COORDS["06074"];
    if(!uc||!sc) return false;
    return haversineMiles(uc[0],uc[1],sc[0],sc[1])<=15;
  });
}

// ── CATEGORIES ──
const EMERGENCY_CATS = [
  {id:"burning",icon:"🔥",label:"I smell burning or see smoke",sub:"Coming from an outlet, panel, or wall"},
  {id:"shocked",icon:"⚡",label:"I got shocked or shocked someone",sub:"Contact with an outlet, switch, or appliance"},
];
const CATEGORIES = [
  {id:"outlets", icon:"🔌",label:"An outlet stopped working",             sub:"Nothing powers on, feels warm, or has sparks"},
  {id:"breakers",icon:"🗂️", label:"A breaker keeps tripping",              sub:"Power goes out in part of my home"},
  {id:"lighting",icon:"💡",label:"Lights flickering or won't turn on",    sub:"Dimming, buzzing, or switch does nothing"},
  {id:"wiring",  icon:"🔧",label:"Exposed wire or burn marks",            sub:"Scorched outlets, melted plastic, bare wire"},
  {id:"exterior",icon:"🏠",label:"Problem outside my home",               sub:"Outdoor outlets, porch lights, power entry"},
  {id:"ev",      icon:"🚗",label:"Dryer, stove, or EV charger issue",     sub:"Large appliance has no power or trips breaker"},
  {id:"safety",  icon:"🚨",label:"Smoke detector or safety device",       sub:"Beeping, GFCI won't reset, CO alarm"},
  {id:"other",   icon:"❓",label:"Not sure — let me describe it",         sub:"Something feels off, don't know where to start"},
];

// ── CHAT QUESTIONS (from artifact) with suggestion chips + free text ──
const CHAT_QUESTIONS = [
  {
    key:"description",
    q:"Describe what's happening — what do you see, hear, or smell?",
    hint:"Be as specific as you can",
    chips:["Outlet not working","Lights flickering","Burning smell","Sparks when I plug in","Breaker keeps tripping","Buzzing or humming sound","Nothing obvious — just feels off"],
    freeText:true,
    placeholder:"e.g. The outlet in my kitchen stopped working after I plugged in the toaster...",
  },
  {
    key:"location",
    q:"Where in your home is this happening?",
    hint:"Tap a room or type your own",
    chips:["Kitchen","Bathroom","Bedroom","Living room","Basement","Garage","Outside / exterior","Laundry room","Attic","Multiple areas"],
    freeText:true,
    placeholder:"e.g. Kitchen, first floor...",
  },
  {
    key:"age",
    q:"How old is your home or wiring? Approximate is fine.",
    hint:"This helps us understand what type of wiring you likely have",
    chips:["Under 10 years","10–25 years","25–40 years","40–60 years","60+ years","Not sure"],
    freeText:false,
    placeholder:"",
  },
  {
    key:"extras",
    q:"Anything else I should know? Recent work done, prior incidents, other symptoms?",
    hint:"Optional — skip if nothing else to add",
    chips:["Had recent electrical work","This happened before","Storm recently","New appliance added","No, that's everything"],
    freeText:true,
    placeholder:"Optional — any other details...",
    optional:true,
  },
];

const SEVERITY_CONFIG:Record<string,{label:string,color:string,icon:string,action:string}> = {
  EMERGENCY:{label:"Emergency", color:C.red,    icon:"🚨",action:"Shut off your main breaker now and call immediately."},
  HIGH:     {label:"High Risk", color:C.orange, icon:"⚠️",action:"Do not use this circuit. Schedule service today."},
  MODERATE: {label:"Moderate",  color:C.yellow, icon:"⚡",action:"Monitor closely. Schedule service within the week."},
  LOW:      {label:"Low Risk",  color:C.green,  icon:"✅",action:"Low immediate risk, but should still be evaluated."},
};

function buildSystemPrompt(){
  return `You are ElectriSafe AI — the diagnostic engine behind OnLehane Electric LLC (CT License ELC-0209263-E1). You think like a master electrician with 15+ years of field experience. Plain English only. No jargon unless you immediately explain it.

Return ONLY valid JSON, no markdown fences:
{
  "severity": "EMERGENCY"|"HIGH"|"MODERATE"|"LOW",
  "plain_summary": "1-2 sentences plain English. Start with 'Looks like...' or 'Based on what you told me...'",
  "likely_cause": "One sentence — most probable technical cause",
  "nec_reference": "Relevant NEC article if applicable",
  "safety_warnings": ["warning 1","warning 2"],
  "immediate_actions": ["action 1","action 2","action 3"],
  "diy_safe": true|false,
  "diy_steps": ["step 1","step 2"] or [],
  "pro_required_reason": "Why a licensed electrician is needed",
  "what_to_expect": "What the electrician will do on site",
  "estimated_scope": "Minor repair / Service call / Panel work / Full circuit upgrade / etc."
}
Rules: NEC refs must be real. Fire/electrocution risk = EMERGENCY or HIGH. CT follows NEC 2020. diy_safe only for confirmed dead circuits.`;
}

interface DiagResult {
  severity:string; plain_summary:string; likely_cause:string; nec_reference?:string;
  safety_warnings?:string[]; immediate_actions?:string[]; diy_safe:boolean;
  diy_steps?:string[]; pro_required_reason?:string; what_to_expect?:string; estimated_scope?:string;
}

const bodyText:React.CSSProperties={fontSize:14,color:C.gray700,lineHeight:1.65,margin:0};

// ── SHARED ──
function TopBar({title,step,onBack,backLabel="Back"}:{title:string;step?:string;onBack:()=>void;backLabel?:string}){
  return(
    <div style={{background:C.royalBlue,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
      <button onClick={onBack} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.7)",fontSize:13,fontWeight:600,padding:0,minWidth:48,cursor:"pointer"}}>
        {backLabel&&`‹ ${backLabel}`}
      </button>
      <div style={{textAlign:"center"}}>
        <div style={{fontWeight:800,fontSize:15,color:C.white}}>{title}</div>
        {step&&<div style={{fontSize:11,color:C.blueMid,marginTop:1}}>{step}</div>}
      </div>
      <div style={{minWidth:48,textAlign:"right"}}><span style={{fontSize:18}}>⚡</span></div>
    </div>
  );
}

function Card({title,icon,children,accent}:{title:string;icon:string;children:React.ReactNode;accent?:string}){
  return(
    <div style={{background:C.white,borderRadius:14,padding:16,marginBottom:14,borderLeft:accent?`4px solid ${accent}`:"none",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}>
        <span style={{fontSize:16}}>{icon}</span>
        <div style={{fontWeight:800,fontSize:13,color:C.gray700,textTransform:"uppercase",letterSpacing:0.5}}>{title}</div>
      </div>
      {children}
    </div>
  );
}

// ── HOME ──
function HomeScreen({onStart}:{onStart:()=>void}){
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.royalBlue} 0%,${C.blue2} 55%,${C.blue3} 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center"}}>
      <div style={{width:80,height:80,background:C.yellow,borderRadius:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,marginBottom:24,boxShadow:`0 8px 32px rgba(245,196,0,0.4)`}}>⚡</div>
      <div style={{fontSize:11,fontWeight:700,letterSpacing:3,color:C.blueMid,marginBottom:10,textTransform:"uppercase"}}>OnLehane Electric LLC</div>
      <h1 style={{fontSize:36,fontWeight:900,color:C.white,margin:"0 0 8px",lineHeight:1.1,letterSpacing:-1}}>ElectriSafe<br/><span style={{color:C.yellow}}>AI</span></h1>
      <p style={{color:C.blueMid,fontSize:15,lineHeight:1.6,margin:"0 0 40px",maxWidth:300}}>Electrical diagnostics grounded in NEC code and real field experience.</p>
      <div style={{width:"100%",maxWidth:340,background:"rgba(255,255,255,0.08)",border:`1px solid rgba(255,255,255,0.15)`,borderRadius:14,padding:"14px 18px",marginBottom:32,textAlign:"left"}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:18}}>🚨</span>
          <div style={{fontSize:12,color:"#fca5a5",lineHeight:1.5}}>
            <strong style={{color:C.white}}>Immediate danger?</strong> Sparks, burning smell, or shock — shut off your main breaker and call <strong>(860) 310-6714</strong> now.
          </div>
        </div>
      </div>
      <button onClick={onStart} style={{width:"100%",maxWidth:340,background:C.yellow,color:C.royalBlue,border:"none",borderRadius:14,padding:"16px 0",fontSize:16,fontWeight:800,boxShadow:`0 6px 24px rgba(245,196,0,0.35)`,cursor:"pointer"}}>
        Start Diagnostic →
      </button>
      <div style={{fontSize:11,color:C.blueMid,marginTop:16}}>CT License ELC-0209263-E1 · onlehane.com</div>
    </div>
  );
}

// ── CATEGORY ──
function CategoryScreen({onSelect,onBack}:{onSelect:(id:string)=>void;onBack:()=>void}){
  return(
    <div style={{minHeight:"100vh",background:C.offWhite}}>
      <TopBar title="What's happening?" step="Step 1 of 3" onBack={onBack}/>
      <div style={{padding:"20px 16px 32px"}}>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:800,color:C.red,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Is this an emergency?</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {EMERGENCY_CATS.map(cat=>(
              <button key={cat.id} onClick={()=>onSelect(cat.id)} style={{background:C.redLight,border:`1.5px solid ${C.red}`,borderRadius:14,padding:"13px 16px",display:"flex",alignItems:"center",gap:14,textAlign:"left",cursor:"pointer",width:"100%"}}>
                <div style={{width:44,height:44,background:C.red,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{cat.icon}</div>
                <div><div style={{fontSize:15,fontWeight:700,color:C.red}}>{cat.label}</div><div style={{fontSize:12,color:"#b91c1c",marginTop:2}}>{cat.sub}</div></div>
                <div style={{marginLeft:"auto",color:C.red,fontSize:18}}>›</div>
              </button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
          <div style={{flex:1,height:1,background:C.gray300}}/>
          <span style={{fontSize:11,fontWeight:700,color:C.gray500,textTransform:"uppercase",letterSpacing:0.5}}>Or select your situation</span>
          <div style={{flex:1,height:1,background:C.gray300}}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {CATEGORIES.map(cat=>(
            <button key={cat.id} onClick={()=>onSelect(cat.id)} style={{background:C.white,border:`1.5px solid ${C.gray300}`,borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,textAlign:"left",cursor:"pointer",width:"100%"}}>
              <div style={{width:44,height:44,background:C.blueLight,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{cat.icon}</div>
              <div><div style={{fontSize:15,fontWeight:700,color:C.gray900}}>{cat.label}</div><div style={{fontSize:12,color:C.gray500,marginTop:2}}>{cat.sub}</div></div>
              <div style={{marginLeft:"auto",color:C.gray300,fontSize:18}}>›</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CHAT QUESTIONS ──
function ChatScreen({category,onComplete,onBack}:{category:string;onComplete:(ans:Record<string,string>)=>void;onBack:()=>void}){
  const allCats=[...EMERGENCY_CATS,...CATEGORIES];
  const cat=allCats.find(c=>c.id===category);
  const isEmergency=category==="burning"||category==="shocked";
  const chatRef=useRef<HTMLDivElement>(null);

  type Msg={role:"ai"|"user";text:string;urgent?:boolean;qIndex?:number};
  const [messages,setMessages]=useState<Msg[]>([]);
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const [currentQ,setCurrentQ]=useState(-1);
  const [inputVal,setInputVal]=useState("");
  const [done,setDone]=useState(false);

  function addMsg(msg:Msg){ setMessages(prev=>[...prev,msg]); }

  useEffect(()=>{
    setTimeout(()=>{
      addMsg({role:"ai",text:`Got it — ${cat?.icon} ${cat?.label}. I've got a few quick questions so I can give you a real answer.`});
      if(isEmergency){
        setTimeout(()=>{
          addMsg({role:"ai",text:"⚠️ If you're in immediate danger, stop and call 911. Shut off your main breaker if safe. Then call OnLehane at (860) 310-6714.",urgent:true});
          setTimeout(()=>setCurrentQ(0),700);
        },700);
      } else {
        setTimeout(()=>setCurrentQ(0),700);
      }
    },400);
  },[]);

  useEffect(()=>{
    if(currentQ>=0&&currentQ<CHAT_QUESTIONS.length){
      const q=CHAT_QUESTIONS[currentQ];
      setTimeout(()=>{
        addMsg({role:"ai",text:q.q,qIndex:currentQ});
        setInputVal("");
      },400);
    }
  },[currentQ]);

  useEffect(()=>{
    if(chatRef.current) chatRef.current.scrollTop=chatRef.current.scrollHeight;
  },[messages,currentQ]);

  function submitAnswer(val:string){
    if(!val.trim()) return;
    const q=CHAT_QUESTIONS[currentQ];
    const newAnswers={...answers,[q.key]:val};
    setAnswers(newAnswers);
    addMsg({role:"user",text:val});
    setInputVal("");
    const next=currentQ+1;
    if(next>=CHAT_QUESTIONS.length){
      setTimeout(()=>{
        addMsg({role:"ai",text:"Perfect — that's everything I need. Relax, everything's fixable. Running the diagnostic now..."});
        setTimeout(()=>onComplete(newAnswers),1200);
      },400);
    } else {
      setCurrentQ(next);
    }
  }

  function skipOptional(){
    const q=CHAT_QUESTIONS[currentQ];
    submitAnswer("Nothing else to add");
  }

  const activeQ=currentQ>=0&&currentQ<CHAT_QUESTIONS.length?CHAT_QUESTIONS[currentQ]:null;

  return(
    <div style={{minHeight:"100vh",background:C.offWhite,display:"flex",flexDirection:"column"}}>
      <TopBar title="Tell me what's going on" step="Step 2 of 3" onBack={onBack}/>

      {/* Category pill */}
      <div style={{padding:"10px 16px 0"}}>
        <div style={{background:isEmergency?C.redLight:C.blueLight,border:isEmergency?`1.5px solid ${C.red}`:"none",borderRadius:10,padding:"8px 14px",display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:18}}>{cat?.icon}</span>
          <span style={{fontSize:13,fontWeight:700,color:isEmergency?C.red:C.royalBlue}}>{cat?.label}</span>
        </div>
      </div>

      {/* Chat bubbles */}
      <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:"14px 16px 8px",display:"flex",flexDirection:"column",gap:10}}>
        {messages.map((m,i)=>(
          <div key={i}>
            {m.role==="ai"&&(
              <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:2}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:C.royalBlue,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:13}}>⚡</div>
                <div style={{maxWidth:"83%",background:m.urgent?C.redLight:C.gray100,border:m.urgent?`1px solid ${C.red}`:"none",borderRadius:"16px 16px 16px 4px",padding:"10px 14px",fontSize:14,color:m.urgent?C.red:C.gray900,lineHeight:1.55}}>
                  {m.text}
                  {m.qIndex!==undefined&&CHAT_QUESTIONS[m.qIndex]?.hint&&(
                    <div style={{fontSize:11,color:C.gray500,marginTop:4}}>{CHAT_QUESTIONS[m.qIndex].hint}</div>
                  )}
                </div>
              </div>
            )}
            {m.role==="user"&&(
              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <div style={{maxWidth:"75%",background:C.royalBlue,borderRadius:"16px 16px 4px 16px",padding:"10px 14px",fontSize:14,color:C.white,lineHeight:1.55}}>
                  {m.text}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input area — chips + text */}
      {activeQ&&!done&&(
        <div style={{background:C.white,borderTop:`1px solid ${C.gray300}`,padding:"12px 16px 20px"}}>

          {/* Suggestion chips */}
          <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:10}}>
            {activeQ.chips.map(chip=>(
              <button key={chip} onClick={()=>submitAnswer(chip)}
                style={{padding:"7px 14px",border:`1.5px solid ${C.gray300}`,borderRadius:20,background:C.white,fontSize:13,color:C.gray700,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>
                {chip}
              </button>
            ))}
            {activeQ.optional&&(
              <button onClick={skipOptional}
                style={{padding:"7px 14px",border:`1.5px solid ${C.gray300}`,borderRadius:20,background:C.gray100,fontSize:13,color:C.gray500,cursor:"pointer",fontFamily:"inherit"}}>
                Skip →
              </button>
            )}
          </div>

          {/* Free text input */}
          {activeQ.freeText&&(
            <div style={{display:"flex",gap:8}}>
              <input
                value={inputVal}
                onChange={e=>setInputVal(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&inputVal.trim()&&submitAnswer(inputVal)}
                placeholder={activeQ.placeholder||"Or type your own answer..."}
                style={{flex:1,fontSize:14,padding:"10px 14px",border:`1.5px solid ${C.gray300}`,borderRadius:22,background:C.offWhite,color:C.gray900,outline:"none",fontFamily:"inherit"}}
              />
              <button onClick={()=>inputVal.trim()&&submitAnswer(inputVal)}
                style={{width:40,height:40,borderRadius:"50%",background:inputVal.trim()?C.royalBlue:C.gray300,border:"none",color:C.white,fontSize:18,cursor:inputVal.trim()?"pointer":"default",flexShrink:0}}>
                →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ANALYZING ──
function AnalyzingScreen(){
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.royalBlue},${C.blue3})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center"}}>
      <div style={{width:72,height:72,border:`4px solid rgba(255,255,255,0.15)`,borderTop:`4px solid ${C.yellow}`,borderRadius:"50%",animation:"spin 0.9s linear infinite",marginBottom:28}}/>
      <h2 style={{color:C.white,fontSize:22,fontWeight:800,margin:"0 0 10px"}}>Running Diagnostic</h2>
      <p style={{color:C.blueMid,fontSize:14,maxWidth:260,lineHeight:1.6}}>Cross-referencing NEC code, hazard patterns, and field data…</p>
    </div>
  );
}

// ── RESULT ──
function ResultScreen({result,onFindElectrician,onReset}:{result:DiagResult;category:string;onFindElectrician:()=>void;onReset:()=>void}){
  const sev=SEVERITY_CONFIG[result.severity]||SEVERITY_CONFIG.MODERATE;
  return(
    <div style={{minHeight:"100vh",background:C.offWhite,paddingBottom:130}}>
      <TopBar title="Diagnostic Summary" step="Step 3 of 3" onBack={onReset} backLabel="New"/>
      <div style={{background:sev.color,padding:"20px 20px 18px",textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:6}}>{sev.icon}</div>
        <div style={{fontSize:22,fontWeight:900,color:C.white,letterSpacing:-0.5}}>{sev.label}</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.9)",marginTop:4}}>{sev.action}</div>
      </div>
      <div style={{padding:"20px 16px"}}>
        {/* Plain English assessment */}
        <div style={{background:C.royalBlue,borderRadius:14,padding:"16px 18px",marginBottom:16,display:"flex",gap:12,alignItems:"flex-start"}}>
          <div style={{width:32,height:32,background:C.yellow,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16}}>⚡</div>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:C.blueMid,letterSpacing:0.5,textTransform:"uppercase",marginBottom:6}}>Assessment</div>
            <div style={{fontSize:15,color:C.white,lineHeight:1.6}}>{result.plain_summary}</div>
          </div>
        </div>
        <Card title="Likely Cause" icon="🔍">
          <p style={bodyText}>{result.likely_cause}</p>
          {result.nec_reference&&(
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:C.blueLight,borderRadius:8,padding:"5px 10px",marginTop:8}}>
              <span style={{fontSize:11}}>📋</span>
              <span style={{fontSize:12,fontWeight:700,color:C.royalBlue}}>{result.nec_reference}</span>
            </div>
          )}
        </Card>
        {result.safety_warnings&&result.safety_warnings.length>0&&(
          <Card title="Safety Warnings" icon="⚠️" accent={C.red}>
            {result.safety_warnings.map((w,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:i<(result.safety_warnings?.length??0)-1?10:0}}>
                <span style={{color:C.red,fontWeight:900,marginTop:1}}>!</span>
                <p style={{...bodyText,margin:0,color:C.red}}>{w}</p>
              </div>
            ))}
          </Card>
        )}
        {result.immediate_actions&&result.immediate_actions.length>0&&(
          <Card title="Do This Now" icon="✅">
            {result.immediate_actions.map((a,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i<(result.immediate_actions?.length??0)-1?12:0}}>
                <div style={{width:24,height:24,background:C.royalBlue,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:C.white,fontSize:12,fontWeight:800,flexShrink:0}}>{i+1}</div>
                <p style={{...bodyText,margin:0}}>{a}</p>
              </div>
            ))}
          </Card>
        )}
        {result.diy_safe&&result.diy_steps&&result.diy_steps.length>0?(
          <Card title="DIY Steps (Low Risk)" icon="🔧" accent={C.green}>
            <div style={{background:C.greenLight,borderRadius:8,padding:"8px 12px",marginBottom:14,fontSize:12,color:C.green,fontWeight:600}}>Only proceed if the circuit is confirmed OFF at the breaker.</div>
            {result.diy_steps.map((s,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i<(result.diy_steps?.length??0)-1?12:0}}>
                <div style={{width:24,height:24,background:C.green,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:C.white,fontSize:12,fontWeight:800,flexShrink:0}}>{i+1}</div>
                <p style={{...bodyText,margin:0}}>{s}</p>
              </div>
            ))}
          </Card>
        ):(
          <Card title="Licensed Electrician Required" icon="👷" accent={C.orange}>
            <p style={bodyText}>{result.pro_required_reason}</p>
            {result.what_to_expect&&(
              <div style={{marginTop:12,borderTop:`1px solid ${C.gray300}`,paddingTop:12}}>
                <div style={{fontSize:11,fontWeight:700,color:C.gray500,marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>What to expect on site</div>
                <p style={{...bodyText,margin:0}}>{result.what_to_expect}</p>
              </div>
            )}
            {result.estimated_scope&&(
              <div style={{marginTop:10,display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:11,fontWeight:700,color:C.gray500,textTransform:"uppercase",letterSpacing:0.5}}>Scope:</span>
                <span style={{fontSize:13,fontWeight:700,color:C.royalBlue}}>{result.estimated_scope}</span>
              </div>
            )}
          </Card>
        )}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:C.white,borderTop:`1px solid ${C.gray300}`,padding:"14px 16px"}}>
        <button onClick={onFindElectrician} style={{width:"100%",background:C.yellow,color:C.royalBlue,border:"none",borderRadius:12,padding:"14px 0",fontSize:15,fontWeight:800,marginBottom:8,cursor:"pointer"}}>
          Find an Electrician Near Me →
        </button>
        <button onClick={onReset} style={{width:"100%",background:"transparent",color:C.gray500,border:`1px solid ${C.gray300}`,borderRadius:12,padding:"12px 0",fontSize:13,fontWeight:600,cursor:"pointer"}}>
          Start New Diagnostic
        </button>
      </div>
    </div>
  );
}

// ── ELECTRICIAN FINDER ──
function ElectricianScreen({onReset}:{result:DiagResult|null;category:string|null;onReset:()=>void}){
  const [zip,setZip]=useState("");
  const [submitted,setSubmitted]=useState(false);
  const [sponsored,setSponsored]=useState<typeof SPONSORED>([]);
  const [googleResults,setGoogleResults]=useState<any[]>([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const cardColors=[
    {bg:"#dbeafe",fg:"#1e40af"},{bg:"#dcfce7",fg:"#166534"},
    {bg:"#ffedd5",fg:"#9a3412"},{bg:"#f3e8ff",fg:"#6b21a8"},
  ];

  async function handleSubmit(){
    if(zip.length<4) return;
    setLoading(true); setSubmitted(true); setError("");

    // Tier 1 — sponsored
    setSponsored(getSponsoredForZip(zip));

    // Tier 2 — Google Places via secure Vercel backend
    try{
      const coords=ZIP_COORDS[zip];
      if(coords){
        const [lat,lng]=coords;
        const res=await fetch(`/api/places?lat=${lat}&lng=${lng}`);
        const data=await res.json();
        if(data.results&&data.results.length>0){
          const filtered=data.results
            .filter((p:any)=>!p.name.toLowerCase().includes("onlehane")&&!p.name.toLowerCase().includes("lehane"))
            .slice(0,5)
            .map((p:any,i:number)=>({
              name:p.name,
              init:p.name.split(" ").map((w:string)=>w[0]).join("").substring(0,2).toUpperCase(),
              rating:p.rating||null,
              reviews:p.user_ratings_total||0,
              dist:coords&&p.geometry?.location
                ?haversineMiles(lat,lng,p.geometry.location.lat,p.geometry.location.lng).toFixed(1)+" mi"
                :"nearby",
              placeId:p.place_id,
              address:p.vicinity||"",
              openNow:p.opening_hours?.open_now,
              ...cardColors[i%cardColors.length],
            }));
          setGoogleResults(filtered);
        } else {
          setError("No electricians found for this ZIP. Try a nearby ZIP code.");
        }
      } else {
        setError("ZIP code not recognized. Try entering a nearby ZIP.");
      }
    }catch(e){
      setError("Couldn't load Google results. Check your connection and try again.");
    }
    setLoading(false);
  }

  if(!submitted){
    return(
      <div style={{minHeight:"100vh",background:C.offWhite}}>
        <TopBar title="Find an Electrician" onBack={onReset} backLabel="Results"/>
        <div style={{padding:"40px 20px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:16}}>📍</div>
          <h2 style={{fontSize:20,fontWeight:800,color:C.gray900,margin:"0 0 8px"}}>What's your ZIP code?</h2>
          <p style={{fontSize:14,color:C.gray500,margin:"0 0 28px",maxWidth:280,lineHeight:1.5}}>
            We'll show our preferred partner first, then licensed electricians near you from Google.
          </p>
          <div style={{width:"100%",maxWidth:320,display:"flex",gap:10}}>
            <input value={zip} onChange={e=>setZip(e.target.value.replace(/\D/g,"").substring(0,5))}
              placeholder="Enter ZIP code" inputMode="numeric" maxLength={5}
              onKeyDown={e=>e.key==="Enter"&&zip.length>=4&&handleSubmit()}
              style={{flex:1,fontSize:16,padding:"13px 16px",border:`1.5px solid ${C.gray300}`,borderRadius:12,background:C.white,color:C.gray900,outline:"none",fontFamily:"inherit"}}/>
            <button onClick={handleSubmit} disabled={zip.length<4}
              style={{background:zip.length>=4?C.royalBlue:C.gray300,color:C.white,border:"none",borderRadius:12,padding:"13px 20px",fontSize:14,fontWeight:700,cursor:zip.length>=4?"pointer":"not-allowed",fontFamily:"inherit"}}>
              Go →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return(
    <div style={{minHeight:"100vh",background:C.offWhite}}>
      <TopBar title="Electricians Near You" onBack={()=>setSubmitted(false)} backLabel="ZIP"/>
      <div style={{padding:"16px 16px 48px"}}>

        {loading&&(
          <div style={{textAlign:"center",padding:"48px 0"}}>
            <div style={{width:40,height:40,border:`3px solid ${C.gray300}`,borderTop:`3px solid ${C.royalBlue}`,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 14px"}}/>
            <div style={{fontSize:14,color:C.gray500}}>Finding electricians near {zip}…</div>
          </div>
        )}

        {!loading&&<>

          {/* ── TIER 1: PREFERRED PARTNER ── */}
          {sponsored.length>0&&(
            <div style={{marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <span style={{fontSize:14}}>⭐</span>
                <div style={{fontSize:11,fontWeight:800,color:C.royalBlue,letterSpacing:1,textTransform:"uppercase"}}>Preferred Partner</div>
              </div>
              {sponsored.map(e=>(
                <div key={e.id} style={{background:C.white,border:`2px solid ${C.royalBlue}`,borderRadius:16,padding:16,boxShadow:"0 2px 16px rgba(26,63,166,0.1)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                    <div style={{width:46,height:46,borderRadius:"50%",background:e.bg,color:e.fg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,flexShrink:0}}>{e.init}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:800,color:C.gray900}}>{e.name}</div>
                      <div style={{fontSize:12,color:C.gray500}}>⭐ {e.rating} · {e.reviews} reviews · {e.years} yrs experience</div>
                      <div style={{fontSize:11,color:C.gray500}}>License {e.license}</div>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:C.gray500,marginBottom:12}}>📍 {e.location} · {e.avail}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <a href={`tel:${e.phone.replace(/\D/g,"")}`}
                      style={{display:"block",background:C.gray100,border:`1px solid ${C.gray300}`,borderRadius:10,padding:"11px 0",textAlign:"center",fontSize:13,color:C.gray900,textDecoration:"none",fontWeight:600}}>
                      📞 {e.phone}
                    </a>
                    <a href={e.website} target="_blank" rel="noreferrer"
                      style={{display:"block",background:C.royalBlue,borderRadius:10,padding:"11px 0",textAlign:"center",fontSize:13,color:C.white,textDecoration:"none",fontWeight:700}}>
                      Visit Website →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── TIER 2: GOOGLE PLACES ── */}
          {googleResults.length>0&&(
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <span style={{fontSize:14}}>🗺</span>
                <div style={{fontSize:11,fontWeight:800,color:C.gray500,letterSpacing:1,textTransform:"uppercase"}}>
                  {sponsored.length>0?"Other Electricians Nearby":`Electricians Near ${zip}`}
                </div>
              </div>
              {googleResults.map((e,i)=>(
                <div key={i} style={{background:C.white,border:`1.5px solid ${C.gray300}`,borderRadius:14,padding:14,marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <div style={{width:40,height:40,borderRadius:"50%",background:e.bg,color:e.fg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{e.init}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700,color:C.gray900}}>{e.name}</div>
                      <div style={{fontSize:12,color:C.gray500}}>
                        {e.rating?`⭐ ${e.rating} · ${e.reviews} reviews`:"No rating yet"}
                        {e.openNow!==undefined&&<span style={{marginLeft:8,color:e.openNow?C.green:C.red,fontWeight:600}}>{e.openNow?"· Open now":"· Closed"}</span>}
                      </div>
                    </div>
                  </div>
                  {e.address&&<div style={{fontSize:12,color:C.gray500,marginBottom:10}}>📍 {e.address} · {e.dist} away</div>}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    <a href={`https://www.google.com/maps/place/?q=place_id:${e.placeId}`} target="_blank" rel="noreferrer"
                      style={{display:"block",background:C.gray100,border:`1px solid ${C.gray300}`,borderRadius:9,padding:"9px 0",textAlign:"center",fontSize:12,color:C.gray900,textDecoration:"none",fontWeight:600}}>
                      📍 View on Google
                    </a>
                    <a href={`https://www.google.com/maps/place/?q=place_id:${e.placeId}`} target="_blank" rel="noreferrer"
                      style={{display:"block",background:C.royalBlue,borderRadius:9,padding:"9px 0",textAlign:"center",fontSize:12,color:C.white,textDecoration:"none",fontWeight:600}}>
                      Get Info & Call →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error&&(
            <div style={{textAlign:"center",padding:"32px 20px",color:C.gray500}}>
              <div style={{fontSize:32,marginBottom:12}}>🔍</div>
              <div style={{fontSize:14,marginBottom:8}}>{error}</div>
              <div style={{fontSize:13}}>Or call OnLehane directly: <strong style={{color:C.royalBlue}}>(860) 310-6714</strong></div>
            </div>
          )}

          <button onClick={onReset} style={{width:"100%",background:"transparent",color:C.gray500,border:`1px solid ${C.gray300}`,borderRadius:12,padding:"13px 0",fontSize:13,fontWeight:600,marginTop:12,cursor:"pointer"}}>
            Start New Diagnostic
          </button>
        </>}
      </div>
    </div>
  );
}

// ── MAIN APP ──
export default function ElectriSafe(){
  const [screen,setScreen]=useState("home");
  const [category,setCategory]=useState<string|null>(null);
  const [result,setResult]=useState<DiagResult|null>(null);

  const reset=()=>{ setScreen("home"); setCategory(null); setResult(null); };

  const runDiagnostic=async(answers:Record<string,string>)=>{
    setScreen("analyzing");
    const allCats=[...EMERGENCY_CATS,...CATEGORIES];
    const cat=allCats.find(c=>c.id===category);
    const prompt=`Category: ${cat?.label}
Issue description: ${answers.description||"Not specified"}
Location in home: ${answers.location||"Not specified"}
Home/wiring age: ${answers.age||"Unknown"}
Additional notes: ${answers.extras||"None"}

Diagnose this electrical issue and return the JSON report.`;
    try{
      const res=await fetch("/api/diagnose",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:buildSystemPrompt(),messages:[{role:"user",content:prompt}]}),
      });
      const data=await res.json();
      const raw=data?.content?.[0]?.text||"";
      const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());
      setResult(parsed); setScreen("result");
    }catch(e){
      setResult({
        severity:"MODERATE",plain_summary:"We weren't able to complete the AI diagnostic right now. Based on your issue, we recommend calling a licensed electrician for an in-person assessment.",
        likely_cause:"Unable to determine remotely.",safety_warnings:[],immediate_actions:["Call a licensed electrician for an in-person assessment."],
        diy_safe:false,pro_required_reason:"An in-person inspection is needed to properly diagnose this issue.",
        what_to_expect:"The electrician will inspect the affected area and diagnose the root cause.",estimated_scope:"Service call",
      });
      setScreen("result");
    }
  };

  return(
    <div style={{minHeight:"100vh",background:C.offWhite,fontFamily:"'Inter',-apple-system,sans-serif",maxWidth:480,margin:"0 auto"}}>
      <style>{`*{box-sizing:border-box;}@keyframes spin{to{transform:rotate(360deg);}}button{font-family:inherit;}input,select{font-family:inherit;}`}</style>
      {screen==="home"        &&<HomeScreen onStart={()=>setScreen("category")}/>}
      {screen==="category"    &&<CategoryScreen onSelect={id=>{setCategory(id);setScreen("chat");}} onBack={reset}/>}
      {screen==="chat"        &&<ChatScreen category={category!} onComplete={runDiagnostic} onBack={()=>setScreen("category")}/>}
      {screen==="analyzing"   &&<AnalyzingScreen/>}
      {screen==="result"      &&result&&<ResultScreen result={result} category={category!} onFindElectrician={()=>setScreen("electrician")} onReset={reset}/>}
      {screen==="electrician" &&<ElectricianScreen result={result} category={category} onReset={reset}/>}
    </div>
  );
}
