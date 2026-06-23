"use client";
import { useState, useEffect, useRef } from "react";

const C = {
  royalBlue:"#1a3fa6",blue2:"#1e4fc2",blue3:"#2563eb",blueLight:"#dbeafe",blueMid:"#93c5fd",
  yellow:"#f5c400",white:"#ffffff",offWhite:"#f8fafc",
  gray100:"#f1f5f9",gray300:"#cbd5e1",gray500:"#64748b",gray700:"#334155",gray900:"#0f172a",
  red:"#dc2626",redLight:"#fee2e2",orange:"#ea580c",orangeLight:"#ffedd5",green:"#16a34a",greenLight:"#dcfce7",
};

const SPONSORED = [
  {
    id:"onlehane",name:"OnLehane Electric LLC",init:"OL",
    phone:"(860) 310-6714",website:"https://www.onlehane.com",
    rating:5.0,reviews:94,years:15,license:"ELC-0209263-E1",
    location:"South Windsor, CT",avail:"Available 24/7",
    bg:"#1a3fa6",fg:"#ffffff",tier:1,
    serviceZips:["06074","06001","06002","06010","06016","06019","06023","06026","06029",
                 "06032","06033","06037","06040","06042","06043","06060","06062","06066",
                 "06067","06070","06073","06075","06076","06078","06080","06082","06083",
                 "06084","06085","06088","06089","06095","06096","06101","06103","06105",
                 "06106","06107","06108","06109","06110","06111","06112","06114","06117","06118","06119","06120"],
  }
];

