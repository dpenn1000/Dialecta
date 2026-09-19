import { useState, useEffect, useMemo, useRef } from "react";

// ─── Design tokens v1.3 ────────────────────────────────────────────────────
const T = {
  bgPrimary:'#f7f2e8',bgSecondary:'#efe8da',bgTertiary:'#e8dfce',
  bgWhite:'#fffdf8',bgDark:'#1c1814',darkCard:'#292b2d',
  textPrimary:'#1c1814',textBody:'#3a342c',textProse:'#5e6066',
  textSecondary:'#5a5248',textTertiary:'#7a7068',textMuted:'#9a8e80',
  textOnDark:'#f0ebe0',textOnDarkSec:'#b8ae9e',
  gold:'#d4a84a',goldBright:'#e8a830',goldMuted:'#a07828',
  goldPale:'#f5e8d0',amber:'#b8732a',terra:'#8c4a2f',
  borderLight:'#e8e0d0',borderMedium:'#d8ceb8',borderRule:'#b8732a',
  shadowSm:'0 1px 3px rgba(28,24,20,0.04)',
  shadowMd:'0 2px 8px rgba(28,24,20,0.06), 0 0 0 1px rgba(28,24,20,0.02)',
  shadowLg:'0 4px 20px rgba(28,24,20,0.08), 0 0 0 1px rgba(28,24,20,0.02)',
  radiusSm:'4px',radiusMd:'8px',radiusLg:'12px',
  fontDisplay:"'Cormorant Garamond', serif",
  fontBody:"'DM Sans', sans-serif",
  fontReading:"'Source Serif 4', Georgia, serif",
  fontMono:"'DM Mono', monospace",
};

// ─── Tiers ─────────────────────────────────────────────────────────────────
const TIERS = [
  { key:'forum', name:'The Forum', short:'Forum', rank:0,
    desc:'Specific claim, engaged with the content, reasoning present. Strong disagreement welcome here.',
    top:'#FEFBF0',bot:'#F8F0D8',border:'#E8D080',text:'#6A5410',
    icon:(sz=12)=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="18" width="18" height="2.5" rx="1"/><rect x="2" y="15" width="20" height="2" rx="1"/><rect x="4" y="4" width="2.2" height="11" rx="1"/><rect x="8.9" y="4" width="2.2" height="11" rx="1"/><rect x="13.8" y="4" width="2.2" height="11" rx="1"/><rect x="18.8" y="4" width="2.2" height="11" rx="1"/><polygon points="12,1 2,5 22,5"/></svg>,
  },
  { key:'spark', name:'The Spark', short:'Spark', rank:1,
    desc:'A genuinely interesting idea, but underdeveloped. The seed of something good.',
    top:'#FCF0D8',bot:'#F4D098',border:'#D89438',text:'#6A3C08',
    icon:(sz=12)=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 L4 14 L11 14 L10 22 L20 9 L13 9 Z"/></svg>,
  },
  { key:'echo', name:'The Echo', short:'Echo', rank:2,
    desc:'Restates the article or a prior comment without adding to it.',
    top:'#EAF0E0',bot:'#C8D8B0',border:'#708848',text:'#38440C',
    icon:(sz=12)=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 4C7 4 4 7.6 4 12c0 4.4 3 8 8 8"/><path d="M12 20c5 0 8-3.6 8-8 0-4.4-3-8-8-8"/><polyline points="9,17 12,20 9,23"/><polyline points="15,7 12,4 15,1"/></svg>,
  },
  { key:'fog', name:'The Fog', short:'Fog', rank:3,
    desc:"Vague or disconnected. The reader can't tell what the commenter believes.",
    top:'#DCE0E4',bot:'#B0B8C4',border:'#687488',text:'#2C3848',
    icon:(sz=12)=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 12.5C4.5 10.3 6.3 8.5 8.5 8.5c.4-2 2.3-3.5 4.5-3.5C15.8 5 18 7.2 18 10c1.7.3 3 1.8 3 3.5C21 15.4 19.4 17 17.5 17h-11C5.1 17 4 16 4.5 12.5z"/></svg>,
  },
  { key:'heat', name:'The Heat', short:'Heat', rank:4,
    desc:'Emotionally charged without a specific claim. Passion without a point.',
    top:'#E89868',bot:'#C46028',border:'#7C2C08',text:'#FCEAD8',
    icon:(sz=12)=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinejoin="round"><path d="M12 2C10 6 7 8 7 13c0 4.5 2.5 8 5.5 8C16 21 18 17.8 17.8 14.5 17.6 12 15.8 10 14 9c.5 2-.5 3-1.5 2.5C12 9 13 6 12 2z"/></svg>,
  },
  { key:'stance', name:'The Stance', short:'Stance', rank:5,
    desc:'Tribal framing or identity signaling dominates over argument. A position planted, not a conversation joined.',
    top:'#A8483C',bot:'#783028',border:'#401818',text:'#F4D8D0',
    icon:(sz=12)=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="currentColor"><rect x="11.2" y="8" width="2" height="14" rx="1"/><rect x="9" y="21" width="6" height="1.5" rx="0.75"/><path d="M13 8L13 3.5L20 6L13 8.5Z"/></svg>,
  },
  { key:'breach', name:'The Breach', short:'Breach', rank:6,
    desc:'Personal attack on a person, not an idea. The Pact has been broken.',
    top:'#6A1818',bot:'#380808',border:'#200404',text:'#F0C8C8',
    icon:(sz=12)=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M8 6C6 6 4.5 7.5 4.5 9.5S6 13 8 13h2"/><path d="M16 18c2 0 3.5-1.5 3.5-3.5S18 11 16 11h-2"/><line x1="12" y1="5" x2="12" y2="19" strokeDasharray="2 2"/></svg>,
  },
];
const tierByKey = Object.fromEntries(TIERS.map(t=>[t.key,t]));

const REASONS = [
  { key:'specific_claim', label:'Contains a specific, well-supported claim' },
  { key:'engages_content', label:'Engages directly with the article or a prior comment' },
  { key:'new_idea', label:'Introduces a genuinely new idea' },
  { key:'emotional_only', label:'Makes a strong emotional argument without a supporting claim' },
  { key:'group_signal', label:'Uses language that signals group membership over argument' },
  { key:'unclear', label:"Is unclear — I can't identify the core position" },
  { key:'other', label:'Other' },
];

const SORT_OPTIONS = [
  { key:'quality', label:'Quality' },
  { key:'newest', label:'Newest' },
  { key:'discussed', label:'Most discussed' },
];

const ARTICLE = {
  author:'Daniel Pennington', date:'April 2026', read:'11 min read',
  title:'The Hidden Costs of the Energy Transition',
  subtitle:'Solar and wind are cheaper than ever. But the story of what it takes to build, store, and transmit that power is more complicated than the price-per-kilowatt-hour suggests.',
  claims:[
    'Battery storage at grid scale is not yet cost-competitive with natural gas peaker plants for reliability purposes.',
    'The carbon cost of manufacturing solar panels is real and measurable, even if recovered within 2–4 years of operation.',
    'Transmission infrastructure, not generation, is the primary bottleneck slowing renewable deployment in the United States.',
  ],
};