const ZIP_COORDS: Record<string, [number,number]> = {
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

const EMERGENCY_CATS = [
  {id:"burning",icon:"🔥",label:"I smell burning or see smoke",sub:"Coming from an outlet, panel, or wall"},
  {id:"shocked",icon:"⚡",label:"I got shocked or shocked someone",sub:"Contact with an outlet, switch, or appliance"},
];
const CATEGORIES = [
  {id:"outlets", icon:"🔌",label:"An outlet stopped working",        sub:"Nothing powers on, feels warm, or has sparks"},
  {id:"breakers",icon:"🗂️", label:"A breaker keeps tripping",         sub:"Power goes out in part of my home"},
  {id:"lighting",icon:"💡",label:"Lights flickering or won't turn on",sub:"Dimming, buzzing, or switch does nothing"},
  {id:"wiring",  icon:"🔧",label:"Exposed wire or burn marks",        sub:"Scorched outlets, melted plastic, bare wire"},
  {id:"exterior",icon:"🏠",label:"Problem outside my home",           sub:"Outdoor outlets, porch lights, power entry"},
  {id:"ev",      icon:"🚗",label:"Dryer, stove, or EV charger issue", sub:"Large appliance has no power or trips breaker"},
  {id:"safety",  icon:"🚨",label:"Smoke detector or safety device",   sub:"Beeping, GFCI won't reset, CO alarm"},
  {id:"other",   icon:"❓",label:"Not sure — let me describe it",     sub:"Something feels off, don't know where to start"},
];

const FOLLOW_UPS: Record<string,{key:string,q:string,chips:string[]}[]> = {
  burning:[
    {key:"q1",q:"Which area of the house is the smell coming from — near an outlet, a switch, or your electrical panel?",chips:["Near an outlet or switch","Near the panel box","Can't pinpoint it"]},
    {key:"q2",q:"Are you seeing any dark marks, discoloration, or scorch marks anywhere?",chips:["Yes, I can see marks","No visible marks","Haven't looked closely"]},
  ],
  shocked:[
    {key:"q1",q:"Where did it happen — an outlet, a switch, or an appliance?",chips:["An outlet","A switch","An appliance"]},
    {key:"q2",q:"Did it happen just once or has it happened before?",chips:["Just now, first time","Happened before too","Multiple times recently"]},
  ],
  outlets:[
    {key:"q1",q:"Is it just that one outlet, or are a few in the same room acting up?",chips:["Just one outlet","A few nearby","Not sure"]},
    {key:"q2",q:"Did anything happen right before it stopped — breaker trip, storm, plugged in something big?",chips:["Yes, something happened","Nope, just stopped","There was a storm"]},
    {key:"q3",q:"There's usually a small button on the outlet itself or one nearby — says RESET on it. Any luck finding that?",chips:["Found it, didn't help","Found it and it worked!","Don't see one anywhere"]},
  ],
  breakers:[
    {key:"q1",q:"Which part of the house loses power when it trips?",chips:["Kitchen","Bedroom or living room","Bathroom","The whole house"]},
    {key:"q2",q:"What are you usually doing when it happens?",chips:["Running a few things at once","One specific appliance","Nothing — it just trips"]},
    {key:"q3",q:"How often is this happening?",chips:["Multiple times a day","Every now and then","Just started"]},
  ],
  lighting:[
    {key:"q1",q:"Is it one light acting up or a whole room?",chips:["Just one light","Whole room or area","Few different spots"]},
    {key:"q2",q:"Does it happen when you kick on something else — microwave, A/C, anything like that?",chips:["Yes, when other things run","No, happens randomly","Always dim or flickering"]},
    {key:"q3",q:"Have you tried swapping the bulb out yet?",chips:["Yep, new bulb same problem","Not yet","It's a fixture, not a bulb"]},
  ],
  wiring:[
    {key:"q1",q:"Where is the exposed wire or burn mark — outlet, switch, panel, or somewhere else?",chips:["Outlet or switch","Electrical panel","Inside a wall or ceiling","Not sure"]},
    {key:"q2",q:"Is the wire actively sparking or just exposed?",chips:["It's sparking","Just exposed, no sparks","There are burn marks only"]},
  ],
  exterior:[
    {key:"q1",q:"What specifically is having the issue outside?",chips:["Outdoor outlet","Porch or exterior light","Where power enters the house","Not sure"]},
    {key:"q2",q:"Did this start after a storm or did it just happen on its own?",chips:["After a storm","Just happened on its own","Not sure when it started"]},
  ],
  ev:[
    {key:"q1",q:"What's the appliance that's having the issue?",chips:["EV charger","Electric dryer","Electric stove or oven","Other large appliance"]},
    {key:"q2",q:"Is it tripping a breaker or just not getting power at all?",chips:["Tripping the breaker","No power at all","Intermittent — works sometimes"]},
  ],
  safety:[
    {key:"q1",q:"Which device is acting up?",chips:["Smoke detector","CO detector","GFCI outlet won't reset","Something else"]},
    {key:"q2",q:"Is it beeping constantly or just chirping every now and then?",chips:["Constant beeping or alarm","Chirping every 30-60 seconds","Not making sound — just not working"]},
  ],
  other:[
    {key:"q1",q:"Can you describe what's going on? What are you seeing or hearing?",chips:["Buzzing or humming sound","Lights or outlets acting strange","Something smells off","Something else"]},
    {key:"q2",q:"How long has this been going on?",chips:["Just started today","Few days","Week or more","Not sure"]},
  ],
};

const SEVERITY_CONFIG: Record<string,{label:string,color:string,icon:string,action:string}> = {
  EMERGENCY:{label:"Emergency", color:"#dc2626",icon:"🚨",action:"Shut off your main breaker now and call immediately."},
  HIGH:     {label:"High Risk", color:"#ea580c",icon:"⚠️",action:"Do not use this circuit. Schedule service today."},
  MODERATE: {label:"Moderate",  color:"#f5c400",icon:"⚡",action:"Monitor closely. Schedule service within the week."},
  LOW:      {label:"Low Risk",  color:"#16a34a",icon:"✅",action:"Low immediate risk, but should still be evaluated."},
};

function buildSystemPrompt(){
  return `You are ElectriSafe AI — the diagnostic engine behind OnLehane Electric LLC (CT License ELC-0209263-E1). You think like a master electrician with 15+ years of field experience. Plain English only.

Return ONLY valid JSON, no markdown fences:
{
  "severity": "EMERGENCY"|"HIGH"|"MODERATE"|"LOW",
  "plain_summary": "1-2 sentences plain English. Start with 'Looks like...' or 'Based on what you told me...'",
  "likely_cause": "One sentence — most probable technical cause",
  "nec_reference": "Relevant NEC article if applicable",
  "safety_warnings": ["warning 1","warning 2"],
  "immediate_actions": ["action 1","action 2","action 3"],
  "diy_safe": true|false,
  "diy_steps": ["step 1"] or [],
  "pro_required_reason": "Why a licensed electrician is needed",
  "what_to_expect": "What the electrician will do on site",
  "estimated_scope": "Minor repair / Service call / Panel work / Full circuit upgrade / etc."
}
Rules: NEC refs must be real. Fire/electrocution risk = EMERGENCY or HIGH. CT follows NEC 2020.`;
}

interface DiagResult {
  severity:string; plain_summary:string; likely_cause:string; nec_reference?:string;
  safety_warnings?:string[]; immediate_actions?:string[]; diy_safe:boolean;
  diy_steps?:string[]; pro_required_reason?:string; what_to_expect?:string; estimated_scope?:string;
}

const bodyText:React.CSSProperties = {fontSize:14,color:C.gray700,lineHeight:1.65,margin:0};

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

function ChatScreen({category,onComplete,onBack}:{category:string;onComplete:(ans:Record<string,string>)=>void;onBack:()=>void}){
  const allCats=[...EMERGENCY_CATS,...CATEGORIES];
  const cat=allCats.find(c=>c.id===category);
  const isEmergency=category==="burning"||category==="shocked";
  const questions=FOLLOW_UPS[category]||[];
  const chatRef=useRef<HTMLDivElement>(null);
  const [messages,setMessages]=useState<{role:string;text:string;urgent?:boolean;chips?:string[];qKey?:string}[]>([]);
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const [qIndex,setQIndex]=useState(-1);
  const [done,setDone]=useState(false);

  function addMsg(msg:{role:string;text:string;urgent?:boolean;chips?:string[];qKey?:string}){
    setMessages(prev=>[...prev,msg]);
  }

  useEffect(()=>{
    setTimeout(()=>{
      addMsg({role:"ai",text:`Got it — ${cat?.icon} ${cat?.label}. Before I can tell you what's going on, let me ask you a couple of quick things.`});
      setTimeout(()=>{
        if(isEmergency) addMsg({role:"ai",text:"⚠️ If you're in immediate danger right now, stop and call 911. Shut off your main breaker if safe. Then call OnLehane at (860) 310-6714.",urgent:true});
        setTimeout(()=>setQIndex(0),600);
      },800);
    },400);
  },[]);

  useEffect(()=>{
    if(qIndex>=0&&qIndex<questions.length){
      setTimeout(()=>addMsg({role:"ai",text:questions[qIndex].q,chips:questions[qIndex].chips,qKey:questions[qIndex].key}),400);
    }
    if(qIndex===questions.length&&questions.length>0){
      setTimeout(()=>{
        addMsg({role:"ai",text:"That's all I need. Relax — everything's fixable. Let me run the diagnostic now."});
        setTimeout(()=>setDone(true),1200);
      },400);
    }
  },[qIndex]);

  useEffect(()=>{ if(done) onComplete(answers); },[done]);
  useEffect(()=>{ if(chatRef.current) chatRef.current.scrollTop=chatRef.current.scrollHeight; },[messages]);

  function handleChip(qKey:string,val:string){
    addMsg({role:"user",text:val});
    setAnswers(prev=>({...prev,[qKey]:val}));
    setQIndex(prev=>prev+1);
  }

  const lastAiIdx=messages.reduce((acc,m,i)=>m.role==="ai"?i:acc,-1);

  return(
    <div style={{minHeight:"100vh",background:C.offWhite,display:"flex",flexDirection:"column"}}>
      <TopBar title="Tell me what's going on" step="Step 2 of 3" onBack={onBack}/>
      <div style={{padding:"12px 16px 0"}}>
        <div style={{background:isEmergency?C.redLight:C.blueLight,border:isEmergency?`1.5px solid ${C.red}`:"none",borderRadius:10,padding:"9px 14px",display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:18}}>{cat?.icon}</span>
          <span style={{fontSize:13,fontWeight:700,color:isEmergency?C.red:C.royalBlue}}>{cat?.label}</span>
        </div>
      </div>
      <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:"16px 16px 8px",display:"flex",flexDirection:"column",gap:12}}>
        {messages.map((m,i)=>(
          <div key={i}>
            {m.role==="ai"&&(
              <div style={{display:"flex",alignItems:"flex-end",gap:8}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:C.royalBlue,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginBottom:2}}>⚡</div>
                <div style={{maxWidth:"82%",background:m.urgent?"#fee2e2":C.gray100,border:m.urgent?`1px solid ${C.red}`:"none",borderRadius:"18px 18px 18px 4px",padding:"11px 14px",fontSize:14,color:m.urgent?C.red:C.gray900,lineHeight:1.55}}>{m.text}</div>
              </div>
            )}
            {m.role==="user"&&(
              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <div style={{maxWidth:"75%",background:C.royalBlue,borderRadius:"18px 18px 4px 18px",padding:"11px 14px",fontSize:14,color:C.white,lineHeight:1.55}}>{m.text}</div>
              </div>
            )}
            {m.role==="ai"&&m.chips&&i===lastAiIdx&&!done&&(
              <div style={{marginLeft:38,marginTop:8,display:"flex",flexWrap:"wrap",gap:8}}>
                {m.chips.map((chip:string)=>(
                  <button key={chip} onClick={()=>handleChip(m.qKey!,chip)}
                    style={{padding:"9px 16px",border:`1.5px solid ${C.gray300}`,borderRadius:22,background:C.white,fontSize:13,color:C.gray900,cursor:"pointer",fontFamily:"inherit"}}>
                    {chip}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyzingScreen(){
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.royalBlue},${C.blue3})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center"}}>
      <div style={{width:72,height:72,border:`4px solid rgba(255,255,255,0.15)`,borderTop:`4px solid ${C.yellow}`,borderRadius:"50%",animation:"spin 0.9s linear infinite",marginBottom:28}}/>
      <h2 style={{color:C.white,fontSize:22,fontWeight:800,margin:"0 0 10px"}}>Running Diagnostic</h2>
      <p style={{color:C.blueMid,fontSize:14,maxWidth:260,lineHeight:1.6}}>Cross-referencing NEC code, hazard patterns, and field data…</p>
    </div>
  );
}

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
            <div style={{background:C.greenLight,borderRadius:8,padding:"8px 12px",marginBottom:14,fontSize:12,color:C.green,fontWeight:600}}>Only proceed if circuit is confirmed OFF at the breaker.</div>
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

function ElectricianScreen({onReset}:{result:DiagResult|null;category:string|null;onReset:()=>void}){
  const [zip,setZip]=useState("");
  const [submitted,setSubmitted]=useState(false);
  const [sponsored,setSponsored]=useState<typeof SPONSORED>([]);
  const [googleResults,setGoogleResults]=useState<any[]>([]);
  const [loading,setLoading]=useState(false);
  const cardColors=[{bg:"#dbeafe",fg:"#1e40af"},{bg:"#dcfce7",fg:"#166534"},{bg:"#ffedd5",fg:"#9a3412"},{bg:"#f3e8ff",fg:"#6b21a8"}];

  async function handleSubmit(){
    if(zip.length<4) return;
    setLoading(true); setSubmitted(true);
    setSponsored(getSponsoredForZip(zip));
    try{
      const coords=ZIP_COORDS[zip];
      if(coords){
        const [lat,lng]=coords;
        const gUrl=`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=16000&type=electrician&key=AIzaSyAmUvPVxwqfa8D9oCoxzuTCj6dX9URcXbU`;
        const res=await fetch(`https://corsproxy.io/?${encodeURIComponent(gUrl)}`);
        const data=await res.json();
        if(data.results){
          setGoogleResults(data.results
            .filter((p:any)=>!p.name.toLowerCase().includes("onlehane"))
            .slice(0,4)
            .map((p:any,i:number)=>({
              name:p.name,init:p.name.split(" ").map((w:string)=>w[0]).join("").substring(0,2).toUpperCase(),
              rating:p.rating,reviews:p.user_ratings_total||0,
              dist:coords&&p.geometry?.location?haversineMiles(lat,lng,p.geometry.location.lat,p.geometry.location.lng).toFixed(1)+" mi":"nearby",
              placeId:p.place_id,...cardColors[i%cardColors.length],
            })));
        }
      }
    }catch(e){}
    setLoading(false);
  }

  if(!submitted) return(
    <div style={{minHeight:"100vh",background:C.offWhite}}>
      <TopBar title="Find an Electrician" onBack={onReset} backLabel="Back"/>
      <div style={{padding:"40px 20px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:16}}>📍</div>
        <h2 style={{fontSize:20,fontWeight:800,color:C.gray900,margin:"0 0 8px"}}>What's your ZIP code?</h2>
        <p style={{fontSize:14,color:C.gray500,margin:"0 0 28px",maxWidth:280,lineHeight:1.5}}>We'll find licensed electricians near you — starting with our preferred partners.</p>
        <div style={{width:"100%",maxWidth:320,display:"flex",gap:10}}>
          <input value={zip} onChange={e=>setZip(e.target.value.replace(/\D/g,"").substring(0,5))}
            placeholder="e.g. 06118" inputMode="numeric" maxLength={5}
            style={{flex:1,fontSize:16,padding:"13px 16px",border:`1.5px solid ${C.gray300}`,borderRadius:12,background:C.white,color:C.gray900,outline:"none",fontFamily:"inherit"}}
            onKeyDown={e=>e.key==="Enter"&&zip.length>=4&&handleSubmit()}/>
          <button onClick={handleSubmit} disabled={zip.length<4}
            style={{background:zip.length>=4?C.royalBlue:C.gray300,color:C.white,border:"none",borderRadius:12,padding:"13px 20px",fontSize:14,fontWeight:700,cursor:zip.length>=4?"pointer":"not-allowed",fontFamily:"inherit"}}>
            Go →
          </button>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.offWhite}}>
      <TopBar title="Electricians Near You" onBack={()=>setSubmitted(false)} backLabel="ZIP"/>
      <div style={{padding:"16px 16px 40px"}}>
        {loading&&<div style={{textAlign:"center",padding:"40px 0",color:C.gray500,fontSize:14}}>
          <div style={{width:36,height:36,border:`3px solid ${C.gray300}`,borderTop:`3px solid ${C.royalBlue}`,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 12px"}}/>
          Finding electricians near {zip}...
        </div>}
        {!loading&&<>
          {sponsored.length>0&&<>
            <div style={{fontSize:11,fontWeight:800,color:C.royalBlue,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>⭐ Preferred Partner</div>
            {sponsored.map(e=>(
              <div key={e.id} style={{background:C.white,border:`2px solid ${C.royalBlue}`,borderRadius:16,padding:16,marginBottom:16,boxShadow:"0 2px 12px rgba(26,63,166,0.12)"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:e.bg,color:e.fg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,flexShrink:0}}>{e.init}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontWeight:800,color:C.gray900}}>{e.name}</div>
                    <div style={{fontSize:12,color:C.gray500}}>⭐ {e.rating} · {e.reviews} reviews · {e.years} yrs</div>
                    <div style={{fontSize:11,color:C.gray500}}>License {e.license}</div>
                  </div>
                </div>
                <div style={{fontSize:12,color:C.gray500,marginBottom:12}}>📍 {e.location} · {e.avail}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <a href={`tel:${e.phone.replace(/\D/g,"")}`} style={{display:"block",background:C.gray100,border:`1px solid ${C.gray300}`,borderRadius:10,padding:"10px 0",textAlign:"center",fontSize:13,color:C.gray900,textDecoration:"none",fontWeight:600}}>📞 {e.phone}</a>
                  <a href={e.website} target="_blank" rel="noreferrer" style={{display:"block",background:C.royalBlue,borderRadius:10,padding:"10px 0",textAlign:"center",fontSize:13,color:C.white,textDecoration:"none",fontWeight:700}}>Visit Website →</a>
                </div>
              </div>
            ))}
          </>}
          {googleResults.length>0&&<>
            <div style={{fontSize:11,fontWeight:800,color:C.gray500,letterSpacing:1,textTransform:"uppercase",marginBottom:10,marginTop:sponsored.length>0?4:0}}>
              {sponsored.length>0?"Other Electricians Nearby":`Electricians Near ${zip}`}
            </div>
            {googleResults.map((e,i)=>(
              <div key={i} style={{background:C.white,border:`1.5px solid ${C.gray300}`,borderRadius:14,padding:14,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:e.bg,color:e.fg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{e.init}</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:C.gray900}}>{e.name}</div>
                    <div style={{fontSize:12,color:C.gray500}}>{e.rating?`⭐ ${e.rating} · ${e.reviews} reviews`:"No rating yet"}</div>
                  </div>
                </div>
                <div style={{fontSize:12,color:C.gray500,marginBottom:10}}>📍 {e.dist} away</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  <span style={{display:"block",background:C.gray100,border:`1px solid ${C.gray300}`,borderRadius:9,padding:"9px 0",textAlign:"center",fontSize:12,color:C.gray900,fontWeight:600}}>📞 Call</span>
                  <a href={`https://www.google.com/maps/place/?q=place_id:${e.placeId}`} target="_blank" rel="noreferrer" style={{display:"block",background:C.royalBlue,borderRadius:9,padding:"9px 0",textAlign:"center",fontSize:12,color:C.white,textDecoration:"none",fontWeight:600}}>View on Maps</a>
                </div>
              </div>
            ))}
          </>}
          {sponsored.length===0&&googleResults.length===0&&(
            <div style={{textAlign:"center",padding:"40px 20px",color:C.gray500}}>
              <div style={{fontSize:32,marginBottom:12}}>🔍</div>
              <div style={{fontSize:15,fontWeight:600,marginBottom:8}}>No results for {zip}</div>
              <div style={{fontSize:13,lineHeight:1.5}}>Try a nearby ZIP, or call OnLehane directly at<br/><strong style={{color:C.royalBlue}}>(860) 310-6714</strong></div>
            </div>
          )}
          <button onClick={onReset} style={{width:"100%",background:"transparent",color:C.gray500,border:`1px solid ${C.gray300}`,borderRadius:12,padding:"13px 0",fontSize:13,fontWeight:600,marginTop:8,cursor:"pointer"}}>Start New Diagnostic</button>
        </>}
      </div>
    </div>
  );
}

export default function ElectriSafe(){
  const [screen,setScreen]=useState("home");
  const [category,setCategory]=useState<string|null>(null);
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const [result,setResult]=useState<DiagResult|null>(null);

  const reset=()=>{ setScreen("home"); setCategory(null); setAnswers({}); setResult(null); };

  const runDiagnostic=async(ans:Record<string,string>)=>{
    setAnswers(ans); setScreen("analyzing");
    const allCats=[...EMERGENCY_CATS,...CATEGORIES];
    const cat=allCats.find(c=>c.id===category);
    const qs=FOLLOW_UPS[category!]||[];
    const answerText=qs.map(q=>`Q: ${q.q} → A: ${ans[q.key]||"Not answered"}`).join("\n");
    const prompt=`Category: ${cat?.label}\n\nFollow-up answers:\n${answerText}\n\nDiagnose this issue and return the JSON report.`;
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
      setResult({severity:"MODERATE",plain_summary:"We weren't able to complete the AI diagnostic right now. Based on your issue, we recommend calling a licensed electrician for an in-person assessment.",
        likely_cause:"Unable to determine remotely.",safety_warnings:[],immediate_actions:["Call a licensed electrician for an in-person assessment."],
        diy_safe:false,pro_required_reason:"An in-person inspection is needed to properly diagnose this issue.",
        what_to_expect:"The electrician will inspect the affected area and diagnose the root cause.",estimated_scope:"Service call"});
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