const INITIAL_COMMENTS = [
  { id:1, author:'R. Vasquez', tag:'The Cartographer', time:'2h ago', dec:'forum', ai:'forum', votes:22, spec:3, noms:0, replies:4,
    body:"The transmission bottleneck claim is the strongest argument here. FERC Order 2023 addresses interconnection queue reform but does nothing about physical wire capacity. That’s a solvable policy failure with a specific address: federal siting authority for high-voltage lines, comparable to what NEPA already allows for interstate pipelines." },
  { id:2, author:'M. Chen', tag:null, time:'3h ago', dec:'forum', ai:'forum', votes:18, spec:3, noms:0, replies:2,
    body:"The 2–4 year carbon payback figure applies to crystalline silicon in temperate climates. For thin-film CdTe in high-irradiance regions it drops under 18 months. The manufacturing carbon argument is real, but treating it as a single number obscures variance that matters for policy." },
  { id:3, author:'T. Okafor', tag:null, time:'4h ago', dec:'forum', ai:'spark', votes:14, spec:2, noms:0, replies:3,
    body:"The permitting timeline is the real hidden variable. A HVDC line from Wyoming to California takes 10+ years to permit under current NEPA review. The physical wire is the easy part. Has the author modeled what transmission buildout looks like if permitting reform actually passes?" },
  { id:4, author:'A. Reyes', tag:null, time:'5h ago', dec:'spark', ai:'spark', votes:9, spec:1, noms:0, replies:1,
    body:"Has anyone modeled what a fully decentralized grid looks like at the neighborhood level? The transmission argument assumes centralized generation stays dominant — but rooftop solar plus neighborhood-scale storage might route around the whole problem." },
  { id:5, author:'J. Kim', tag:null, time:'5h ago', dec:'spark', ai:'spark', votes:7, spec:1, noms:0, replies:0,
    body:"The battery economics argument feels dated. Gravity storage and compressed air are getting serious investment and neither carries the lithium manufacturing footprint. Worth a follow-up piece before treating lithium as the only viable storage pathway." },
  { id:6, author:'P. Walsh', tag:null, time:'6h ago', dec:'echo', ai:'echo', votes:4, spec:0, noms:0, replies:0,
    body:"This is essentially what the IEA has been saying in every World Energy Outlook since 2020. The cost numbers match their 2024 projections almost exactly." },
  { id:7, author:'B. Torres', tag:null, time:'7h ago', dec:'fog', ai:'fog', votes:1, spec:0, noms:2, replies:0,
    body:"There are so many different ways to look at this. Energy transition is complicated and I think both sides have valid points depending on where you’re coming from and what you prioritize." },
  { id:8, author:'D. Morris', tag:null, time:'8h ago', dec:'spark', ai:'heat', votes:3, spec:0, noms:4, replies:2,
    body:"We have been talking about this for 30 years and absolutely nothing changes. The fossil fuel industry has captured every regulatory body in this country. Nothing will happen until people force it." },
  { id:9, author:'Anonymous', tag:null, time:'9h ago', dec:'stance', ai:'stance', votes:1, spec:0, noms:3, replies:1,
    body:"Of course a coastal liberal would frame it this way. The free market will solve this if government gets out of the way. Wind and solar can’t survive without subsidies — that tells you everything you need to know." },
  { id:10, author:'Anonymous', tag:null, time:'11h ago', dec:'breach', ai:'breach', votes:0, spec:0, noms:0, replies:0, body:null },
];

// ─── Classification prompt ─────────────────────────────────────────────────
function buildPrompt(comment) {
  return `You are the classification engine for Dialecta — a platform that rewards constructive dialogue and honest debate.

## THE ARTICLE (Key Claims)
${ARTICLE.claims.map((c,i)=>`${i+1}. ${c}`).join('\n')}

## THE COMMENT
"${comment}"

## THE TIER SYSTEM
Forum — Specific claim, engaged with content, reasoning present. Strong disagreement welcome.
Spark — Interesting idea, underdeveloped. Potential not yet realized.
Echo — Restates article or prior comment without adding.
Fog — Unclear. Reader cannot identify what the commenter believes.
Heat — Emotional without a specific claim. Passion without a point.
Stance — Tribal framing, rhetoric, or identity signaling dominates.
Breach — Personal attack on a person, not an idea.

## INSTRUCTIONS
1. What claim is the commenter making, if any? If none, say so explicitly.
2. Rate specificity: 0 (none), 1 (vague), 2 (specific), 3 (developed with reasoning or evidence).
3. Emotional register: Low / Medium / High
4. Tribal or rhetorical patterns: Yes/No
5. Does the comment engage with something specific in the article, or a general impression?
6. Does the commenter acknowledge or engage with an opposing view?

Assign one tier. Write a COMMENTER MESSAGE — 1 to 2 sentences, non-lecturing, direct, observational. If below Forum, include one concrete suggestion. Do not moralize.

## OUTPUT FORMAT (strict)
SPECIFICITY: [0/1/2/3]
EMOTION: [Low/Medium/High]
TRIBAL: [Yes/No]
ENGAGEMENT: [Specific/General]
OPPOSING: [Yes/No/Partially]
TIER: [exact tier name]
BORDERLINE: [Yes/No or "Yes — The X because reason"]
MESSAGE: [1–2 sentences]`;
}

function parseResponse(text) {
  const get = k => { const m = text.match(new RegExp(k+':\\s*(.+)')); return m ? m[1].trim() : null; };
  const tierRaw = (get('TIER')||'The Fog').toLowerCase();
  const tier = TIERS.find(t=>tierRaw.includes(t.key))||TIERS[3];
  return {
    tier,
    specificity: Math.min(3,Math.max(0,parseInt(get('SPECIFICITY')||'1'))),
    emotion: get('EMOTION')||'Medium',
    tribal: get('TRIBAL')||'No',
    engagement: get('ENGAGEMENT')||'General',
    opposing: get('OPPOSING')||'No',
    borderline: get('BORDERLINE')||'No',
    message: get('MESSAGE')||'',
  };
}

// ─── Shared primitives ─────────────────────────────────────────────────────
function TierBadge({ tier, size='sm' }) {
  const c = {
    sm:{p:'3px 8px',fs:'0.6rem',gap:4,sz:10},
    md:{p:'5px 12px',fs:'0.7rem',gap:5,sz:12},
    lg:{p:'7px 16px',fs:'0.8rem',gap:8,sz:14,br:'6px'},
  }[size];
  return (
    <span style={{ display:'inline-flex',alignItems:'center',gap:c.gap,padding:c.p,borderRadius:c.br||T.radiusSm,background:`linear-gradient(180deg,${tier.top},${tier.bot})`,border:`1px solid ${tier.border}`,color:tier.text,fontFamily:T.fontMono,fontSize:c.fs,letterSpacing:'0.04em',fontWeight:500,lineHeight:1,whiteSpace:'nowrap' }}>
      <span style={{ display:'flex',alignItems:'center',flexShrink:0 }}>{tier.icon(c.sz)}</span>
      {tier.name}
    </span>
  );
}

function SpecDots({ level }) {
  return (
    <span style={{ display:'inline-flex',gap:3,alignItems:'center' }}>
      {[1,2,3].map(i=><span key={i} style={{ width:8,height:8,borderRadius:'50%',border:`1px solid ${i<=level?T.amber:T.borderMedium}`,background:i<=level?T.amber:T.bgPrimary,display:'inline-block' }}/>)}
    </span>
  );
}

function VoteControl({ count }) {
  const [votes,setVotes] = useState(count);
  const [voted,setVoted] = useState(null);
  function cast(dir) {
    if (voted===dir) { setVotes(dir==='up'?votes-1:votes+1); setVoted(null); }
    else { setVotes(votes+(dir==='up'?1:-1)+(voted?(voted==='up'?-1:1):0)); setVoted(dir); }
  }
  return (
    <span style={{ display:'inline-flex',alignItems:'center',gap:4 }}>
      <button onClick={()=>cast('up')} style={{ all:'unset',cursor:'pointer',color:voted==='up'?T.amber:T.textMuted,fontSize:'0.7rem',transition:'color 0.15s' }}>&#9650;</button>
      <span style={{ fontFamily:T.fontMono,fontSize:'0.65rem',color:voted?T.amber:T.textTertiary,fontWeight:voted?500:400,minWidth:16,textAlign:'center' }}>{votes}</span>
      <button onClick={()=>cast('down')} style={{ all:'unset',cursor:'pointer',color:voted==='down'?T.terra:T.textMuted,fontSize:'0.7rem',transition:'color 0.15s' }}>&#9660;</button>
    </span>
  );
}

// ─── Nomination panel ──────────────────────────────────────────────────────
function NominationPanel({ currentTierKey, onSubmit, onCancel }) {
  const [selectedTier,setSelectedTier] = useState(null);
  const [selectedReason,setSelectedReason] = useState(null);
  const [note,setNote] = useState('');
  const [step,setStep] = useState(1);
  const NOTE_MAX = 140;
  const currentTier = tierByKey[currentTierKey];
  const canAdvance = step===1 ? !!selectedTier : !!selectedReason;

  if (step===3) {
    const nom = tierByKey[selectedTier];
    const reason = REASONS.find(r=>r.key===selectedReason);
    return (
      <div style={{ borderTop:`1px solid ${T.borderLight}`,marginTop:14,paddingTop:14 }}>
        <div style={{ padding:'14px 16px',background:T.bgSecondary,border:`1px solid ${T.borderLight}`,borderLeft:`3px solid ${T.terra}`,borderRadius:`0 ${T.radiusSm} ${T.radiusSm} 0` }}>
          <div style={{ fontFamily:T.fontMono,fontSize:'0.56rem',letterSpacing:'0.12em',textTransform:'uppercase',color:T.terra,marginBottom:8 }}>Nomination submitted</div>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:6 }}>
            <span style={{ fontFamily:T.fontReading,fontSize:'0.8rem',color:T.textSecondary,fontStyle:'italic' }}>Suggested:</span>
            <TierBadge tier={nom} size="sm"/>
          </div>
          <p style={{ fontFamily:T.fontReading,fontSize:'0.78rem',color:T.textSecondary,margin:'0 0 4px',lineHeight:1.55,fontStyle:'italic' }}>"{reason?.label}"</p>
          {note && <p style={{ fontFamily:T.fontReading,fontSize:'0.76rem',color:T.textTertiary,margin:0,fontStyle:'italic' }}>"{note}"</p>}
          <p style={{ fontFamily:T.fontMono,fontSize:'0.54rem',color:T.textMuted,margin:'10px 0 0',letterSpacing:'0.06em' }}>The commenter will see this before any re-review takes effect.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ borderTop:`1px solid ${T.borderLight}`,marginTop:14,paddingTop:16 }}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14 }}>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <span style={{ fontFamily:T.fontMono,fontSize:'0.56rem',letterSpacing:'0.15em',textTransform:'uppercase',color:T.amber }}>
            {step===1 ? 'Step 1 of 2 — Suggest a tier' : 'Step 2 of 2 — Your reason'}
          </span>
          {step===2 && selectedTier && <TierBadge tier={tierByKey[selectedTier]} size="sm"/>}
        </div>
        <button onClick={onCancel} style={{ all:'unset',cursor:'pointer',fontFamily:T.fontBody,fontSize:'0.75rem',color:T.textMuted }}>Cancel</button>
      </div>

      {step===1 && (
        <>
          <div style={{ marginBottom:10 }}>
            <span style={{ fontFamily:T.fontMono,fontSize:'0.56rem',letterSpacing:'0.1em',textTransform:'uppercase',color:T.textMuted }}>Currently declared as</span>
            <span style={{ marginLeft:8 }}><TierBadge tier={currentTier} size="sm"/></span>
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:4,marginBottom:selectedTier==='breach'?8:16 }}>
            {TIERS.map(tier => {
              const isCurrent = tier.key===currentTierKey;
              const isSelected = selectedTier===tier.key;
              return (
                <div key={tier.key}>
                  {tier.key==='breach' && (
                    <div style={{ display:'flex',alignItems:'center',gap:10,margin:'6px 0 6px' }}>
                      <div style={{ flex:1,height:1,background:`linear-gradient(to right,${T.terra}40,transparent)` }}/>
                      <span style={{ fontFamily:T.fontMono,fontSize:'0.52rem',letterSpacing:'0.14em',textTransform:'uppercase',color:T.terra,flexShrink:0 }}>Pact violation</span>
                      <div style={{ flex:1,height:1,background:`linear-gradient(to left,${T.terra}40,transparent)` }}/>
                    </div>
                  )}
                  <button onClick={()=>!isCurrent&&setSelectedTier(tier.key)} style={{ all:'unset',cursor:isCurrent?'default':'pointer',display:'flex',alignItems:'center',gap:0,borderRadius:T.radiusSm,overflow:'hidden',border:`1px solid ${isSelected?tier.border:isCurrent?tier.border:T.borderLight}`,background:(isSelected||isCurrent)?`linear-gradient(180deg,${tier.top},${tier.bot})`:T.bgWhite,boxShadow:isSelected?T.shadowMd:isCurrent?`0 0 0 2px ${tier.border}38, 0 4px 16px ${tier.border}22, 0 1px 4px rgba(28,24,20,0.06)`:T.shadowSm,transform:isCurrent&&!isSelected?'translateY(-1px)':'none',transition:'all 0.18s',width:'100%' }}>
                  <span style={{ display:'flex',alignItems:'center',justifyContent:'center',width:44,height:44,flexShrink:0,background:`linear-gradient(180deg,${tier.top},${tier.bot})`,borderRight:`1px solid ${tier.border}`,color:tier.key==='forum'?T.textPrimary:tier.text }}>
                    {tier.icon(20)}
                  </span>
                  <span style={{ display:'flex',flexDirection:'column',gap:2,padding:'8px 12px',flex:1,minWidth:0 }}>
                    <span style={{ display:'flex',alignItems:'center',gap:8 }}>
                      <span style={{ fontFamily:T.fontDisplay,fontSize:'0.95rem',fontWeight:600,color:(isSelected||isCurrent)?tier.text:T.textPrimary,lineHeight:1 }}>{tier.name}</span>
                    </span>
                    <span style={{ fontFamily:T.fontReading,fontSize:'0.75rem',lineHeight:1.45,color:(isSelected||isCurrent)?tier.text:T.textSecondary,opacity:(isSelected||isCurrent)?0.9:1 }}>{tier.desc}</span>
                  </span>
                  <span style={{ width:64,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',paddingRight:10 }}>
                    {isCurrent
                      ? <span style={{ fontFamily:T.fontMono,fontSize:'0.5rem',letterSpacing:'0.1em',textTransform:'uppercase',color:T.amber,border:`1px solid ${T.borderMedium}`,borderRadius:3,padding:'2px 5px',background:T.goldPale,whiteSpace:'nowrap' }}>Declared</span>
                      : <span style={{ color:isSelected?tier.text:T.borderLight,fontSize:'0.75rem',transition:'color 0.18s' }}>{isSelected?'●':'○'}</span>
                    }
                  </span>
                  </button>
                </div>
              );
            })}
          </div>
          {selectedTier==='breach' && (
            <div style={{ padding:'10px 14px',background:'#380808',border:`1px solid #200404`,borderLeft:`3px solid ${T.terra}`,borderRadius:`0 4px 4px 0`,marginBottom:16 }}>
              <p style={{ fontFamily:'Source Serif 4, Georgia, serif',fontSize:'0.78rem',lineHeight:1.6,color:'#F0C8C8',margin:0,fontStyle:'italic' }}>
                A Breach nomination signals a personal attack on a person, not an idea. If enough readers agree, this comment will be suppressed with a visible explanation. The original commenter will see the nominations before any action is taken.
              </p>
            </div>
          )}
          <div style={{ display:'flex',justifyContent:'flex-end' }}>
            <button onClick={()=>canAdvance&&setStep(2)} style={{ all:'unset',cursor:canAdvance?'pointer':'not-allowed',padding:'8px 22px',borderRadius:T.radiusSm,background:canAdvance?T.bgDark:T.bgTertiary,color:canAdvance?T.bgPrimary:T.textMuted,fontFamily:T.fontDisplay,fontSize:'0.9rem',fontWeight:500,letterSpacing:'0.03em',transition:'all 0.2s' }}>Next →</button>
          </div>
        </>
      )}

      {step===2 && (
        <>
          <div style={{ display:'flex',flexDirection:'column',gap:4,marginBottom:14 }}>
            {REASONS.map(reason => {
              const isSelected = selectedReason===reason.key;
              return (
                <label key={reason.key} style={{ display:'flex',alignItems:'flex-start',gap:10,padding:'9px 12px',borderRadius:T.radiusSm,background:isSelected?T.goldPale:T.bgSecondary,border:`1px solid ${isSelected?T.borderMedium:T.borderLight}`,cursor:'pointer',transition:'all 0.15s' }}>
                  <span style={{ marginTop:2,flexShrink:0,width:14,height:14,borderRadius:'50%',border:`2px solid ${isSelected?T.amber:T.borderMedium}`,background:isSelected?T.amber:'transparent',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s' }}>
                    {isSelected&&<span style={{ width:4,height:4,borderRadius:'50%',background:T.bgWhite,display:'block' }}/>}
                  </span>
                  <input type="radio" name="reason" value={reason.key} checked={isSelected} onChange={()=>setSelectedReason(reason.key)} style={{ display:'none' }}/>
                  <span style={{ fontFamily:T.fontReading,fontSize:'0.82rem',lineHeight:1.5,color:isSelected?T.textPrimary:T.textSecondary }}>{reason.label}</span>
                </label>
              );
            })}
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block',fontFamily:T.fontMono,fontSize:'0.56rem',letterSpacing:'0.12em',textTransform:'uppercase',color:T.textTertiary,marginBottom:6 }}>
              Optional note <span style={{ color:T.textMuted,fontWeight:300 }}>(140 chars max)</span>
            </label>
            <textarea value={note} onChange={e=>setNote(e.target.value.slice(0,NOTE_MAX))} placeholder="Anything the predefined options don't capture..." style={{ width:'100%',height:64,padding:'10px 12px',background:T.bgWhite,border:`1px solid ${T.borderMedium}`,borderRadius:T.radiusSm,fontFamily:T.fontReading,fontSize:'0.82rem',lineHeight:1.6,color:T.textPrimary,resize:'none',outline:'none',boxSizing:'border-box',transition:'border-color 0.2s' }} onFocus={e=>e.target.style.borderColor=T.amber} onBlur={e=>e.target.style.borderColor=T.borderMedium}/>
            <div style={{ fontFamily:T.fontMono,fontSize:'0.56rem',color:T.textMuted,textAlign:'right',marginTop:3 }}>{NOTE_MAX-note.length} remaining</div>
          </div>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:12 }}>
            <button onClick={()=>setStep(1)} style={{ all:'unset',cursor:'pointer',fontFamily:T.fontBody,fontSize:'0.78rem',color:T.textTertiary }}>← Back</button>
            <button onClick={()=>{setStep(3);onSubmit&&onSubmit({tier:selectedTier,reason:selectedReason,note});}} style={{ all:'unset',cursor:canAdvance?'pointer':'not-allowed',padding:'8px 22px',borderRadius:T.radiusSm,background:canAdvance?'linear-gradient(180deg,#c98a3a,#a06320)':T.bgTertiary,color:canAdvance?T.bgWhite:T.textMuted,border:canAdvance?'1px solid #8a5418':'none',fontFamily:T.fontDisplay,fontSize:'0.9rem',fontWeight:500,letterSpacing:'0.03em',transition:'all 0.2s' }}>Submit nomination</button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Comment card ──────────────────────────────────────────────────────────
function CommentCard({ comment, isNew=false }) {
  const declared = tierByKey[comment.dec];
  const ai = tierByKey[comment.ai];
  const hasContrast = comment.dec!==comment.ai;
  const [noms,setNoms] = useState(comment.noms);
  const [nominateOpen,setNominateOpen] = useState(false);

  if (comment.dec==='breach') {
    return (
      <div style={{ background:T.bgWhite,border:`1px solid ${T.borderLight}`,borderRadius:T.radiusMd,padding:20,boxShadow:T.shadowSm,opacity:0.65 }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10,flexWrap:'wrap' }}>
          <TierBadge tier={declared} size="sm"/><span style={{ fontFamily:T.fontBody,fontSize:'0.85rem',fontWeight:500,color:T.textPrimary }}>{comment.author}</span><span style={{ fontFamily:T.fontMono,fontSize:'0.65rem',color:T.textTertiary }}>{comment.time}</span>
        </div>
        <p style={{ fontFamily:T.fontReading,fontSize:'0.88rem',fontStyle:'italic',color:T.textTertiary,margin:'0 0 10px',lineHeight:1.6 }}>Content suppressed — targets a person, not an idea. Visible here with explanation per platform transparency policy.</p>
        <div style={{ fontFamily:T.fontMono,fontSize:'0.6rem',color:T.textMuted }}>Pact violation</div>
      </div>
    );
  }

  return (
    <div style={{ background:T.bgWhite,border:`1px solid ${isNew?T.gold:T.borderLight}`,borderRadius:T.radiusMd,padding:20,boxShadow:isNew?`0 0 0 2px ${T.gold}30, ${T.shadowMd}`:T.shadowSm,transition:'box-shadow 0.2s' }}
      onMouseEnter={e=>{ if(!isNew) e.currentTarget.style.boxShadow=T.shadowMd; }}
      onMouseLeave={e=>{ if(!isNew) e.currentTarget.style.boxShadow=T.shadowSm; }}
    >
      <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:12,flexWrap:'wrap' }}>
        <TierBadge tier={declared} size="sm"/>
        {hasContrast&&<span style={{ display:'inline-flex',alignItems:'center',gap:4 }}><span style={{ fontFamily:T.fontMono,fontSize:'0.52rem',color:T.textMuted }}>AI</span><TierBadge tier={ai} size="sm"/></span>}
        <span style={{ fontFamily:T.fontBody,fontSize:'0.85rem',fontWeight:500,color:T.textPrimary }}>{comment.author}</span>
        {comment.tag&&<span style={{ fontFamily:T.fontMono,fontSize:'0.58rem',color:T.amber,letterSpacing:'0.06em' }}>{comment.tag}</span>}
        <span style={{ fontFamily:T.fontMono,fontSize:'0.65rem',color:T.textTertiary }}>{comment.time}</span>
        {hasContrast&&<span style={{ fontFamily:T.fontMono,fontSize:'0.52rem',color:T.textMuted,fontStyle:'italic' }}>self-declared</span>}
        {isNew&&<span style={{ fontFamily:T.fontMono,fontSize:'0.5rem',letterSpacing:'0.1em',textTransform:'uppercase',color:T.gold,border:`1px solid ${T.gold}`,borderRadius:3,padding:'2px 6px' }}>New</span>}
      </div>
      <p style={{ fontFamily:T.fontReading,fontSize:'0.92rem',lineHeight:1.75,color:T.textBody,marginBottom:14 }}>{comment.body}</p>
      <div style={{ display:'flex',alignItems:'center',gap:18,fontFamily:T.fontMono,fontSize:'0.65rem',color:T.textTertiary,flexWrap:'wrap' }}>
        <VoteControl count={comment.votes}/>
        <span style={{ display:'inline-flex',alignItems:'center',gap:5 }}><span>Specificity</span><SpecDots level={comment.spec}/></span>
        {comment.replies>0&&<span style={{ cursor:'pointer',textDecoration:'underline',textDecorationColor:'rgba(0,0,0,0.15)',textUnderlineOffset:2 }}>↳ {comment.replies} {comment.replies===1?'reply':'replies'}</span>}
        {!nominateOpen&&(
          <button onClick={()=>setNominateOpen(true)} style={{ all:'unset',cursor:'pointer',fontFamily:T.fontMono,fontSize:'0.62rem',color:noms>0?T.amber:T.textMuted,textDecoration:noms===0?'underline':'none',textDecorationColor:'rgba(184,115,42,0.3)',textUnderlineOffset:3,transition:'color 0.15s' }}>
            {noms>0?`${noms} ${noms===1?'nomination':'nominations'}`:'Nominate for reclassification'}
          </button>
        )}
        {nominateOpen&&<span style={{ fontFamily:T.fontMono,fontSize:'0.62rem',color:T.amber }}>{noms>0?`${noms} nomination${noms>1?'s':''}`:''} · Nomination open</span>}
      </div>
      {hasContrast&&(
        <div style={{ marginTop:12,padding:'8px 12px',background:T.goldPale,border:`1px solid ${T.borderLight}`,borderLeft:`2px solid ${T.amber}`,borderRadius:`0 ${T.radiusSm} ${T.radiusSm} 0` }}>
          <span style={{ fontFamily:T.fontMono,fontSize:'0.55rem',letterSpacing:'0.1em',textTransform:'uppercase',color:T.amber }}>Contrast</span>
          <span style={{ fontFamily:T.fontReading,fontSize:'0.76rem',color:T.textSecondary,fontStyle:'italic',marginLeft:8 }}>Commenter declared <strong style={{ fontStyle:'normal',color:T.textPrimary }}>{declared.name}</strong>. Engine read <strong style={{ fontStyle:'normal',color:T.textPrimary }}>{ai.name}</strong>. Community voting will settle it.</span>
        </div>
      )}
      {nominateOpen&&<NominationPanel currentTierKey={comment.dec} onSubmit={()=>setNoms(n=>n+1)} onCancel={()=>setNominateOpen(false)}/>}
    </div>
  );
}

// ─── Compose flow ──────────────────────────────────────────────────────────
function ComposeFlow({ onPost, onCancel }) {
  const [step,setStep] = useState('write');
  const [comment,setComment] = useState('');
  const [analysis,setAnalysis] = useState(null);
  const [userTier,setUserTier] = useState(null);
  const [focused,setFocused] = useState(false);
  const [error,setError] = useState(null);
  const MAX = 1200;
  const wordCount = comment.trim() ? comment.trim().split(/\s+/).length : 0;
  const canSubmit = comment.trim().length>=12 && step==='write';

  async function handleAnalyze() {
    if (!canSubmit) return;
    setStep('analyzing'); setError(null);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:buildPrompt(comment)}] }),
      });
      const data = await res.json();
      const text = (data.content||[]).map(b=>b.text||'').join('');
      const parsed = parseResponse(text);
      setAnalysis(parsed); setUserTier(parsed.tier); setStep('reflect');
    } catch(e) { setError('Analysis engine unavailable. Please try again.'); setStep('write'); }
  }

  function handlePost() {
    if (!userTier) return;
    onPost({ author:'You', tag:null, time:'just now', dec:userTier.key, ai:analysis?.tier.key||userTier.key, votes:0, spec:analysis?.specificity||0, noms:0, replies:0, body:comment });
  }

  return (
    <div style={{ marginBottom:24,background:T.bgWhite,border:`1px solid ${T.borderLight}`,borderRadius:T.radiusMd,overflow:'hidden',boxShadow:T.shadowMd }}>
      {/* Compose header */}
      <div style={{ padding:'10px 16px',borderBottom:`1px solid ${T.borderLight}`,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <span style={{ fontFamily:T.fontDisplay,fontSize:'1rem',fontWeight:600,color:T.textPrimary }}>Add a comment</span>
        <button onClick={onCancel} style={{ all:'unset',cursor:'pointer',fontFamily:T.fontBody,fontSize:'0.78rem',color:T.textMuted }}>Cancel</button>
      </div>

      {/* WRITE */}
      {(step==='write'||step==='analyzing')&&(
        <div>
          <div style={{ padding:'7px 14px',background:T.goldPale,borderBottom:`1px solid ${T.borderLight}`,display:'flex',alignItems:'center',gap:6 }}>
            <span style={{ fontFamily:T.fontDisplay,fontSize:'0.88rem',fontWeight:500,color:T.goldMuted,fontStyle:'italic' }}>Forum-level</span>
            <span style={{ fontFamily:T.fontReading,fontSize:'0.78rem',color:T.textTertiary }}>— identify a specific claim and engage with it directly.</span>
          </div>
          <textarea value={comment} onChange={e=>setComment(e.target.value)} disabled={step==='analyzing'} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} placeholder="What do you think — and specifically, why?" maxLength={MAX}
            style={{ width:'100%',minHeight:120,padding:'14px 16px',background:T.bgWhite,border:'none',borderBottom:`1px solid ${focused?T.amber:T.borderLight}`,fontFamily:T.fontReading,fontSize:'0.92rem',lineHeight:1.7,color:T.textPrimary,resize:'vertical',outline:'none',boxSizing:'border-box',display:'block',transition:'border-color 0.2s' }}/>
          <div style={{ padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <span style={{ fontFamily:T.fontMono,fontSize:'0.6rem',color:T.textMuted }}>{wordCount} words · {MAX-comment.length} remaining</span>
            {step==='analyzing'
              ? <div style={{ display:'flex',alignItems:'center',gap:8 }}><span style={{ fontFamily:T.fontMono,fontSize:'0.6rem',letterSpacing:'0.1em',textTransform:'uppercase',color:T.textMuted }}>Reading</span><span style={{ display:'flex',gap:3,alignItems:'center' }}>{[0,1,2].map(i=><span key={i} style={{ width:4,height:4,borderRadius:'50%',background:T.textMuted,display:'inline-block',animation:`dp 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}</span></div>
              : <button onClick={handleAnalyze} disabled={!canSubmit} style={{ all:'unset',cursor:canSubmit?'pointer':'not-allowed',padding:'9px 22px',borderRadius:T.radiusSm,background:canSubmit?'linear-gradient(180deg,#c98a3a,#a06320)':T.bgSecondary,color:canSubmit?T.bgWhite:T.textMuted,border:canSubmit?'1px solid #8a5418':'none',fontFamily:T.fontDisplay,fontSize:'1rem',fontWeight:500,letterSpacing:'0.03em',transition:'all 0.2s' }}>Analyze my comment</button>
            }
          </div>
          {error&&<p style={{ fontFamily:T.fontReading,fontSize:'0.8rem',color:T.terra,margin:'0 14px 10px',fontStyle:'italic' }}>{error}</p>}
        </div>
      )}

      {/* REFLECT */}
      {step==='reflect'&&analysis&&(
        <div style={{ padding:16 }}>
          {/* Comment preview */}
          <div style={{ background:T.bgSecondary,border:`1px solid ${T.borderLight}`,borderRadius:T.radiusSm,padding:'10px 14px',marginBottom:12,display:'flex',gap:12,alignItems:'flex-start' }}>
            <p style={{ fontFamily:T.fontReading,fontSize:'0.88rem',lineHeight:1.65,color:T.textBody,margin:0,flex:1 }}>{comment}</p>
            <button onClick={()=>{setStep('write');setAnalysis(null);setUserTier(null);}} style={{ all:'unset',cursor:'pointer',fontFamily:T.fontBody,fontSize:'0.75rem',color:T.amber,textDecoration:'underline',textDecorationColor:'rgba(184,115,42,0.3)',textUnderlineOffset:3,whiteSpace:'nowrap',flexShrink:0 }}>Edit</button>
          </div>

          {/* AI card — Section 10 canonical */}
          <div style={{ background:T.goldPale,border:`1px solid #E8D080`,borderLeft:`3px solid ${T.amber}`,borderRadius:`0 ${T.radiusMd} ${T.radiusMd} 0`,padding:'16px 16px 14px 18px',marginBottom:14 }}>
            <div style={{ fontFamily:T.fontMono,fontSize:'0.6rem',letterSpacing:'0.12em',textTransform:'uppercase',color:T.amber,marginBottom:8 }}>Classification Engine</div>
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
              <TierBadge tier={analysis.tier} size="lg"/>
              {analysis.borderline!=='No'&&<span style={{ fontFamily:T.fontMono,fontSize:'0.58rem',letterSpacing:'0.1em',textTransform:'uppercase',color:T.goldMuted }}>Borderline</span>}
            </div>
            <p style={{ fontFamily:T.fontReading,fontSize:'0.9rem',lineHeight:1.7,color:T.textBody,margin:'0 0 12px' }}>{analysis.message}</p>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 20px',marginBottom:10 }}>
              {[['Specificity',<SpecDots level={analysis.specificity}/>],['Register',analysis.emotion],['Tribal signals',analysis.tribal],['Engages article',analysis.engagement],['Opposing view',analysis.opposing]].map(([label,val])=>(
                <div key={label} style={{ display:'flex',alignItems:'center',gap:8 }}>
                  <span style={{ fontFamily:T.fontMono,fontSize:'0.56rem',letterSpacing:'0.12em',textTransform:'uppercase',color:T.textTertiary,minWidth:86 }}>{label}</span>
                  <span style={{ fontFamily:T.fontBody,fontSize:'0.76rem',color:T.textBody }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex',gap:14,alignItems:'center' }}>
              <span style={{ fontFamily:T.fontBody,fontSize:'0.82rem',fontWeight:500,color:T.amber,textDecoration:'underline',textDecorationColor:'rgba(184,115,42,0.3)',textUnderlineOffset:3 }}>Declare your tier below →</span>
              <span style={{ fontFamily:T.fontMono,fontSize:'0.62rem',color:T.textMuted }}>or post with the AI’s reading</span>
            </div>
          </div>

          {/* Self-declaration grid */}
          <div style={{ border:`1px solid ${T.borderLight}`,borderRadius:T.radiusMd,overflow:'hidden',marginBottom:12 }}>
            <div style={{ padding:'11px 16px',borderBottom:`1px solid ${T.borderLight}`,display:'flex',alignItems:'baseline',gap:8 }}>
              <h3 style={{ fontFamily:T.fontDisplay,fontSize:'1.1rem',fontWeight:600,color:T.textPrimary,margin:0 }}>Declare your tier</h3>
              <span style={{ fontFamily:T.fontReading,fontSize:'0.76rem',fontStyle:'italic',color:T.textTertiary }}>The AI’s reading and yours will both be shown.</span>
            </div>
            <div style={{ padding:'12px 14px' }}>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))',gap:7,marginBottom:12 }}>
                {TIERS.map(tier=>{
                  const isSelected = userTier?.key===tier.key;
                  const isAi = tier.key===analysis.tier.key;
                  return (
                    <button key={tier.key} onClick={()=>setUserTier(tier)} style={{ all:'unset',cursor:'pointer',textAlign:'left',display:'flex',flexDirection:'column',gap:4,padding:'10px 12px',borderRadius:T.radiusMd,background:isSelected?`linear-gradient(180deg,${tier.top},${tier.bot})`:T.bgSecondary,border:`2px solid ${isSelected?tier.border:T.borderLight}`,position:'relative',transition:'all 0.15s' }}>
                      {isAi&&<span style={{ position:'absolute',top:-8,right:8,background:T.darkCard,color:T.gold,fontFamily:T.fontMono,fontSize:'0.5rem',letterSpacing:'0.12em',textTransform:'uppercase',padding:'2px 7px',borderRadius:10,border:`1px solid ${T.goldMuted}` }}>AI suggestion</span>}
                      <span style={{ display:'flex',alignItems:'center',gap:6 }}>
                        <span style={{ display:'flex',alignItems:'center',color:isSelected?tier.text:T.textSecondary }}>{tier.icon(13)}</span>
                        <span style={{ fontFamily:T.fontDisplay,fontSize:'0.95rem',fontWeight:600,color:isSelected?tier.text:T.textPrimary,lineHeight:1 }}>{tier.name}</span>
                      </span>
                      <span style={{ fontFamily:T.fontReading,fontSize:'0.72rem',lineHeight:1.45,color:isSelected?tier.text:T.textSecondary,opacity:isSelected?0.9:1 }}>{tier.desc}</span>
                    </button>
                  );
                })}
              </div>
              {userTier&&userTier.key!==analysis.tier.key&&(
                <div style={{ padding:'9px 12px',background:T.goldPale,border:`1px solid ${T.borderMedium}`,borderRadius:T.radiusSm,marginBottom:12 }}>
                  <p style={{ fontFamily:T.fontReading,fontSize:'0.78rem',lineHeight:1.6,color:T.textSecondary,margin:0,fontStyle:'italic' }}>
                    The AI reads this as <strong style={{ fontStyle:'normal',color:T.textPrimary }}>{analysis.tier.name}</strong>. You’re declaring <strong style={{ fontStyle:'normal',color:T.textPrimary }}>{userTier.name}</strong>. Both will be visible. That contrast is part of the record.
                  </p>
                </div>
              )}
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:12 }}>
                <span style={{ fontFamily:T.fontMono,fontSize:'0.56rem',letterSpacing:'0.07em',color:T.textMuted }}>
                  {!userTier?'Select a tier to declare':userTier.key===analysis.tier.key?"Accepting the AI’s reading":`Overriding AI · declaring ${userTier.short}`}
                </span>
                <button onClick={handlePost} disabled={!userTier} style={{ all:'unset',cursor:userTier?'pointer':'not-allowed',padding:'10px 26px',borderRadius:T.radiusSm,background:userTier?T.bgDark:T.bgSecondary,color:userTier?T.bgPrimary:T.textMuted,fontFamily:T.fontDisplay,fontSize:'1rem',fontWeight:500,letterSpacing:'0.03em',transition:'all 0.2s' }}>Post comment</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Topology bar ──────────────────────────────────────────────────────────
function DistributionBar({ comments, activeTier, onTierClick }) {
  const counts = Object.fromEntries(TIERS.map(t=>[t.key,0]));
  comments.forEach(c=>counts[c.dec]++);
  const total = comments.length;
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontFamily:T.fontMono,fontSize:'0.56rem',letterSpacing:'0.15em',textTransform:'uppercase',color:T.textMuted,marginBottom:7 }}>Discussion topology — {total} comments</div>
      <div style={{ display:'flex',height:10,borderRadius:6,overflow:'hidden',gap:1,marginBottom:7 }}>
        {TIERS.map(tier=>{ const n=counts[tier.key]; if(!n) return null; return <div key={tier.key} onClick={()=>onTierClick(tier.key)} title={`${tier.name}: ${n}`} style={{ flex:(n/total)*100,minWidth:6,background:`linear-gradient(180deg,${tier.top},${tier.bot})`,border:`1px solid ${tier.border}`,cursor:'pointer',opacity:activeTier&&activeTier!==tier.key?0.3:1,transition:'opacity 0.2s' }}/>; })}
      </div>
      <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
        {TIERS.filter(t=>counts[t.key]>0).map(tier=>(
          <button key={tier.key} onClick={()=>onTierClick(tier.key)} style={{ all:'unset',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:4,opacity:activeTier&&activeTier!==tier.key?0.35:1,transition:'opacity 0.2s' }}>
            <span style={{ display:'flex',alignItems:'center',color:tier.text,background:`linear-gradient(180deg,${tier.top},${tier.bot})`,border:`1px solid ${tier.border}`,borderRadius:3,padding:'1px 4px' }}>{tier.icon(9)}</span>
            <span style={{ fontFamily:T.fontMono,fontSize:'0.58rem',color:T.textTertiary }}>{tier.short} <span style={{ color:T.textMuted }}>{counts[tier.key]}</span></span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Control bar ───────────────────────────────────────────────────────────
function ControlBar({ activeTier, onTierChange, activeSort, onSortChange }) {
  return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap',padding:'10px 14px',background:'linear-gradient(to bottom,#eceae4 0%,#d8d4cc 48%,#eceae4 100%)',borderRadius:T.radiusSm,border:`1px solid ${T.borderLight}`,marginBottom:16,position:'sticky',top:86,zIndex:10 }}>
      <div style={{ display:'flex',alignItems:'center',gap:5,flexWrap:'wrap' }}>
        <span style={{ fontFamily:T.fontMono,fontSize:'0.56rem',letterSpacing:'0.12em',textTransform:'uppercase',color:T.textTertiary,marginRight:2 }}>Show</span>
        <button onClick={()=>onTierChange(null)} style={{ all:'unset',cursor:'pointer',padding:'3px 10px',borderRadius:T.radiusSm,background:!activeTier?T.bgDark:'transparent',color:!activeTier?T.bgPrimary:T.textSecondary,border:`1px solid ${!activeTier?T.bgDark:T.borderMedium}`,fontFamily:T.fontMono,fontSize:'0.6rem',letterSpacing:'0.06em',fontWeight:500,transition:'all 0.15s' }}>All</button>
        {TIERS.map(tier=>(
          <button key={tier.key} onClick={()=>onTierChange(tier.key===activeTier?null:tier.key)} style={{ all:'unset',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:4,padding:'3px 8px',borderRadius:T.radiusSm,background:activeTier===tier.key?`linear-gradient(180deg,${tier.top},${tier.bot})`:'transparent',border:`1px solid ${activeTier===tier.key?tier.border:T.borderLight}`,color:activeTier===tier.key?tier.text:T.textTertiary,fontFamily:T.fontMono,fontSize:'0.58rem',transition:'all 0.15s',opacity:activeTier&&activeTier!==tier.key?0.5:1 }}>
            <span style={{ display:'flex',alignItems:'center' }}>{tier.icon(9)}</span>{tier.short}
          </button>
        ))}
      </div>
      <div style={{ display:'flex',alignItems:'center',gap:5 }}>
        <span style={{ fontFamily:T.fontMono,fontSize:'0.56rem',letterSpacing:'0.12em',textTransform:'uppercase',color:T.textTertiary }}>Sort</span>
        {SORT_OPTIONS.map(opt=>(
          <button key={opt.key} onClick={()=>onSortChange(opt.key)} style={{ all:'unset',cursor:'pointer',padding:'3px 10px',borderRadius:T.radiusSm,background:activeSort===opt.key?T.goldPale:'transparent',color:activeSort===opt.key?T.amber:T.textTertiary,border:`1px solid ${activeSort===opt.key?T.borderMedium:'transparent'}`,fontFamily:T.fontMono,fontSize:'0.6rem',letterSpacing:'0.04em',fontWeight:activeSort===opt.key?500:400,transition:'all 0.15s' }}>{opt.label}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function DiscourseLayer() {
  const [comments,setComments] = useState(INITIAL_COMMENTS);
  const [newIds,setNewIds] = useState(new Set());
  const [composing,setComposing] = useState(false);
  const [activeTier,setActiveTier] = useState(null);
  const [activeSort,setActiveSort] = useState('quality');
  const nextId = useRef(100);
  const composeRef = useRef(null);

  useEffect(()=>{
    if (!document.getElementById('d-fonts')) {
      const l=document.createElement('link'); l.id='d-fonts'; l.rel='stylesheet';
      l.href='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Mono:wght@300;400;500&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap';
      document.head.appendChild(l);
    }
  },[]);

  function handleComposeClick() {
    setComposing(true);
    setTimeout(()=>composeRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }),50);
  }

  function handlePost(commentData) {
    const id = nextId.current++;
    const newComment = { ...commentData, id };
    setComments(prev=>[newComment,...prev]);
    setNewIds(prev=>new Set(prev).add(id));
    setComposing(false);
    setActiveTier(null);
    setTimeout(()=>setNewIds(prev=>{ const s=new Set(prev); s.delete(id); return s; }), 6000);
  }

  const sorted = useMemo(()=>{
    let list = [...comments];
    if (activeTier) list=list.filter(c=>c.dec===activeTier);
    if (activeSort==='quality') list.sort((a,b)=>tierByKey[a.dec].rank-tierByKey[b.dec].rank||b.votes-a.votes);
    if (activeSort==='newest') list.sort((a,b)=>b.id-a.id);
    if (activeSort==='discussed') list.sort((a,b)=>(b.votes+b.replies*2+b.noms)-(a.votes+a.replies*2+a.noms));
    return list;
  },[comments,activeTier,activeSort]);

  const activeTierObj = activeTier ? tierByKey[activeTier] : null;

  return (
    <div style={{ fontFamily:T.fontBody,background:`linear-gradient(135deg,#a8a398 0px,#8c8780 175px,#f7f2e8 775px,#f7f2e8 100%)`,minHeight:'100vh',position:'relative' }}>
      <div style={{ position:'fixed',inset:0,pointerEvents:'none',zIndex:0,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.035'/%3E%3C/svg%3E")` }}/>

      <nav style={{ position:'sticky',top:0,zIndex:100,background:'linear-gradient(135deg,#f7f2e8 0%,#1c1814 65%,#1c1814 100%)',borderBottom:'1px solid rgba(184,115,42,0.22)',height:52,display:'flex',alignItems:'center' }}>
        <div style={{ maxWidth:1060,margin:'0 auto',padding:'0 32px 0 20px',width:'100%',display:'flex',alignItems:'center' }}>
          <span style={{ fontFamily:T.fontDisplay,fontSize:'1.4rem',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',background:'linear-gradient(to right,#ecb438 0%,#f5dfa0 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',filter:'drop-shadow(0 1px 0 rgba(28,24,20,0.45))' }}>Dialecta</span>
        </div>
      </nav>
      <div style={{ position:'sticky',top:52,zIndex:99,height:34,background:'linear-gradient(to bottom,#eceae4 0%,#d8d4cc 48%,#eceae4 100%)',display:'flex',alignItems:'center' }}>
        <div style={{ position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(to right,transparent,rgba(255,255,255,0.96),transparent)' }}/>
        <div style={{ position:'absolute',bottom:0,left:0,right:0,height:1,background:'linear-gradient(to right,transparent,rgba(255,255,255,0.96),transparent)' }}/>
        <div style={{ maxWidth:1060,margin:'0 auto',padding:'0 32px 0 20px',width:'100%',display:'flex',alignItems:'center',position:'relative',zIndex:1 }}>
          {['Articles','Community','Stewards','About','The Pact'].map((l,i,arr)=>(
            <span key={l} style={{ fontFamily:T.fontBody,fontSize:'0.82rem',fontWeight:400,letterSpacing:'0.01em',color:'#3a342c',padding:'0 13px',height:34,display:'flex',alignItems:'center',borderRight:i<arr.length-1?'1px solid rgba(180,175,165,0.28)':'none',cursor:'pointer' }}>{l}</span>
          ))}
        </div>
      </div>

      <div style={{ position:'relative',zIndex:1,maxWidth:1060,margin:'0 auto',padding:'40px 32px 80px' }}>
        {/* Article header */}
        <div style={{ paddingBottom:28,borderBottom:`2px solid ${T.amber}`,marginBottom:32 }}>
          <div style={{ fontFamily:T.fontMono,fontSize:'0.62rem',letterSpacing:'0.12em',textTransform:'uppercase',color:T.textTertiary,marginBottom:8,display:'flex',gap:16 }}>
            <span>{ARTICLE.author}</span><span>{ARTICLE.date}</span><span>{ARTICLE.read}</span>
          </div>
          <h1 style={{ fontFamily:T.fontDisplay,fontSize:'2.2rem',fontWeight:600,color:T.textPrimary,lineHeight:1.12,letterSpacing:'-0.01em',marginBottom:8 }}>{ARTICLE.title}</h1>
          <p style={{ fontFamily:T.fontReading,fontSize:'1.0rem',fontWeight:300,fontStyle:'italic',color:T.textSecondary,lineHeight:1.6,maxWidth:640,marginBottom:18 }}>{ARTICLE.subtitle}</p>
          <div style={{ fontFamily:T.fontMono,fontSize:'0.58rem',letterSpacing:'0.15em',textTransform:'uppercase',color:T.textMuted,marginBottom:7 }}>Author’s key claims</div>
          {ARTICLE.claims.map((c,i)=>(
            <div key={i} style={{ display:'flex',gap:10,marginBottom:5 }}>
              <span style={{ fontFamily:T.fontMono,fontSize:'0.62rem',color:T.amber,marginTop:2 }}>{i+1}.</span>
              <span style={{ fontFamily:T.fontReading,fontSize:'0.82rem',lineHeight:1.55,color:T.textSecondary }}>{c}</span>
            </div>
          ))}
        </div>

        {/* Discussion */}
        <div style={{ maxWidth:720 }}>
          <div style={{ display:'flex',alignItems:'baseline',justifyContent:'space-between',gap:12,marginBottom:composing?16:20,flexWrap:'wrap' }}>
            <h2 style={{ fontFamily:T.fontDisplay,fontSize:'1.4rem',fontWeight:600,color:T.textPrimary }}>Discussion</h2>
            {!composing&&<button onClick={handleComposeClick} style={{ all:'unset',cursor:'pointer',padding:'8px 20px',borderRadius:T.radiusSm,background:'linear-gradient(180deg,#c98a3a,#a06320)',color:T.bgWhite,border:'1px solid #8a5418',fontFamily:T.fontDisplay,fontSize:'0.9rem',fontWeight:500,letterSpacing:'0.03em' }}>Add a comment</button>}
          </div>

          {/* Compose */}
          <div ref={composeRef}>
            {composing&&<ComposeFlow onPost={handlePost} onCancel={()=>setComposing(false)}/>}
          </div>

          <DistributionBar comments={comments} activeTier={activeTier} onTierClick={k=>setActiveTier(p=>p===k?null:k)}/>
          <ControlBar activeTier={activeTier} onTierChange={k=>setActiveTier(p=>p===k?null:k)} activeSort={activeSort} onSortChange={setActiveSort}/>

          {activeTierObj&&(
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
              <span style={{ fontFamily:T.fontMono,fontSize:'0.58rem',color:T.textMuted,letterSpacing:'0.06em',textTransform:'uppercase' }}>Showing</span>
              <TierBadge tier={activeTierObj} size="md"/>
              <button onClick={()=>setActiveTier(null)} style={{ all:'unset',cursor:'pointer',fontFamily:T.fontBody,fontSize:'0.75rem',color:T.amber,textDecoration:'underline',textDecorationColor:'rgba(184,115,42,0.3)',textUnderlineOffset:3 }}>Clear filter</button>
            </div>
          )}

          <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
            {sorted.length>0
              ? sorted.map(c=><CommentCard key={c.id} comment={c} isNew={newIds.has(c.id)}/>)
              : <div style={{ padding:'40px 20px',textAlign:'center' }}><p style={{ fontFamily:T.fontDisplay,fontSize:'1.2rem',fontStyle:'italic',color:T.textTertiary,marginBottom:6 }}>No {activeTierObj?.name} comments yet.</p><p style={{ fontFamily:T.fontReading,fontSize:'0.82rem',color:T.textMuted }}>Be the first — or browse other tiers.</p></div>
            }
          </div>

          <div style={{ marginTop:28,padding:'14px 18px',background:T.bgWhite,border:`1px solid ${T.borderLight}`,borderLeft:`3px solid ${T.amber}`,borderRadius:`0 ${T.radiusMd} ${T.radiusMd} 0` }}>
            <span style={{ fontFamily:T.fontMono,fontSize:'0.58rem',letterSpacing:'0.12em',textTransform:'uppercase',color:T.amber }}>How this works</span>
            <p style={{ fontFamily:T.fontReading,fontSize:'0.82rem',lineHeight:1.65,color:T.textSecondary,margin:'6px 0 0',fontStyle:'italic' }}>Comments are sorted by quality by default — Forum-tier contributions surface first. Every tier is browseable. Classification is a combination of AI pre-analysis, commenter self-declaration, and community voting. Nothing is hidden without explanation.</p>
          </div>
        </div>
      </div>

      <style>{`@keyframes dp{0%,100%{opacity:0.3;transform:scale(0.8);}50%{opacity:1;transform:scale(1);}} textarea::placeholder{color:#9a8e80;font-weight:300;} *{box-sizing:border-box;}`}</style>
    </div>
  );
}
