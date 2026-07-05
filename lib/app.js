import { supabase } from './supabaseClient';

export default function runApp(){
const supa = supabase;

/* ============================================================
   TANOTO FOUNDATION · TFID PORTFOLIO ASSESSMENT SYSTEM
   Supabase-backed cloud storage. Vanilla JS core, wrapped in Next.js.
   Referensi: TFID Portfolio Assessment Workbook v1.0
   ============================================================ */

/* ---------- Konfigurasi Framework ---------- */
const SCALE5 = [
  {v:1,l:'1',cls:'s1',t:'Limited / Very Low'},
  {v:2,l:'2',cls:'s2',t:'Emerging / Low'},
  {v:3,l:'3',cls:'s3',t:'Moderate / Medium'},
  {v:4,l:'4',cls:'s4',t:'Strong / High'},
  {v:5,l:'5',cls:'s5',t:'Very Strong / Very High'}
];
const YESNO = [{v:'Yes',l:'Yes',cls:'yes'},{v:'No',l:'No',cls:'no'},{v:'N/A',l:'N/A',cls:'na'}];
const LMH = [
  {v:'Low',l:'Low',cls:'rL'},
  {v:'Medium',l:'Med',cls:'rM'},
  {v:'High',l:'High',cls:'rH'}
];

/* Factor 1–6 dan sub-framework risk */
const FACTORS = {
  smf:{code:'F1',num:'1',name:'Strategic Mission Fit',owner:'SPP',type:'scale5',
    q:'Is this the right investment aligned with TF’s mission?',
    dims:[
      ['mission_alignment','Mission Alignment','Does the project contribute directly to TF’s mission and long-term strategic goals?'],
      ['strategic_priority','Strategic Priority','Does it support one or more of TF’s priority portfolios and strategic focus?'],
      ['problem_significance','Problem Significance','Does it address a high-priority development challenge with significant unmet need?'],
      ['longterm_relevance','Long-term Relevance','Will this issue remain strategically important over the next 5–10 years?'],
      ['portfolio_synergy','Portfolio Synergy','Does it complement and strengthen other TF programs (not duplicate/compete)?'],
      ['resource_justification','Resource Justification','Given limited resources, is it important enough to remain in TF’s portfolio?']
    ]},
  gov:{code:'F2',num:'2',name:'Government Alignment',owner:'P&A',type:'yesno',
    q:'Is there current political momentum and policy demand?',
    dims:[
      ['presidential','Presidential Priority / Quick Win','Aligned with the 8 Astacita, 8 PHTC quick wins, or 17 national priority programs?'],
      ['rpjmn','RPJMN 2025–2029','Aligned with the National Medium-Term Development Plan (RPJMN)?'],
      ['renstra','Ministry Strategic Planning (Renstra)','Aligned with the relevant ministry’s Strategic Plan (Renstra)?'],
      ['renja','Ministry Annual Workplan (2026)','Aligned with the Annual Workplan (Renja) / RKA-KL 2026?']
    ]},
  evi:{code:'F3',num:'3',name:'Evidence of Impact',owner:'MLE',type:'scale5',
    q:'Do we know this intervention works?',
    dims:[
      ['toc','Theory of Change','Is there a clear, plausible causal pathway from intervention to outcome? (ToC, LogFrame)'],
      ['mne','Monitoring & Measurement','Are outputs and outcomes measured with reliable indicators? (M&E Framework, Dashboard)'],
      ['eval_quality','Evaluation Quality','Independently evaluated with appropriate methodology? (Baseline/Endline, RCT, Quasi, Mixed)'],
      ['strength','Strength of Evidence','How convincing is the evidence that the intervention causes the outcome?'],
      ['consistency','Consistency of Results','Are positive results consistent across sites/populations/cycles? (Replication, multi-site)'],
      ['knowledge','Knowledge Translation','Are learnings documented and disseminated to influence practice/policy?'],
      ['learning','Learning & Adaptation','Is there continuous, evidence-based improvement? (Adaptive management)']
    ]},
  cai:{code:'F4a',num:'4a',name:'Comparative Advantage — Internal',owner:'SPP',type:'scale5',
    q:'Is TF uniquely positioned and well-suited to lead this work?',
    dims:[
      ['tech','Unique Technical Expertise','Does TF have expertise that others find hard to replicate?'],
      ['evi_lead','Evidence Leadership','Has TF produced unique evidence/models/innovation in this area?'],
      ['gov_trust','Government Trust & Access','Does TF have trusted relationships and influence others lack?'],
      ['convening','Convening Power','Can TF convene partners who might not otherwise collaborate?'],
      ['impl_exp','Implementation Experience','Does TF have significant operational experience in this field?'],
      ['leverage','Partnership Leverage','Does TF’s involvement attract additional partners/funding/expertise?'],
      ['brand','Brand Credibility','Does TF have the credibility and reputation to lead and influence stakeholders?']
    ]},
  cae:{code:'F4b',num:'4b',name:'Comparative Advantage — External Landscape',owner:'SPP',type:'scale5',
    q:'How does TF compare with other actors in the ecosystem?',
    note:'For dimensions 1–5, a higher score = stronger TF position (e.g., few alternative providers, TF fills a gap).',
    dims:[
      ['alt_prov','Alternative Providers','Are there few other organizations doing similar work? (fewer = higher score)'],
      ['cap_others','Capability of Others','Is TF stronger than them? (stronger = higher score)'],
      ['scale_others','Scale of Others','Is TF competitive on resources/reach? (competitive = higher score)'],
      ['gov_pref','Government Preference','Is TF well positioned vs the government’s preferred partners? (yes = higher score)'],
      ['saturation','Market Saturation','Is this space not yet saturated? (unsaturated = higher score)'],
      ['gap','Gap in the Ecosystem','Does TF fill a genuine gap in the ecosystem?'],
      ['substitut','Substitutability','Does TF address an unmet need that is hard to substitute?']
    ]},
  sys:{code:'F6',num:'6',name:'Contribution to System Change',owner:'MLE',type:'scale5',
    q:'To what extent does the project create durable system change?',
    dims:[
      ['institutional','Institutional Change','Strengthens/creates lasting institutions, systems, or delivery mechanisms?'],
      ['policy','Policy Influence','Has it influenced government policy, regulation, standards, or guidelines?'],
      ['gov_own','Government Ownership','Is government increasingly leading/financing/institutionalizing the intervention?'],
      ['capacity','Capacity Strengthening','Builds lasting capability in government/partner institutions?'],
      ['financing','Financing Sustainability','Is there a sustainable financing mechanism beyond TF funding?'],
      ['replication','Replication Potential','Can it be replicated by government/others with reasonable fidelity?'],
      ['scale','Scale Potential','Is there a credible pathway to reach a much larger population?'],
      ['catalytic','Catalytic Effect','Does it catalyze ecosystem change, partnerships, or additional investment?']
    ]}
};

/* Sub-framework risk (Factor 5) */
const RISKS = {
  adoption:{code:'5a',name:'Government Adoption Risk',type:'yesno_risk',
    desc:'Risk that government fails to adopt, finance, or institutionalize the program. ("Yes" answers lower the risk)',
    dims:[
      ['policy_align','Policy Alignment','Aligned with national/sub-national priorities? (RPJMN, RPJMD, RKP/RKPD)'],
      ['budget','Budget Availability','Has government allocated/indicated budget? (APBN, APBD, DIPA)'],
      ['indicator','Performance Indicator','Are there official indicators/targets supporting this work?'],
      ['ownership','Institutional Ownership','Is a ministry/unit formally assigned?'],
      ['champion','Government Champion','Is there an active senior champion driving this agenda?']
    ]},
  operational:{code:'5b',name:'Operational Risk',type:'lmh',
    desc:'Likelihood that TF’s scope of work cannot be delivered effectively, on time, or at the quality intended.',
    dims:[
      ['delivery_cap','Delivery Capacity','Do TF/partners have adequate technical capacity?'],
      ['complexity','Implementation Complexity','How complex is delivery (locations, stakeholders, logistics)?'],
      ['partner_cap','Partner Capacity','Can implementing partners deliver consistently?'],
      ['dependency','Dependency Risk','Does success depend on many external actors beyond control?'],
      ['qa','Quality Assurance','Is there a system to maintain implementation fidelity?'],
      ['mon_data','Monitoring & Data','Can progress and outcomes be measured reliably?'],
      ['scalability','Scalability of Operations','Can operations scale realistically without major redesign?']
    ]},
  political:{code:'5c',name:'Political Risk',type:'lmh',
    desc:'Vulnerability to political change, leadership transition, or policy shifts.',
    dims:[
      ['leadership_dep','Leadership Dependency','Does success depend on a handful of individuals?'],
      ['policy_stab','Policy Stability','Is the policy likely to persist over the next 2–5 years?'],
      ['visibility','Political Visibility','Is this a politically sensitive issue?'],
      ['election','Election Sensitivity','Could elections/leadership change have significant impact?'],
      ['regulatory','Regulatory Uncertainty','Are major regulatory changes anticipated?'],
      ['cross_min','Cross-Ministry Alignment','Is ownership broad or limited to a single ministry?']
    ]},
  reputational:{code:'5d',name:'Reputational Risk',type:'lmh',
    desc:'Likelihood that TF’s credibility/public trust is negatively affected by association with the program.',
    dims:[
      ['beneficiary','Beneficiary Harm','Could poor implementation negatively affect beneficiaries?'],
      ['delivery_fail','Delivery Failure','Would implementation failure be highly visible publicly?'],
      ['partner_rep','Partner Reputation','Could partner conduct damage TF’s reputation?'],
      ['scrutiny','Public Scrutiny','Could the project attract significant media/public attention?'],
      ['financial','Financial Accountability','Could fund misuse create reputational issues?'],
      ['evi_cred','Evidence Credibility','Could weak evidence damage TF’s credibility?'],
      ['brand_sens','Brand Sensitivity','Would failure affect TF’s standing as a trusted partner?']
    ]}
};

/* 5-Stage Program Lifecycle */
const STAGES = [
  {id:'design','n':'Stage 1','t':'Design / Pilot Design','d':'Initial concept & design, formative research'},
  {id:'pilot','n':'Stage 2','t':'Pilot / Demonstration','d':'Testing the model in limited sites'},
  {id:'evidence','n':'Stage 3','t':'Evidence Generated','d':'Impact evidence generated & validated'},
  {id:'ecosystem','n':'Stage 4','t':'Ecosystem / Adoption','d':'Partner/government adoption, ecosystem strengthening'},
  {id:'system','n':'Stage 5','t':'System Change / Scale','d':'Institutionalization & national scale'}
];

/* Micro-Meso-Macro */
const LEVELS = {
  Micro:['Household','Children','Teachers','Parents','Students','College Students','Youth','Government officials'],
  Meso:['District Government','Universities','Community organizations','Professional Associations'],
  Macro:['National Policy','Standards','Financing','Government Systems','Workforce']
};

/* Recommendation portfolio actions */
const RECOMMENDATIONS = [
  {v:'Continue',cls:'p-green'},{v:'Strengthen',cls:'p-blue'},{v:'Adapt',cls:'p-amber'},
  {v:'Reposition',cls:'p-orange'},{v:'Pause',cls:'p-slate'},{v:'Transition',cls:'p-red'}
];

/* Category Government Alignment (slide 33) */
const GOV_CATEGORIES = [
  {v:'Strong',cls:'p-green',def:'Directly tied to Presidential Quick Wins & RPJMN KPA; clear government owner, indicators, and budget.'},
  {v:'Aligned',cls:'p-blue',def:'Directly relevant to RPJMN/Renstra/Renja/RKA-KL priorities, but not a direct Quick Win.'},
  {v:'Enabling',cls:'p-amber',def:'Indirectly supportive (human capital, ecosystem, evidence, policy capacity) without a direct owner/budget line.'},
  {v:'Weak/No',cls:'p-red',def:'No verified link to RPJMN, Renstra/Renja/RKA-KL, indicators, or budget.'}
];

/* ---------- Seed data: daftar program/project dari Workbook ---------- */
const SEED = [
  // ECED Portfolio
  ['ECED','Rumah Anak SIGAP','Program','Community/center-based ECED model for children 0–3 and caregivers, combining early stimulation, parenting, safe/inclusive environment.','Evidence generated','Micro','LE-ECED'],
  ['ECED','Sekolah Anak SIGAP','Program','Early childhood education initiative to optimize foundational development and school readiness of children aged 4–6 via play-based learning and practical mathematics for educators.','Implementation, Evidence n/a','Micro','LE-ECED'],
  ['ECED','Rumah Anak SIGAP Replication','Project','','Implementation','Meso','LE-ECED'],
  ['ECED','Nudging for Parents - RAS','Project','Formative design research to adapt CRADLE-style nudging messages into the Rumah Anak SIGAP context.','Pilot design','Micro','LE-ECED'],
  ['ECED','GSL School Leadership - SAS','Project','Collaborative early childhood education pilot to improve quality of play-based learning through instructional leadership & mentoring skills training for teachers.','Pilot','Micro','LE-ECED'],
  ['ECED','SIGAP Children Story Book','Project','','Implementation','Macro','P&A - EcoDev'],
  ['ECED','SPRING','Project','Early stimulation & child development integration into primary health/community service platforms (Posyandu, Pustu, Puskesmas).','Demonstration Pilot','Macro','P&A - EcoDev'],
  ['ECED','ECED Council & ECED Collaborative','Project','Think tank, ecosystem enabler & advocate for the early childhood ecosystem, supporting optimal growth, development, and school readiness.','Ecosystem Development','Macro','P&A - EcoDev'],
  ['ECED','Parenting & Early Stimulation Advocacy — Sub-National','Project','','Policy Influence','Meso','P&A & LE-RO'],
  ['ECED','Parenting & Early Stimulation Advocacy — National','Project','','Policy Influence - System Change','Macro','P&A'],
  // MCHN Portfolio
  ['MCHN','MDTF IHCA','Project','Financial support for the stunting reduction pillar; multi-collaboration to support scale-up of early stimulation & parenting interventions.','Implementation, Evidence generated','Micro','LE-ECED'],
  ['MCHN','District-level Stunting Reduction (DSR) 2.0','Project','District–village behavior change & data-driven convergence platform via community leader training, planning/budgeting, monitoring, and data use.','Implementation, Evidence n/a','Micro','LE-ECED'],
  ['MCHN','PASTI 2.0','Project','Subnational stunting model supporting district/village convergence, local government commitment, behavior change & evidence for replication/exit.','Implementation','Meso','LE-ECED'],
  ['MCHN','ALPHA','Project','MCHN / First 1,000 Days program focusing on IYCF, dietary diversity, growth monitoring, child development, maternal-child nutrition guidelines, governance & implementation.','Pilot','Micro','LE-ECED'],
  ['MCHN','MBG BGN TA','Project','Targeted TA to support MBG in regulatory drafting, public kitchen capacity via LMS, community health education, and impact evaluation frameworks.','Implementation','Micro','P&A - GEA'],
  ['MCHN','SINERGI','Project','Improve nutritional status of vulnerable groups (pregnant women, breastfeeding mothers, under-fives) at national scale by integrating fortified rice & nutrition education into MBG.','Pilot design','Macro','P&A - GEA'],
  ['MCHN','Food Safety & Traceability','Project','Scalable national food safety model for MBG via SOPs & an Intelligent Decision Support System (IDSS) to mitigate systemic food poisoning risks across supply chains.','Demonstration Pilot','Macro','P&A - GEA'],
  // Basic Education Portfolio
  ['Basic Education','PINTAR 1.0','Program','Whole-school development program focusing on active learning, school leadership, teacher quality, school-based management, and data-based planning.','Implementation, Evidence generated','Micro','LE-BE'],
  ['Basic Education','Teacher Numeracy','Project','Improving early grade teachers\u2019 mastery in numeracy through pedagogical content knowledge.','Pilot','Micro','LE-BE'],
  ['Basic Education','Home-based Numeracy Activities (HBNA)','Project','Improving parent involvement on early grade maths using guided at-home activities.','Pilot','Micro','LE-BE'],
  ['Basic Education','Data-driven School Leadership (DDSL)','Project','Strengthening decision-making competence of school principals in building evidence-based school FLN programs.','Pilot','Micro','LE-BE'],
  ['Basic Education','PANDAI','Project','Data-driven structured pedagogy model to improve FLN through teacher training and diagnostic assessment.','Pilot','Micro','LE-BE'],
  ['Basic Education','PPG Supervision Guide','Project','Strengthening PPG supervision system through clearer guidelines, practical instruments, supervisor capacity building, and data use across LPTKs.','Pilot','Meso','LE-BE'],
  ['Basic Education','PPG Structured Feedback Mechanism','Project','Structured feedback during PPL to ensure Guru Pamong & DPL provide timely, specific, evidence-based, actionable feedback improving student teachers\u2019 practice.','Pilot','Meso','LE-BE'],
  ['Basic Education','e-PINTAR','Project','Integrated digital learning of TF\u2019s LE (PINTAR & SIGAP) proven modules/tools.','Design','Micro','LE-BE'],
  ['Basic Education','School Monitoring System','Project','Monitoring tool to track progress of school programs to improve evidence-based planning.','Design','Meso','LE-BE'],
  ['Basic Education','Local Innovation','Project','Empowering educators as local changemakers to improve Foundational Literacy & Numeracy in their regions.','Pilot','Meso','LE-BE'],
  ['Basic Education','School Models','Project','Showcase PINTAR 1.0 good practices into MoPSE\u2019s deep learning framework as model to drive quality improvement for other schools.','Demonstration Pilot','Meso','LE-BE'],
  ['Basic Education','FLN Advocacy — Sub-National','Project','','Policy Influence','Meso','P&A & LE-RO'],
  ['Basic Education','FLN Advocacy — National','Project','','Policy Influence - System Change','Macro','P&A'],
  // Youth Leadership Development
  ['Youth Leadership Development','TELADAN','Program','Scholarship & leadership development program with university partnership, learning enrichment, soft skills, and student development journey.','Implementation, Evidence generated','Micro','LDS'],
  ['Youth Leadership Development','Soft-skills Development — Partner Universities','Project','Adoption of soft-skills development by partner universities.','Ecosystem Development','Meso','LDS'],
  ['Youth Leadership Development','Soft-skills Development — KIP-K Recipients','Project','Soft-skills development for KIP-K recipients at national scale.','Policy Influence','Macro','LDS'],
  ['Youth Leadership Development','Fellowship','Program','One-year full-time leadership development for fresh graduates/young professionals via ecosystem immersion, project-based learning, mentoring, coaching, field placement.','Implementation, Evidence n/a','Micro','LDS'],
  // Government Capacity Building
  ['GCB','GCB','Program','Multiple capacity-building tracks across public sector leadership, education, health & local governance; requires coordination across counterparts & QA across formats.','Implementation, Evidence n/a','Macro','P&A - GEA'],
  ['GCB','SDG AI (transition)','Project','Transition of SDG AI initiative.','Transition','Macro','P&A - GEA'],
  ['GCB','LAN RI: Gov Leadership Development (PKN)','Project','Government leadership development (PKN) with LAN RI.','Implementation, Evidence n/a','Macro','P&A - GEA'],
  ['GCB','MoHA Public Service Leadership Development','Project','District government leadership development with MoHA.','Pilot design','Meso-Macro','P&A - GEA']
];

const PORTFOLIOS = ['ECED','MCHN','Basic Education','Youth Leadership Development','GCB'];
const PILLAR_MAP = {'ECED':'Education','Basic Education':'Education','MCHN':'Healthcare','Youth Leadership Development':'Leadership Development','GCB':'Government Capacity Building'};

/* ---------- Store ---------- */
let DB={projects:[],assessments:{},meta:{}};
let _saveT=null,_dirty=false;
function uid(){return 'p'+Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3)}
function setSync(t,c){const d=document.getElementById('syncDot');if(d){d.textContent=t;d.className='sync '+(c||'')}}
async function load(){
  try{
    const {data:projs,error}=await supa.from('pa_projects').select('*').order('sort_order',{ascending:true});
    if(error)throw error;
    DB.projects=(projs||[]).map(r=>({id:r.id,portfolio:r.portfolio,name:r.name,category:r.category,desc:r.description||'',stage:r.stage||'',level:r.level||'',pic:r.pic||''}));
    const {data:asmts,error:e2}=await supa.from('pa_assessments').select('project_id,data');
    if(e2)throw e2;
    DB.assessments={};(asmts||[]).forEach(r=>{DB.assessments[r.project_id]=r.data||{}});
    DB.meta={};
    if(DB.projects.length===0)await seed();
    setSync('Saved','ok');
  }catch(e){console.error(e);setSync('Load failed','err');toast('Load error: '+(e.message||e));}
}
async function seed(){
  DB={projects:[],assessments:{},meta:{created:new Date().toISOString()}};
  SEED.forEach(s=>{DB.projects.push({id:uid(),portfolio:s[0],name:s[1],category:s[2],desc:s[3],stage:s[4],level:s[5],pic:s[6]})});
  _dirty=true; await syncNow();
}
function save(){ _dirty=true; setSync('Saving\u2026',''); if(_saveT)clearTimeout(_saveT); _saveT=setTimeout(syncNow,700); }
async function syncNow(){
  if(!_dirty)return; _dirty=false;
  try{
    const pRows=DB.projects.map((p,i)=>({id:p.id,portfolio:p.portfolio,name:p.name,category:p.category||'',description:p.desc||'',stage:p.stage||'',level:p.level||'',pic:p.pic||'',sort_order:i+1}));
    if(pRows.length){const {error}=await supa.from('pa_projects').upsert(pRows,{onConflict:'id'});if(error)throw error;}
    const {data:existing,error:e0}=await supa.from('pa_projects').select('id');if(e0)throw e0;
    const keep=new Set(DB.projects.map(p=>p.id));
    const del=(existing||[]).map(r=>r.id).filter(id=>!keep.has(id));
    if(del.length){const {error}=await supa.from('pa_projects').delete().in('id',del);if(error)throw error;}
    const aRows=Object.keys(DB.assessments).filter(pid=>keep.has(pid)).map(pid=>({project_id:pid,data:DB.assessments[pid]}));
    if(aRows.length){const {error}=await supa.from('pa_assessments').upsert(aRows,{onConflict:'project_id'});if(error)throw error;}
    setSync('Saved','ok');
  }catch(e){console.error(e);setSync('Save failed','err');}
}
function getProject(id){return DB.projects.find(p=>p.id===id)}
function getAssessment(id){
  if(!DB.assessments[id]) DB.assessments[id]={profile:{},factors:{},risks:{},govCat:'',maturity:{},levels:{},recommendation:'',recNote:'',pathway:{},ringkas:{},updated:null};
  const A=DB.assessments[id];if(!A.pathway)A.pathway={};if(!A.ringkas)A.ringkas={};
  return A;
}

/* ---------- Scoring Engine ---------- */
function avg(arr){const v=arr.filter(x=>typeof x==='number');return v.length?v.reduce((a,b)=>a+b,0)/v.length:null}

// Factor skala 1-5 → rata-rata dimensi
function scoreScale5(fkey,a){
  const f=FACTORS[fkey];const fa=(a.factors[fkey]||{});
  const vals=f.dims.map(d=>{const r=fa[d[0]];return r&&r.resp?Number(r.resp):null});
  const filled=vals.filter(v=>v!==null).length;
  return {score:avg(vals),filled,total:f.dims.length};
}
// Government Alignment → hitung Yes
function scoreGov(a){
  const fa=(a.factors.gov||{});
  const dims=FACTORS.gov.dims;
  let yes=0,filled=0;
  dims.forEach(d=>{const r=fa[d[0]];if(r&&r.resp){filled++;if(r.resp==='Yes')yes++}});
  return {yes,filled,total:dims.length,category:a.govCat||''};
}
// Adoption risk (Yes menurunkan risk): risk = %No
function scoreAdoption(a){
  const r=(a.risks.adoption||{});const dims=RISKS.adoption.dims;
  let yes=0,filled=0;
  dims.forEach(d=>{const x=r[d[0]];if(x&&x.resp&&x.resp!=='N/A'){filled++;if(x.resp==='Yes')yes++}});
  if(!filled)return{level:null,filled,total:dims.length,pctYes:null};
  const pctYes=yes/filled;
  const level=pctYes>=0.7?'Low':pctYes>=0.4?'Medium':'High';
  return {level,filled,total:dims.length,pctYes};
}
// LMH risk → rata-rata (L=1,M=2,H=3)
function scoreLMH(rkey,a){
  const r=(a.risks[rkey]||{});const dims=RISKS[rkey].dims;
  const map={'Low':1,'Medium':2,'High':3};
  const vals=dims.map(d=>{const x=r[d[0]];return x&&x.resp?map[x.resp]:null});
  const filled=vals.filter(v=>v!==null).length;
  const m=avg(vals);
  const level=m===null?null:m<1.67?'Low':m<2.34?'Medium':'High';
  return {level,mean:m,filled,total:dims.length};
}
// Risk Exposure agregat (dari 4 sub-risk)
function riskExposure(a){
  const parts=[scoreAdoption(a),scoreLMH('operational',a),scoreLMH('political',a),scoreLMH('reputational',a)];
  const map={'Low':1,'Medium':2,'High':3};
  const vals=parts.map(p=>p.level?map[p.level]:null).filter(v=>v!==null);
  if(!vals.length)return{level:null,mean:null,parts};
  const m=vals.reduce((a,b)=>a+b,0)/vals.length;
  const level=m<1.67?'Low':m<2.34?'Medium':'High';
  return {level,mean:m,parts};
}
// Strategic Value (rata-rata faktor bernilai strategis, skala 1-5)
function strategicValue(a){
  const keys=['smf','evi','cai','cae','sys'];
  const scores=keys.map(k=>scoreScale5(k,a).score).filter(s=>s!==null);
  return scores.length?scores.reduce((x,y)=>x+y,0)/scores.length:null;
}
// Completeness assessment (%)
function completeness(id){
  const a=getAssessment(id);let done=0,tot=0;
  Object.keys(FACTORS).forEach(k=>{const s=scoreScale5.__?null:null;});
  // faktor
  ['smf','evi','cai','cae','sys'].forEach(k=>{const s=scoreScale5(k,a);done+=s.filled;tot+=s.total});
  const g=scoreGov(a);done+=g.filled;tot+=g.total;
  // risks
  ['operational','political','reputational'].forEach(k=>{const s=scoreLMH(k,a);done+=s.filled;tot+=s.total});
  const ad=scoreAdoption(a);done+=ad.filled;tot+=ad.total;
  return tot?Math.round(done/tot*100):0;
}
function scoreColor(s){if(s===null)return'var(--slate)';if(s>=4)return'var(--green)';if(s>=3)return'var(--amber)';if(s>=2)return'#e07b1a';return'var(--red)'}
function scoreLabel(s){if(s===null)return'—';if(s>=4.5)return'Very Strong';if(s>=3.5)return'Strong';if(s>=2.5)return'Medium';if(s>=1.5)return'Emerging';return'Limited'}
function riskColor(l){return l==='Low'?'var(--green)':l==='Medium'?'var(--amber)':l==='High'?'var(--red)':'var(--slate)'}
function riskCls(l){return l==='Low'?'p-green':l==='Medium'?'p-amber':l==='High'?'p-red':'p-slate'}

/* ---------- Helpers ---------- */
function el(h){const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstElementChild}
function esc(s){return (s==null?'':String(s)).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function portfolioColor(p){return {'ECED':'p-blue','MCHN':'p-green','Basic Education':'p-orange','Youth Leadership Development':'p-amber','GCB':'p-slate'}[p]||'p-slate'}

/* ---------- Router & Nav ---------- */
let STATE={view:'dash',projectId:null,tab:'A',filter:'all'};
const NAV=[
  {grp:'Portfolio'},
  {id:'dash',ic:'\u25A6',t:'Dashboard'},
  {id:'registry',ic:'\u2637',t:'Program/Project List',badge:()=>DB.projects.length},
  {id:'analytics',ic:'\u2211',t:'Analytics & Priorities'},
  {grp:'Referensi'},
  {id:'reference',ic:'\u24D8',t:'Guide & Framework'},
  {id:'data',ic:'\u2913',t:'Data & Export'}
];
function renderNav(){
  const n=document.getElementById('nav');n.innerHTML='';
  NAV.forEach(item=>{
    if(item.grp){n.appendChild(el(`<div class="grp">${item.grp}</div>`));return}
    const active=STATE.view===item.id||(item.id==='registry'&&STATE.view==='assess');
    const badge=item.badge?`<span class="badge">${item.badge()}</span>`:'';
    const a=el(`<a class="${active?'active':''}"><span class="ic">${item.ic}</span><span>${item.t}</span>${badge}</a>`);
    a.onclick=()=>go(item.id);
    n.appendChild(a);
  });
}
function go(view,opts={}){STATE.view=view;Object.assign(STATE,opts);renderNav();render();window.scrollTo(0,0)}

const TITLES={dash:['Dashboard','TFID portfolio overview'],registry:['Program / Project List','Registry & assessment status'],assess:['Assessment','Program/project assessment'],analytics:['Analytics & Priorities','Cross-portfolio comparison'],reference:['Guide & Framework','Assessment rubric reference'],data:['Data & Export','Manage & back up data']};
function render(){
  setupDownload();
  const [t,c]=TITLES[STATE.view]||['',''];
  document.getElementById('pageTitle').textContent=STATE.view==='assess'&&STATE.projectId?(getProject(STATE.projectId)||{}).name||t:t;
  document.getElementById('pageCrumb').textContent=c;
  document.getElementById('topActions').innerHTML='';
  const v=document.getElementById('view');v.innerHTML='';
  ({dash:viewDash,registry:viewRegistry,assess:viewAssess,analytics:viewAnalytics,reference:viewReference,data:viewData}[STATE.view]||viewDash)(v);
}

/* ---------- Shared portfolio scope (Dashboard & Analytics) ---------- */
function scopedProjects(){return STATE.filter==='all'?DB.projects:DB.projects.filter(p=>p.portfolio===STATE.filter)}
function scopeFilterBar(){
  const bar=el('<div class="filter-bar"></div>');
  const pfWrap=el('<div class="filter-field"><label>Portfolio</label></div>');
  const sel=el('<select class="inp sm"></select>');
  sel.appendChild(el(`<option value="all">All portfolios (${DB.projects.length})</option>`));
  PORTFOLIOS.forEach(p=>{const n=DB.projects.filter(x=>x.portfolio===p).length;const o=el(`<option value="${esc(p)}">${esc(p)} (${n})</option>`);if(STATE.filter===p)o.selected=true;sel.appendChild(o)});
  pfWrap.appendChild(sel);
  const meta=el('<div class="filter-meta"></div>');
  const cnt=el(`<span class="filter-count">${scopedProjects().length} of ${DB.projects.length} projects in scope</span>`);
  const reset=el('<button class="btn sm">Reset</button>');
  meta.appendChild(cnt);meta.appendChild(reset);
  bar.appendChild(pfWrap);bar.appendChild(meta);
  sel.onchange=()=>{STATE.filter=sel.value;render()};
  reset.onclick=()=>{STATE.filter='all';render()};
  return bar;
}

/* ---------- View: Dashboard ---------- */
function viewDash(v){
  v.appendChild(scopeFilterBar());
  const PJ=scopedProjects();
  const total=PJ.length;
  const assessed=PJ.filter(p=>completeness(p.id)>0).length;
  const complete=PJ.filter(p=>completeness(p.id)>=95).length;
  const withRec=PJ.filter(p=>getAssessment(p.id).recommendation).length;

  // stat cards
  const stats=el('<div class="grid g4"></div>');
  stats.appendChild(statCard('Total Programs/Projects',total,`${STATE.filter==='all'?PORTFOLIOS.length+' portfolios':esc(STATE.filter)}`,'var(--blue)',100));
  stats.appendChild(statCard('Assessed',assessed,`${total-assessed} not started`,'var(--orange)',total?assessed/total*100:0));
  stats.appendChild(statCard('Assessments Complete',complete,`\u2265 95% filled`,'var(--green)',total?complete/total*100:0));
  stats.appendChild(statCard('With Recommendation',withRec,'portfolio actions','var(--amber)',total?withRec/total*100:0));
  v.appendChild(stats);

  // portfolio breakdown + recommendation distribution
  const row=el('<div class="grid g2" style="margin-top:16px"></div>');
  // portfolio card
  const pc=el('<div class="card"><div class="card-h"><h3>Distribution by Portfolio</h3></div><div class="card-b"></div></div>');
  const pcb=pc.querySelector('.card-b');
  (STATE.filter==='all'?PORTFOLIOS:[STATE.filter]).forEach(p=>{
    const items=DB.projects.filter(x=>x.portfolio===p);
    const done=items.filter(x=>completeness(x.id)>=95).length;
    const pct=items.length?done/items.length*100:0;
    pcb.appendChild(el(`<div style="margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <span class="pill ${portfolioColor(p)} dot">${esc(p)}</span>
        <span style="font-size:12px;color:var(--muted)">${PILLAR_MAP[p]}</span>
        <span style="margin-left:auto;font-size:12px;font-weight:700">${done}/${items.length} complete</span>
      </div>
      <div class="stat" style="padding:0;border:0;box-shadow:none"><div class="bar"><i style="width:${pct}%;background:var(--blue)"></i></div></div>
    </div>`));
  });
  row.appendChild(pc);
  // recommendation distribution
  const rc=el('<div class="card"><div class="card-h"><h3>Recommendation Distribution</h3></div><div class="card-b"></div></div>');
  const rcb=rc.querySelector('.card-b');
  const recCounts={};RECOMMENDATIONS.forEach(r=>recCounts[r.v]=0);
  PJ.forEach(p=>{const r=getAssessment(p.id).recommendation;if(r)recCounts[r]=(recCounts[r]||0)+1});
  const maxRec=Math.max(1,...Object.values(recCounts));
  RECOMMENDATIONS.forEach(r=>{
    const c=recCounts[r.v]||0;
    rcb.appendChild(el(`<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <span class="pill ${r.cls}" style="min-width:96px;justify-content:center">${r.v}</span>
      <div style="flex:1;height:20px;background:var(--line2);border-radius:5px;overflow:hidden"><i style="display:block;height:100%;width:${c/maxRec*100}%;background:var(--blue)"></i></div>
      <b style="min-width:22px;text-align:right">${c}</b>
    </div>`));
  });
  const unrec=total-withRec;
  rcb.appendChild(el(`<div class="info-note" style="margin-top:8px"><span class="ic">\u24D8</span><div>${unrec} projects have no recommendation yet. Recommendations are not auto-derived from ratings — leadership discussion is still required (Workbook principle).</div></div>`));
  row.appendChild(rc);
  v.appendChild(row);

  // Prioritization matrix
  const mcard=el(`<div class="card" style="margin-top:16px"><div class="card-h"><h3>Prioritization Matrix</h3><span class="sub">Strategic Value vs Risk Exposure — a discussion aid, not a final decision</span></div><div class="card-b"></div></div>`);
  mcard.querySelector('.card-b').appendChild(buildMatrix());
  v.appendChild(mcard);

  // Attention list
  const att=DB.projects.map(p=>({p,sv:strategicValue(getAssessment(p.id)),re:riskExposure(getAssessment(p.id)).level}))
    .filter(x=>x.sv!==null).sort((a,b)=>(b.sv-b.riskNum||0)-(a.sv||0));
  const hi=PJ.map(p=>{const a=getAssessment(p.id);return{p,sv:strategicValue(a),re:riskExposure(a)}}).filter(x=>x.sv!==null&&x.re.level==='High');
  if(hi.length){
    const hc=el(`<div class="card" style="margin-top:16px"><div class="card-h"><h3>\u26A0 Needs Attention: High Risk Exposure</h3><span class="sub">${hi.length} high-risk projects already assessed</span></div><div class="card-b" style="padding:0"></div></div>`);
    const wrap=el('<div class="tbl-wrap" style="border:0"></div>');
    const tb=el('<table><thead><tr><th>Program/Project</th><th>Portfolio</th><th>Strategic Value</th><th>Risk Exposure</th></tr></thead><tbody></tbody></table>');
    hi.sort((a,b)=>b.sv-a.sv).forEach(x=>{
      const tr=el(`<tr style="cursor:pointer"><td><b>${esc(x.p.name)}</b></td><td><span class="pill ${portfolioColor(x.p.portfolio)}">${esc(x.p.portfolio)}</span></td>
      <td><span class="score-chip" style="background:${scoreColor(x.sv)};color:#fff">${x.sv.toFixed(1)}</span></td>
      <td><span class="pill ${riskCls(x.re.level)} dot">${x.re.level}</span></td></tr>`);
      tr.onclick=()=>go('assess',{projectId:x.p.id,tab:'B'});
      tb.querySelector('tbody').appendChild(tr);
    });
    wrap.appendChild(tb);hc.querySelector('.card-b').appendChild(wrap);v.appendChild(hc);
  }
}
function statCard(lbl,val,meta,color,pct){
  return el(`<div class="stat"><div class="lbl">${lbl}</div><div class="val" style="color:${color}">${val}</div><div class="meta">${meta}</div><div class="bar"><i style="width:${Math.min(100,pct)}%;background:${color}"></i></div></div>`);
}
function buildMatrix(){
  const wrap=el('<div></div>');
  const m=el(`<div class="matrix">
    <div class="quad" style="left:0;top:0;color:var(--amber)">Strategic but Risky<br>(Manage Risk)</div>
    <div class="quad" style="right:0;top:0;color:var(--green)">Top Priority<br>(Protect & Scale)</div>
    <div class="quad" style="left:0;bottom:0;color:var(--slate)">Low Value & Risk<br>(Review / Pause)</div>
    <div class="quad" style="right:0;bottom:0;color:var(--blue)">Good Value, Low Risk<br>(Continue)</div>
    <div class="axis-x">Strategic Value \u2192</div>
    <div class="axis-y">\u2190 Risk Exposure (high at top)</div>
  </div>`);
  const rmap={'Low':1,'Medium':2,'High':3};
  scopedProjects().forEach(p=>{
    const a=getAssessment(p.id);const sv=strategicValue(a);const re=riskExposure(a);
    if(sv===null||re.mean===null)return;
    const x=(sv-1)/4*100; // 0..100
    const y=(re.mean-1)/2*100; // 0..100 (bottom=low)
    const dot=el(`<div class="mdot" style="left:${x}%;bottom:${y}%;background:${portfolioColorHex(p.portfolio)}" title="${esc(p.name)} · SV ${sv.toFixed(1)} · Risk ${re.level}"></div>`);
    dot.onclick=()=>go('assess',{projectId:p.id,tab:'B'});
    m.appendChild(dot);
  });
  wrap.appendChild(m);
  const leg=el('<div class="legend" style="margin:0 40px 8px 60px"></div>');
  (STATE.filter==='all'?PORTFOLIOS:[STATE.filter]).forEach(p=>leg.appendChild(el(`<span><i style="background:${portfolioColorHex(p)}"></i>${p}</span>`)));
  wrap.appendChild(leg);
  const count=scopedProjects().filter(p=>strategicValue(getAssessment(p.id))!==null&&riskExposure(getAssessment(p.id)).mean!==null).length;
  if(!count)wrap.appendChild(el('<div class="empty" style="padding:20px">No projects with Strategic Value & Risk filled yet. Complete Section B to display points.</div>'));
  return wrap;
}
function portfolioColorHex(p){return {'ECED':'#006341','MCHN':'#2E8B57','Basic Education':'#B3A369','Youth Leadership Development':'#8C7A3F','GCB':'#64748b'}[p]||'#64748b'}

/* ---------- View: Registry ---------- */
function viewRegistry(v){
  if(STATE.filter===undefined)STATE.filter='all';
  if(STATE.q===undefined)STATE.q='';
  document.getElementById('topActions').appendChild(el('<button class="btn orange" onclick="openProjectModal()">+ Add Project</button>'));

  // ---- Filter menu: Portfolio + Project ----
  const bar=el('<div class="filter-bar"></div>');
  // Portfolio dropdown
  const pfWrap=el('<div class="filter-field"><label>Portfolio</label></div>');
  const pfSel=el('<select class="inp sm"></select>');
  pfSel.appendChild(el(`<option value="all">All portfolios (${DB.projects.length})</option>`));
  PORTFOLIOS.forEach(p=>{const n=DB.projects.filter(x=>x.portfolio===p).length;const o=el(`<option value="${esc(p)}">${esc(p)} (${n})</option>`);if(STATE.filter===p)o.selected=true;pfSel.appendChild(o)});
  pfWrap.appendChild(pfSel);
  // Project search / select (type-ahead via datalist)
  const prWrap=el('<div class="filter-field" style="flex:1;min-width:220px"><label>Project</label></div>');
  const prInput=el(`<input class="inp sm" list="regProjList" placeholder="Search or select a project…" value="${esc(STATE.q)}" autocomplete="off">`);
  const dl=el('<datalist id="regProjList"></datalist>');
  prWrap.appendChild(prInput);prWrap.appendChild(dl);
  // meta: count + reset
  const meta=el('<div class="filter-meta"></div>');
  const countEl=el('<span class="filter-count"></span>');
  const resetBtn=el('<button class="btn sm">Reset</button>');
  meta.appendChild(countEl);meta.appendChild(resetBtn);
  bar.appendChild(pfWrap);bar.appendChild(prWrap);bar.appendChild(meta);
  v.appendChild(bar);

  // table shell
  const wrap=el('<div class="tbl-wrap"></div>');
  const tb=el(`<table><thead><tr>
    <th style="width:26px">#</th><th>Program / Project</th><th>Portfolio</th><th>Category</th>
    <th>Stage</th><th>Level</th><th>PIC</th><th>Progress</th><th>Recommendation</th><th></th>
  </tr></thead><tbody></tbody></table>`);
  const body=tb.querySelector('tbody');
  wrap.appendChild(tb);v.appendChild(wrap);

  function currentList(){
    let list=DB.projects;
    if(STATE.filter!=='all')list=list.filter(p=>p.portfolio===STATE.filter);
    const q=(STATE.q||'').trim().toLowerCase();
    if(q)list=list.filter(p=>(p.name||'').toLowerCase().includes(q)||(p.desc||'').toLowerCase().includes(q)||(p.pic||'').toLowerCase().includes(q));
    return list;
  }
  function fillDatalist(){
    dl.innerHTML='';
    const base=STATE.filter==='all'?DB.projects:DB.projects.filter(p=>p.portfolio===STATE.filter);
    base.forEach(p=>dl.appendChild(el(`<option value="${esc(p.name)}"></option>`)));
  }
  function renderRows(){ // partial update only — keeps focus in the search box
    body.innerHTML='';
    const list=currentList();
    countEl.textContent=`Showing ${list.length} of ${DB.projects.length} projects`;
    if(!list.length){body.appendChild(el('<tr><td colspan="10"><div class="empty"><div class="ic">\u2637</div>No projects match this filter.</div></td></tr>'));return}
    list.forEach((p,i)=>{
      const a=getAssessment(p.id);const comp=completeness(p.id);
      const rec=a.recommendation?RECOMMENDATIONS.find(r=>r.v===a.recommendation):null;
      const tr=el(`<tr>
        <td style="color:var(--muted)">${i+1}</td>
        <td><div style="font-weight:700">${esc(p.name)}</div><div style="font-size:11.5px;color:var(--muted);max-width:340px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.desc)||'<i>no description yet</i>'}</div></td>
        <td><span class="pill ${portfolioColor(p.portfolio)}">${esc(p.portfolio)}</span></td>
        <td><span class="tag">${esc(p.category)}</span></td>
        <td style="font-size:12px">${esc(p.stage)||'—'}</td>
        <td><span class="tag">${esc(p.level)||'—'}</span></td>
        <td style="font-size:12px">${esc(p.pic)||'—'}</td>
        <td><div style="display:flex;align-items:center;gap:6px"><div style="flex:1;height:6px;min-width:46px;background:var(--line2);border-radius:4px;overflow:hidden"><i style="display:block;height:100%;width:${comp}%;background:${comp>=95?'var(--green)':comp>0?'var(--orange)':'var(--line)'}"></i></div><span style="font-size:11px;font-weight:700;color:var(--muted)">${comp}%</span></div></td>
        <td>${rec?`<span class="pill ${rec.cls}">${rec.v}</span>`:'<span style="color:var(--muted);font-size:12px">—</span>'}</td>
        <td style="white-space:nowrap"><div style="display:flex;gap:5px;justify-content:flex-end">
          <button class="btn sm primary" data-act="assess">Assess \u2192</button>
          <button class="btn sm" data-act="edit" title="Edit project">Edit</button>
          <button class="btn sm danger" data-act="del" title="Delete project">Delete</button>
        </div></td>
      </tr>`);
      tr.querySelector('[data-act=assess]').onclick=(e)=>{e.stopPropagation();go('assess',{projectId:p.id,tab:'A'})};
      tr.querySelector('[data-act=edit]').onclick=(e)=>{e.stopPropagation();openProjectModal(p.id)};
      tr.querySelector('[data-act=del]').onclick=(e)=>{e.stopPropagation();deleteProject(p.id)};
      tr.style.cursor='pointer';
      tr.onclick=(e)=>{if(!e.target.closest('button'))go('assess',{projectId:p.id,tab:'A'})};
      body.appendChild(tr);
    });
  }
  pfSel.onchange=()=>{STATE.filter=pfSel.value;fillDatalist();renderRows()};
  prInput.oninput=()=>{STATE.q=prInput.value;renderRows()};
  resetBtn.onclick=()=>{STATE.filter='all';STATE.q='';pfSel.value='all';prInput.value='';fillDatalist();renderRows()};
  fillDatalist();renderRows();
}

function deleteProject(id){
  const p=getProject(id);if(!p)return;
  if(!confirm('Delete "'+p.name+'" and its assessment data? This action cannot be undone.'))return;
  DB.projects=DB.projects.filter(x=>x.id!==id);
  delete DB.assessments[id];
  save();toast('Project deleted');render();renderNav();
}

/* ---------- View: Assessment ---------- */
function viewAssess(v){
  const p=getProject(STATE.projectId);
  if(!p){v.appendChild(el('<div class="empty">Project not found.</div>'));return}
  const a=getAssessment(p.id);
  // top actions
  const ta=document.getElementById('topActions');
  ta.appendChild(el(`<button class="btn" onclick="go('registry')">\u2190 List</button>`));
  ta.appendChild(el(`<button class="btn" onclick="window.print()">\u2399 Print</button>`));

  // header summary
  const g=scoreGov(a);const re=riskExposure(a);const sv=strategicValue(a);
  const head=el(`<div class="card" style="margin-bottom:18px"><div class="card-b" style="display:flex;gap:22px;align-items:center;flex-wrap:wrap">
    <div style="flex:1;min-width:240px">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
        <span class="pill ${portfolioColor(p.portfolio)} dot">${esc(p.portfolio)}</span>
        <span class="tag">${esc(p.category)}</span>
        <span class="tag">${esc(p.level)||'—'}</span>
      </div>
      <div style="font-size:19px;font-weight:800;letter-spacing:-.3px">${esc(p.name)}</div>
      <div style="font-size:12.5px;color:var(--muted);margin-top:3px">${esc(p.desc)||'No description yet'}</div>
    </div>
    <div style="text-align:center"><div class="lbl" style="font-size:11px;color:var(--muted);text-transform:uppercase;font-weight:700">Strategic Value</div><div style="font-size:28px;font-weight:800;color:${scoreColor(sv)}">${sv!==null?sv.toFixed(1):'—'}</div><div style="font-size:11px;color:var(--muted)">${scoreLabel(sv)}</div></div>
    <div style="text-align:center"><div class="lbl" style="font-size:11px;color:var(--muted);text-transform:uppercase;font-weight:700">Risk Exposure</div><div style="font-size:20px;font-weight:800;color:${riskColor(re.level)};margin-top:6px">${re.level||'—'}</div></div>
    <div style="text-align:center"><div class="lbl" style="font-size:11px;color:var(--muted);text-transform:uppercase;font-weight:700">Completeness</div><div style="font-size:28px;font-weight:800;color:var(--blue)">${completeness(p.id)}%</div></div>
  </div></div>`);
  v.appendChild(head);

  // tabs
  const tabs=el('<div class="tabs"></div>');
  const TABS=[['A','A · Profile'],['B','B · Strategic (6-Factor)'],['C','C · Maturity'],['D','D · Level of Change'],['R','Recommendation'],['S','\u2637 Summary (1–2 pp.)']];
  TABS.forEach(([id,label])=>{
    const b=el(`<button class="${STATE.tab===id?'on':''}">${label}</button>`);
    b.onclick=()=>{STATE.tab=id;render()};tabs.appendChild(b);
  });
  v.appendChild(tabs);

  const body=el('<div id="assessBody"></div>');
  v.appendChild(body);
  ({A:secProfile,B:secStrategic,C:secMaturity,D:secLevels,R:secRecommend,S:secRingkas}[STATE.tab]||secProfile)(body,p,a);
}

function saveField(a,path,key,val){
  const seg=path.split('.');let o=a;seg.forEach(s=>{if(!o[s])o[s]={};o=o[s]});
  o[key]=val;a.updated=new Date().toISOString();save();
}

/* Section A: Profile */
function secProfile(b,p,a){
  const pr=a.profile;
  const c=el('<div class="card"><div class="card-h"><h3>Section A · Program / Project Profile</h3></div><div class="card-b"></div></div>');
  const cb=c.querySelector('.card-b');
  function tf(label,key,hint,area){
    const f=el(`<div class="field"><label>${label}</label>${hint?`<div class="hint">${hint}</div>`:''}${area?`<textarea class="inp">${esc(pr[key]||'')}</textarea>`:`<input class="inp" value="${esc(pr[key]||'')}">`}</div>`);
    const inp=f.querySelector(area?'textarea':'input');
    inp.oninput=()=>{pr[key]=inp.value;a.updated=new Date().toISOString();save()};
    return f;
  }
  cb.appendChild(el(`<div class="row2">
    <div class="field"><label>Program</label><input class="inp" id="pf_prog" value="${esc(pr.program||p.name)}"></div>
    <div class="field"><label>Project Lead / PIC</label><input class="inp" id="pf_lead" value="${esc(pr.lead||p.pic||'')}"></div>
  </div>`));
  cb.querySelector('#pf_prog').oninput=e=>{pr.program=e.target.value;save()};
  cb.querySelector('#pf_lead').oninput=e=>{pr.lead=e.target.value;save()};
  cb.appendChild(tf('Project Description','description','Objectives, scope of work, key interventions/activities, output–outcome–impact.',true));
  cb.appendChild(el(`<div class="row2">
    <div class="field"><label>Period (Years)</label><input class="inp" id="pf_years" value="${esc(pr.years||'')}" placeholder="2026 – 2029"></div>
    <div class="field"><label>Primary Government Counterpart</label><input class="inp" id="pf_gov" value="${esc(pr.govCounterpart||'')}"></div>
  </div>`));
  cb.querySelector('#pf_years').oninput=e=>{pr.years=e.target.value;save()};
  cb.querySelector('#pf_gov').oninput=e=>{pr.govCounterpart=e.target.value;save()};

  cb.appendChild(el('<div style="font-weight:700;font-size:13px;margin:6px 0 10px;color:var(--muted)">Total Investment (IDR)</div>'));
  cb.appendChild(el(`<div class="row2" id="invRow"></div>`));
  const invRow=cb.querySelector('#invRow');
  [['inv_total','Total'],['inv_2025','Up to 2025'],['inv_2026','2026'],['inv_beyond','2027 & beyond']].forEach(([k,l])=>{
    const f=el(`<div class="field"><label>${l}</label><input class="inp" value="${esc(pr[k]||'')}" placeholder="Rp"></div>`);
    f.querySelector('input').oninput=e=>{pr[k]=e.target.value;save()};invRow.appendChild(f);
  });
  cb.appendChild(tf('Primary Beneficiaries','beneficiaries','',false));
  cb.appendChild(tf('Geographic Coverage','geo','',false));
  cb.appendChild(tf('Funding Partner(s)','funding','',false));
  cb.appendChild(tf('Implementation Partner(s)','impl','',false));
  b.appendChild(c);
}

/* Section B: Strategic (6-Factor) */
function secStrategic(b,p,a){
  // sub-nav faktor
  const subs=[['smf','1 · Mission Fit'],['gov','2 · Gov Alignment'],['evi','3 · Evidence'],['ca','4 · Comparative Adv.'],['risk','5 · Risk'],['sys','6 · System Change']];
  if(!STATE.subtab)STATE.subtab='smf';
  const nav=el('<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px"></div>');
  subs.forEach(([id,l])=>{
    const on=STATE.subtab===id;
    const bt=el(`<button class="btn sm ${on?'primary':''}">${l}</button>`);
    bt.onclick=()=>{STATE.subtab=id;render()};nav.appendChild(bt);
  });
  b.appendChild(nav);
  const box=el('<div></div>');b.appendChild(box);
  if(STATE.subtab==='smf')factorScale(box,'smf',a);
  else if(STATE.subtab==='gov')factorGov(box,a);
  else if(STATE.subtab==='evi')factorScale(box,'evi',a);
  else if(STATE.subtab==='ca'){factorScale(box,'cai',a);factorScale(box,'cae',a)}
  else if(STATE.subtab==='risk')factorRisk(box,a);
  else if(STATE.subtab==='sys')factorScale(box,'sys',a);
}

function factorHead(f,scoreHtml){
  return `<div class="factor-head"><div class="fnum">${f.num}</div><div><h3>${f.name}</h3><div style="font-size:12px;color:var(--muted)">${f.q}</div></div>
  <span class="own pill p-slate" style="margin-left:auto">Owner: ${f.owner}</span>${scoreHtml||''}</div>`;
}

function factorScale(box,fkey,a){
  const f=FACTORS[fkey];
  if(!a.factors[fkey])a.factors[fkey]={};
  const fa=a.factors[fkey];
  const card=el(`<div class="card" style="margin-bottom:18px"><div class="card-b"></div></div>`);
  const cb=card.querySelector('.card-b');
  const s=scoreScale5(fkey,a);
  cb.appendChild(el(factorHead(f,`<span class="factor-score"><span class="score-chip" id="sc_${fkey}" style="background:${scoreColor(s.score)};color:#fff">${s.score!==null?s.score.toFixed(1):'—'}</span><span style="font-size:12px;color:var(--muted)" id="scl_${fkey}">${scoreLabel(s.score)}</span></span>`)));
  if(f.note)cb.appendChild(el(`<div class="info-note" style="margin-bottom:12px"><span class="ic">\u24D8</span><div>${f.note}</div></div>`));
  f.dims.forEach(([id,name,q])=>{
    if(!fa[id])fa[id]={};
    const dim=el(`<div class="dim"><div class="dim-top"><div class="dim-txt"><div class="dt">${name}</div><div class="dq">${q}</div></div><div class="opts" data-id="${id}"></div></div><div class="ev"><textarea class="inp" placeholder="Evidence / justification...">${esc(fa[id].ev||'')}</textarea></div></div>`);
    const opts=dim.querySelector('.opts');
    SCALE5.forEach(o=>{
      const on=String(fa[id].resp)===String(o.v);
      const btn=el(`<button class="opt ${o.cls} ${on?'on':''}" title="${o.t}">${o.l}</button>`);
      btn.onclick=()=>{
        fa[id].resp=(String(fa[id].resp)===String(o.v))?'':o.v;
        opts.querySelectorAll('.opt').forEach(x=>x.classList.remove('on'));
        if(fa[id].resp)btn.classList.add('on');
        a.updated=new Date().toISOString();save();
        updateScaleScore(fkey,a);
      };
      opts.appendChild(btn);
    });
    dim.querySelector('textarea').oninput=e=>{fa[id].ev=e.target.value;a.updated=new Date().toISOString();save()};
    cb.appendChild(dim);
  });
  box.appendChild(card);
}
function updateScaleScore(fkey,a){
  const s=scoreScale5(fkey,a);
  const chip=document.getElementById('sc_'+fkey);const lbl=document.getElementById('scl_'+fkey);
  if(chip){chip.textContent=s.score!==null?s.score.toFixed(1):'—';chip.style.background=scoreColor(s.score)}
  if(lbl)lbl.textContent=scoreLabel(s.score);
}

function factorGov(box,a){
  const f=FACTORS.gov;if(!a.factors.gov)a.factors.gov={};const fa=a.factors.gov;
  const card=el(`<div class="card" style="margin-bottom:18px"><div class="card-b"></div></div>`);
  const cb=card.querySelector('.card-b');
  const g=scoreGov(a);
  cb.appendChild(el(factorHead(f,`<span class="factor-score"><span class="score-chip p-green" id="gov_yes">${g.yes}/${g.total} Yes</span></span>`)));
  f.dims.forEach(([id,name,q])=>{
    if(!fa[id])fa[id]={};
    const dim=el(`<div class="dim"><div class="dim-top"><div class="dim-txt"><div class="dt">${name}</div><div class="dq">${q}</div></div><div class="opts"></div></div><div class="ev"><textarea class="inp" placeholder="Evidence...">${esc(fa[id].ev||'')}</textarea></div></div>`);
    const opts=dim.querySelector('.opts');
    YESNO.forEach(o=>{
      const on=fa[id].resp===o.v;
      const btn=el(`<button class="opt ${o.cls} ${on?'on':''}">${o.l}</button>`);
      btn.onclick=()=>{fa[id].resp=(fa[id].resp===o.v)?'':o.v;opts.querySelectorAll('.opt').forEach(x=>x.classList.remove('on'));if(fa[id].resp)btn.classList.add('on');save();const g2=scoreGov(a);const c=document.getElementById('gov_yes');if(c)c.textContent=g2.yes+'/'+g2.total+' Yes'};
      opts.appendChild(btn);
    });
    dim.querySelector('textarea').oninput=e=>{fa[id].ev=e.target.value;save()};
    cb.appendChild(dim);
  });
  // Category Government Alignment
  const catBox=el('<div style="margin-top:18px"><div style="font-weight:700;font-size:13px;margin-bottom:8px">Government Alignment Category (P&A final judgment)</div><div class="hint" style="margin-bottom:10px">How directly the program relates to government priorities (see Guide).</div></div>');
  const catRow=el('<div style="display:flex;gap:8px;flex-wrap:wrap"></div>');
  GOV_CATEGORIES.forEach(c=>{
    const on=a.govCat===c.v;
    const bt=el(`<button class="btn ${on?'primary':''}" style="flex-direction:column;align-items:flex-start;max-width:200px;text-align:left;height:auto;padding:10px 12px"><span class="pill ${c.cls}">${c.v}</span><span style="font-size:11px;color:var(--muted);font-weight:500;margin-top:6px">${c.def}</span></button>`);
    bt.onclick=()=>{a.govCat=(a.govCat===c.v)?'':c.v;save();render()};catRow.appendChild(bt);
  });
  catBox.appendChild(catRow);cb.appendChild(catBox);
  box.appendChild(card);
}

function factorRisk(box,a){
  const re=riskExposure(a);
  const head=el(`<div class="card" style="margin-bottom:16px"><div class="card-b" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
    <div><div style="font-size:15px;font-weight:750">Factor 5 · Risk Exposure</div><div style="font-size:12px;color:var(--muted)">Aggregate of the 4 sub-risks below</div></div>
    <div style="margin-left:auto;display:flex;gap:10px;align-items:center">
      <span style="font-size:12px;color:var(--muted)">Overall</span>
      <span class="pill ${riskCls(re.level)} dot" id="riskAgg" style="font-size:14px;padding:6px 14px">${re.level||'—'}</span>
    </div>
  </div></div>`);
  box.appendChild(head);
  // heatbar of 4 risks
  const parts=[['adoption','Adoption'],['operational','Operational'],['political','Political'],['reputational','Reputational']];
  const heatCard=el('<div class="card" style="margin-bottom:16px"><div class="card-b"></div></div>');
  const hb=el('<div class="heat" id="riskHeat"></div>');
  heatCard.querySelector('.card-b').appendChild(el('<div style="font-size:12px;font-weight:700;margin-bottom:8px;color:var(--muted)">Risk Summary</div>'));
  heatCard.querySelector('.card-b').appendChild(hb);
  box.appendChild(heatCard);
  renderRiskHeat(a);

  // Adoption (Yes/No)
  riskCardYesNo(box,a);
  // LMH risks
  ['operational','political','reputational'].forEach(k=>riskCardLMH(box,k,a));
}
function renderRiskHeat(a){
  const hb=document.getElementById('riskHeat');if(!hb)return;hb.innerHTML='';
  const parts=[['Adoption',scoreAdoption(a)],['Operational',scoreLMH('operational',a)],['Political',scoreLMH('political',a)],['Reputational',scoreLMH('reputational',a)]];
  parts.forEach(([n,r])=>{hb.appendChild(el(`<span style="background:${riskColor(r.level)}">${n}: ${r.level||'—'}</span>`))});
  const agg=document.getElementById('riskAgg');if(agg){const re=riskExposure(a);agg.textContent=re.level||'—';agg.className='pill '+riskCls(re.level)+' dot';agg.style.fontSize='14px';agg.style.padding='6px 14px'}
}
function riskCardYesNo(box,a){
  const rk=RISKS.adoption;if(!a.risks.adoption)a.risks.adoption={};const r=a.risks.adoption;
  const s=scoreAdoption(a);
  const card=el(`<div class="card" style="margin-bottom:16px"><div class="card-b"></div></div>`);
  const cb=card.querySelector('.card-b');
  cb.appendChild(el(`<div class="factor-head" style="margin-top:0"><div class="fnum" style="background:${riskColor(s.level)}">5a</div><div><h3>${rk.name}</h3><div style="font-size:12px;color:var(--muted)">${rk.desc}</div></div><span class="factor-score pill ${riskCls(s.level)}" id="rk_adoption" style="margin-left:auto">${s.level||'—'}</span></div>`));
  rk.dims.forEach(([id,name,q])=>{
    if(!r[id])r[id]={};
    const dim=el(`<div class="dim"><div class="dim-top"><div class="dim-txt"><div class="dt">${name}</div><div class="dq">${q}</div></div><div class="opts"></div></div><div class="ev"><textarea class="inp" placeholder="Evidence...">${esc(r[id].ev||'')}</textarea></div></div>`);
    const opts=dim.querySelector('.opts');
    YESNO.forEach(o=>{
      const on=r[id].resp===o.v;
      const bt=el(`<button class="opt ${o.cls} ${on?'on':''}">${o.l}</button>`);
      bt.onclick=()=>{r[id].resp=(r[id].resp===o.v)?'':o.v;opts.querySelectorAll('.opt').forEach(x=>x.classList.remove('on'));if(r[id].resp)bt.classList.add('on');save();const s2=scoreAdoption(a);const c=document.getElementById('rk_adoption');if(c){c.textContent=s2.level||'—';c.className='factor-score pill '+riskCls(s2.level)}renderRiskHeat(a)};
      opts.appendChild(bt);
    });
    dim.querySelector('textarea').oninput=e=>{r[id].ev=e.target.value;save()};
    cb.appendChild(dim);
  });
  box.appendChild(card);
}
function riskCardLMH(box,rkey,a){
  const rk=RISKS[rkey];if(!a.risks[rkey])a.risks[rkey]={};const r=a.risks[rkey];
  const codeMap={operational:'5b',political:'5c',reputational:'5d'};
  const s=scoreLMH(rkey,a);
  const card=el(`<div class="card" style="margin-bottom:16px"><div class="card-b"></div></div>`);
  const cb=card.querySelector('.card-b');
  cb.appendChild(el(`<div class="factor-head" style="margin-top:0"><div class="fnum" style="background:${riskColor(s.level)}">${codeMap[rkey]}</div><div><h3>${rk.name}</h3><div style="font-size:12px;color:var(--muted)">${rk.desc}</div></div><span class="factor-score pill ${riskCls(s.level)}" id="rk_${rkey}" style="margin-left:auto">${s.level||'—'}</span></div>`));
  rk.dims.forEach(([id,name,q])=>{
    if(!r[id])r[id]={};
    const dim=el(`<div class="dim"><div class="dim-top"><div class="dim-txt"><div class="dt">${name}</div><div class="dq">${q}</div></div><div class="opts"></div></div><div class="ev"><textarea class="inp" placeholder="Evidence...">${esc(r[id].ev||'')}</textarea></div></div>`);
    const opts=dim.querySelector('.opts');
    LMH.forEach(o=>{
      const on=r[id].resp===o.v;
      const bt=el(`<button class="opt ${o.cls} ${on?'on':''}">${o.l}</button>`);
      bt.onclick=()=>{r[id].resp=(r[id].resp===o.v)?'':o.v;opts.querySelectorAll('.opt').forEach(x=>x.classList.remove('on'));if(r[id].resp)bt.classList.add('on');save();const s2=scoreLMH(rkey,a);const c=document.getElementById('rk_'+rkey);if(c){c.textContent=s2.level||'—';c.className='factor-score pill '+riskCls(s2.level)}renderRiskHeat(a)};
      opts.appendChild(bt);
    });
    dim.querySelector('textarea').oninput=e=>{r[id].ev=e.target.value;save()};
    cb.appendChild(dim);
  });
  box.appendChild(card);
}

/* Section C: Maturity */
function secMaturity(b,p,a){
  if(!a.maturity)a.maturity={};const m=a.maturity;
  const card=el('<div class="card"><div class="card-h"><h3>Section C · Program Maturity (5-Stage Lifecycle)</h3></div><div class="card-b"></div></div>');
  const cb=card.querySelector('.card-b');
  cb.appendChild(el('<div style="font-weight:700;font-size:13px;margin-bottom:10px">1. Which stage best describes this project today?</div>'));
  const stages=el('<div class="stages"></div>');
  STAGES.forEach(s=>{
    const on=m.current===s.id;
    const so=el(`<div class="stage-opt ${on?'on':''}"><div class="sn">${s.n}</div><div class="st">${s.t}</div><div class="sd">${s.d}</div></div>`);
    so.onclick=()=>{m.current=(m.current===s.id)?'':s.id;save();render()};stages.appendChild(so);
  });
  cb.appendChild(stages);
  const qs=[
    ['evidence','2. What evidence supports this assessment?'],
    ['achievements','3. What are the key achievements at this stage?'],
    ['gaps','4. What is the biggest gap blocking progress to the next stage?'],
    ['enabling','5. What enabling conditions are needed to advance?'],
  ];
  qs.forEach(([k,l])=>{
    const f=el(`<div class="field" style="margin-top:16px"><label>${l}</label><textarea class="inp">${esc(m[k]||'')}</textarea></div>`);
    f.querySelector('textarea').oninput=e=>{m[k]=e.target.value;save()};cb.appendChild(f);
  });
  // target stage
  const tf=el('<div class="field" style="margin-top:16px"><label>6. Target maturity stage in the next 2–3 years</label></div>');
  const sel=el('<select class="inp"></select>');sel.appendChild(el('<option value="">— select —</option>'));
  STAGES.forEach(s=>{const o=el(`<option value="${s.id}">${s.n} · ${s.t}</option>`);if(m.target===s.id)o.selected=true;sel.appendChild(o)});
  sel.onchange=e=>{m.target=e.target.value;save()};tf.appendChild(sel);cb.appendChild(tf);
  b.appendChild(card);
}

/* Section D: Level of Change */
function secLevels(b,p,a){
  if(!a.levels)a.levels={sel:{},desc:''};if(!a.levels.sel)a.levels.sel={};
  const L=a.levels;
  const card=el('<div class="card"><div class="card-h"><h3>Section D · Level of Change (Micro–Meso–Macro)</h3></div><div class="card-b"></div></div>');
  const cb=card.querySelector('.card-b');
  cb.appendChild(el('<div style="font-weight:700;font-size:13px;margin-bottom:12px">1. Where is the Primary Level of Change / Influence? (check all relevant)</div>'));
  const grid=el('<div class="grid g3"></div>');
  const colors={Micro:'var(--blue)',Meso:'var(--orange)',Macro:'var(--green)'};
  Object.keys(LEVELS).forEach(lvl=>{
    const col=el(`<div><div style="font-weight:800;font-size:13px;color:${colors[lvl]};margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">${lvl}</div></div>`);
    LEVELS[lvl].forEach(item=>{
      const key=lvl+':'+item;const on=L.sel[key];
      const chk=el(`<label class="chk ${on?'on':''}"><input type="checkbox" ${on?'checked':''}><span>${item}</span></label>`);
      chk.querySelector('input').onchange=e=>{L.sel[key]=e.target.checked;chk.classList.toggle('on',e.target.checked);save()};
      col.appendChild(chk);
    });
    grid.appendChild(col);
  });
  cb.appendChild(grid);
  const f=el('<div class="field" style="margin-top:18px"><label>2. Describe your assessment. If there is evidence of impact at that level, include it.</label><textarea class="inp" style="min-height:110px">'+esc(L.desc||'')+'</textarea></div>');
  f.querySelector('textarea').oninput=e=>{L.desc=e.target.value;save()};cb.appendChild(f);
  b.appendChild(card);
}

/* Section R: Recommendation */
function secRecommend(b,p,a){
  const card=el('<div class="card"><div class="card-h"><h3>Portfolio Action Recommendation</h3></div><div class="card-b"></div></div>');
  const cb=card.querySelector('.card-b');
  cb.appendChild(el('<div class="info-note warn-note" style="margin-bottom:16px"><span class="ic">\u24D8</span><div>Recommendations are <b>not</b> auto-derived from ratings. Use the 6-factor profile, maturity, and level of change as inputs for leadership discussion before deciding on action.</div></div>'));
  const row=el('<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px"></div>');
  RECOMMENDATIONS.forEach(r=>{
    const on=a.recommendation===r.v;
    const bt=el(`<button class="btn ${on?'primary':''}" style="min-width:120px;justify-content:center"><span class="pill ${r.cls}">${r.v}</span></button>`);
    bt.onclick=()=>{a.recommendation=(a.recommendation===r.v)?'':r.v;save();render()};row.appendChild(bt);
  });
  cb.appendChild(row);
  const f=el('<div class="field"><label>Justification / Recommendation Notes</label><textarea class="inp" style="min-height:120px">'+esc(a.recNote||'')+'</textarea></div>');
  f.querySelector('textarea').oninput=e=>{a.recNote=e.target.value;save()};cb.appendChild(f);

  // ringkasan skor
  const sm=el('<div style="margin-top:10px"><div style="font-weight:700;font-size:13px;margin-bottom:10px">Assessment Summary</div></div>');
  const tbl=el('<div class="tbl-wrap"><table><thead><tr><th>Factor</th><th>Score / Rating</th><th>Interpretation</th></tr></thead><tbody></tbody></table></div>');
  const tb=tbl.querySelector('tbody');
  [['F1 Strategic Mission Fit',scoreScale5('smf',a).score,'scale'],['F3 Evidence of Impact',scoreScale5('evi',a).score,'scale'],['F4a Comparative Adv. (Internal)',scoreScale5('cai',a).score,'scale'],['F4b Comparative Adv. (External)',scoreScale5('cae',a).score,'scale'],['F6 System Change',scoreScale5('sys',a).score,'scale']].forEach(([n,s])=>{
    tb.appendChild(el(`<tr><td>${n}</td><td><span class="score-chip" style="background:${scoreColor(s)};color:#fff">${s!==null?s.toFixed(1):'—'}</span></td><td>${scoreLabel(s)}</td></tr>`));
  });
  const g=scoreGov(a);
  tb.appendChild(el(`<tr><td>F2 Government Alignment</td><td><b>${g.yes}/${g.total} Yes</b></td><td>${a.govCat?`<span class="pill ${(GOV_CATEGORIES.find(c=>c.v===a.govCat)||{}).cls}">${a.govCat}</span>`:'—'}</td></tr>`));
  const re=riskExposure(a);
  tb.appendChild(el(`<tr><td>F5 Risk Exposure</td><td><span class="pill ${riskCls(re.level)}">${re.level||'—'}</span></td><td>${re.parts.map((p2,i)=>['Adopt','Ops','Pol','Rep'][i]+': '+(p2.level||'—')).join(' · ')}</td></tr>`));
  tb.appendChild(el(`<tr style="background:#fafbfd"><td><b>Strategic Value (agg.)</b></td><td><span class="score-chip" style="background:${scoreColor(strategicValue(a))};color:#fff">${strategicValue(a)!==null?strategicValue(a).toFixed(1):'—'}</span></td><td><b>${scoreLabel(strategicValue(a))}</b></td></tr>`));
  sm.appendChild(tbl);cb.appendChild(sm);
  b.appendChild(card);
}

/* Section S: Ringkasan Assessment 1–2 Halaman */
const PATHWAY_ROLES=['Evidence','Demonstration','Ecosystem','Policy'];
function ssAuto(a,path,key,init){ // autosaving textarea, no re-render (jaga fokus)
  const seg=path?path.split('.'):[];let o=a;seg.forEach(s=>{if(!o[s])o[s]={};o=o[s]});
  const ta=el(`<textarea class="ss-in" rows="2">${esc(o[key]||init||'')}</textarea>`);
  ta.oninput=e=>{o[key]=e.target.value;a.updated=new Date().toISOString();save()};
  return ta;
}
function secRingkas(b,p,a){
  const R=a.ringkas;if(!R.bukti)R.bukti={};if(!R.risknote)R.risknote={};
  const sheet=el('<div class="summary-sheet"></div>');
  const upd=(fn)=>{try{fn()}catch(e){}};

  // Title
  const rec=a.recommendation?RECOMMENDATIONS.find(r=>r.v===a.recommendation):null;
  sheet.appendChild(el(`<div class="ss-title">
    <div><div style="font-size:16px;font-weight:800;letter-spacing:-.3px">Portfolio Assessment Summary</div>
    <div style="font-size:11px;color:var(--muted)">TFID Portfolio Review · Tanoto Foundation</div></div>
    <div style="text-align:right"><div style="font-weight:800;color:var(--blue);font-size:13px">${esc(p.portfolio)}</div>
    <div style="font-size:10.5px;color:var(--muted)">Completeness ${completeness(p.id)}% · ${a.updated?new Date(a.updated).toLocaleDateString('en-GB'):'not saved yet'}</div></div>
  </div>`));

  /* A. Snapshot */
  sheet.appendChild(el('<h2 class="ss-sec">A · Program / Project Snapshot</h2>'));
  const stg=a.maturity&&a.maturity.current?(STAGES.find(s=>s.id===a.maturity.current)||{}):{};
  const primLvls=Object.keys(LEVELS).filter(lv=>Object.keys((a.levels&&a.levels.sel)||{}).some(k=>k.startsWith(lv+':')&&a.levels.sel[k]));
  const prof=a.profile||{};
  sheet.appendChild(el(`<div class="kv">
    <b>Program / Project</b><div>${esc(p.name)||'—'}</div>
    <b>Portfolio / Pilar</b><div>${esc(p.portfolio)||'—'}${p.category?' · '+esc(p.category):''}</div>
    <b>Stage (5-Stage Lifecycle)</b><div>${stg.n?stg.n+' · '+esc(stg.t):(esc(p.stage)||'—')}</div>
    <b>Primary Level of Change</b><div>${primLvls.length?primLvls.join(' / '):(esc(p.level)||'—')}</div>
    <b>Geographic Coverage</b><div>${esc(prof.geo||prof.geography||'')||'—'}</div>
    <b>Government Counterpart</b><div>${esc(prof.govCounterpart||prof.counterpart||'')||'—'}</div>
    <b>Short Description (≤50 words)</b><div>${esc(p.desc)||'—'}</div>
  </div>`));

  /* B. Strategic Assessment Exec Summary */
  sheet.appendChild(el('<h2 class="ss-sec">B · Strategic Assessment — Executive Summary (6 Factors)</h2>'));
  const bt=el('<table class="ss-tbl"><thead><tr><th style="width:32%">Factor</th><th style="width:16%">Rating</th><th>Key Evidence (1–2 points)</th></tr></thead><tbody></tbody></table>');
  const bbody=bt.querySelector('tbody');
  const chip=(s)=>`<span class="ss-rate" style="background:${scoreColor(s)}">${s!==null?s.toFixed(1):'—'}</span> <span style="font-size:10.5px;color:var(--muted)">${scoreLabel(s)}</span>`;
  const g=scoreGov(a);const re=riskExposure(a);
  const f4=(()=>{const i=scoreScale5('cai',a).score,e=scoreScale5('cae',a).score;const vs=[i,e].filter(x=>x!==null);return vs.length?vs.reduce((x,y)=>x+y,0)/vs.length:null})();
  const rows=[
    ['1. Strategic Mission Fit',chip(scoreScale5('smf',a).score),'smf'],
    ['2. Government Alignment',`<b>${g.yes}/${g.total} Yes</b>${a.govCat?` · <span class="pill ${(GOV_CATEGORIES.find(c=>c.v===a.govCat)||{}).cls}">${a.govCat}</span>`:''}`,'gov'],
    ['3. Evidence of Impact',chip(scoreScale5('evi',a).score),'evi'],
    ['4. Comparative Advantage TF',chip(f4)+' <span style="font-size:10px;color:var(--muted)">(Int+Ext)</span>','ca'],
    ['5. Risk Profile (Overall)',`<span class="pill ${riskCls(re.level)}">${re.level||'—'}</span>`,'risk'],
    ['6. Contribution to System Change',chip(scoreScale5('sys',a).score),'sys'],
  ];
  rows.forEach(([n,rate,key])=>{
    const tr=el(`<tr><td style="font-weight:600">${n}</td><td>${rate}</td><td></td></tr>`);
    tr.children[2].appendChild(ssAuto(a,'ringkas.bukti',key,''));
    bbody.appendChild(tr);
  });
  sheet.appendChild(bt);

  // Catatan Risk Utama
  sheet.appendChild(el('<div style="font-weight:700;font-size:11.5px;margin:12px 0 6px;color:#5b6472">Key Risk Notes (main risks & mitigation)</div>'));
  const rt=el('<table class="ss-tbl"><tbody></tbody></table>');const rtb=rt.querySelector('tbody');
  [['Government Adoption Risk','adoption',scoreAdoption(a).level],['Operational Risk','operational',scoreLMH('operational',a).level],['Political Risk','political',scoreLMH('political',a).level],['Reputational Risk','reputational',scoreLMH('reputational',a).level]].forEach(([label,key,lvl])=>{
    const tr=el(`<tr><td style="width:24%;font-weight:600">${label}</td><td style="width:14%"><span class="pill ${riskCls(lvl)}">${lvl||'—'}</span></td><td></td></tr>`);
    tr.children[2].appendChild(ssAuto(a,'ringkas.risknote',key,''));rtb.appendChild(tr);
  });
  sheet.appendChild(rt);

  /* C. Maturity */
  sheet.appendChild(el('<h2 class="ss-sec">C · Program Maturity (5-Stage Lifecycle)</h2>'));
  const m=a.maturity||{};const tgt=m.target?(STAGES.find(s=>s.id===m.target)||{}):{};
  sheet.appendChild(el(`<div class="kv">
    <b>Current Stage</b><div>${stg.n?stg.n+' · '+esc(stg.t):'—'}</div>
    <b>Supporting Evidence</b><div>${esc(m.evidence)||'—'}</div>
    <b>Key Achievements</b><div>${esc(m.achievements)||'—'}</div>
    <b>Gap to Next Stage</b><div>${esc(m.gaps)||'—'}</div>
    <b>Enabling Conditions</b><div>${esc(m.enabling)||'—'}</div>
    <b>Target Stage (2–3 yrs)</b><div>${tgt.n?tgt.n+' · '+esc(tgt.t):'—'}</div>
  </div>`));

  /* D. Level of Change */
  sheet.appendChild(el('<h2 class="ss-sec">D · Level of Change (Micro–Meso–Macro)</h2>'));
  sheet.appendChild(el(`<div class="kv">
    <b>Primary Level</b><div>${primLvls.length?primLvls.join(' / '):'—'}</div>
    <b>Impact & Evidence</b><div>${esc((a.levels||{}).desc)||'—'}</div>
  </div>`));

  /* E. Pathway to Scale */
  sheet.appendChild(el('<h2 class="ss-sec">E · Pathway to Scale (Brief)</h2>'));
  if(!a.pathway.role)a.pathway.role=[];
  const roleWrap=el('<div><div style="font-size:11px;color:#5b6472;font-weight:600;margin-bottom:2px">Program Role</div></div>');
  const roleBar=el('<div class="ss-role"></div>');
  PATHWAY_ROLES.forEach(r=>{
    const on=a.pathway.role.includes(r);
    const btn=el(`<button class="${on?'on':''}">${r}</button>`);
    btn.onclick=()=>{const i=a.pathway.role.indexOf(r);if(i<0)a.pathway.role.push(r);else a.pathway.role.splice(i,1);btn.classList.toggle('on');a.updated=new Date().toISOString();save()};
    roleBar.appendChild(btn);
  });
  roleWrap.appendChild(roleBar);sheet.appendChild(roleWrap);
  const eKV=el('<div class="kv"></div>');
  eKV.appendChild(el('<b>Scaling Mechanism</b>'));const md=el('<div></div>');md.appendChild(ssAuto(a,'pathway','mechanism','government adoption / regulation / financing / platform…'));eKV.appendChild(md);
  eKV.appendChild(el('<b>Scaling Prerequisites</b>'));const pd=el('<div></div>');pd.appendChild(ssAuto(a,'pathway','prereq','policy / capacity / evidence / funding…'));eKV.appendChild(pd);
  sheet.appendChild(eKV);

  /* F. Recommendation */
  sheet.appendChild(el('<h2 class="ss-sec">F · Portfolio Recommendation</h2>'));
  const recBar=el('<div class="ss-recbar"></div>');
  RECOMMENDATIONS.forEach(r=>{
    const on=a.recommendation===r.v;
    const pl=el(`<span class="pill ${r.cls} ${on?'on':''}">${r.v}</span>`);
    pl.onclick=()=>{a.recommendation=(a.recommendation===r.v)?'':r.v;recBar.querySelectorAll('.pill').forEach(x=>x.classList.remove('on'));if(a.recommendation)pl.classList.add('on');a.updated=new Date().toISOString();save()};
    recBar.appendChild(pl);
  });
  sheet.appendChild(recBar);
  const fKV=el('<div class="kv"></div>');
  fKV.appendChild(el('<b>Key Reasons (2–3 points)</b>'));const ad=el('<div></div>');ad.appendChild(ssAuto(a,'ringkas','alasan',''));fKV.appendChild(ad);
  fKV.appendChild(el('<b>Implications (12–24 months)</b>'));const id=el('<div></div>');id.appendChild(ssAuto(a,'ringkas','implikasi',''));fKV.appendChild(id);
  sheet.appendChild(fKV);

  // Toolbar (tidak ikut tercetak)
  const bar=el('<div class="no-print" style="display:flex;gap:8px;margin-bottom:14px;align-items:center;flex-wrap:wrap"></div>');
  const pbtn=el('<button class="btn primary">\u2399 Print Summary (PDF)</button>');
  pbtn.onclick=()=>{document.body.classList.add('only-sheet');window.print();setTimeout(()=>document.body.classList.remove('only-sheet'),400)};
  bar.appendChild(pbtn);
  bar.appendChild(el('<span style="font-size:11.5px;color:var(--muted)">Section A–D data & Section B scores are pulled automatically. Key Evidence, Pathway to Scale, Reasons & Implications can be filled in directly here.</span>'));
  b.appendChild(bar);
  b.appendChild(sheet);
}

/* ---------- View: Analytics ---------- */
function viewAnalytics(v){
  v.appendChild(scopeFilterBar());
  // portfolio comparison table
  const c=el('<div class="card"><div class="card-h"><h3>Portfolio Comparison</h3><span class="sub">Average factor scores per portfolio (assessed projects)</span></div><div class="card-b" style="padding:0"></div></div>');
  const wrap=el('<div class="tbl-wrap" style="border:0"></div>');
  const tb=el(`<table><thead><tr><th>Portfolio</th><th># Projects</th><th>Assessed</th><th>Mission Fit</th><th>Evidence</th><th>Comp. Adv.</th><th>System Change</th><th>Strategic Value</th><th>Risk</th></tr></thead><tbody></tbody></table>`);
  const body=tb.querySelector('tbody');
  (STATE.filter==='all'?PORTFOLIOS:[STATE.filter]).forEach(pf=>{
    const items=DB.projects.filter(p=>p.portfolio===pf);
    const assessed=items.filter(p=>strategicValue(getAssessment(p.id))!==null);
    const avgF=k=>{const vals=assessed.map(p=>scoreScale5(k,getAssessment(p.id)).score).filter(s=>s!==null);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null};
    const cai=assessed.map(p=>scoreScale5('cai',getAssessment(p.id)).score).filter(s=>s!==null);
    const svAll=assessed.map(p=>strategicValue(getAssessment(p.id)));
    const svAvg=svAll.length?svAll.reduce((a,b)=>a+b,0)/svAll.length:null;
    const rmap={'Low':1,'Medium':2,'High':3};
    const rvals=assessed.map(p=>{const r=riskExposure(getAssessment(p.id));return r.level?rmap[r.level]:null}).filter(x=>x!==null);
    const rAvg=rvals.length?rvals.reduce((a,b)=>a+b,0)/rvals.length:null;
    const rLevel=rAvg===null?null:rAvg<1.67?'Low':rAvg<2.34?'Medium':'High';
    const chip=s=>`<span class="score-chip" style="background:${scoreColor(s)};color:#fff">${s!==null?s.toFixed(1):'—'}</span>`;
    body.appendChild(el(`<tr>
      <td><span class="pill ${portfolioColor(pf)}">${pf}</span></td>
      <td>${items.length}</td><td>${assessed.length}</td>
      <td>${chip(avgF('smf'))}</td><td>${chip(avgF('evi'))}</td>
      <td>${chip(cai.length?cai.reduce((a,b)=>a+b,0)/cai.length:null)}</td>
      <td>${chip(avgF('sys'))}</td>
      <td>${chip(svAvg)}</td>
      <td><span class="pill ${riskCls(rLevel)}">${rLevel||'—'}</span></td>
    </tr>`));
  });
  wrap.appendChild(tb);c.querySelector('.card-b').appendChild(wrap);v.appendChild(c);

  // stage distribution
  const sc=el('<div class="card" style="margin-top:16px"><div class="card-h"><h3>Maturity Stage Distribution (current stage)</h3></div><div class="card-b"></div></div>');
  const scb=sc.querySelector('.card-b');
  const stageCounts={};STAGES.forEach(s=>stageCounts[s.id]=0);let unset=0;
  scopedProjects().forEach(p=>{const cur=getAssessment(p.id).maturity&&getAssessment(p.id).maturity.current;if(cur&&stageCounts[cur]!==undefined)stageCounts[cur]++;else unset++});
  const maxS=Math.max(1,...Object.values(stageCounts),unset);
  const bars=el('<div class="mini-bars" style="height:120px;margin-bottom:24px"></div>');
  STAGES.forEach(s=>{const cnt=stageCounts[s.id];bars.appendChild(el(`<div class="mb" style="height:${cnt/maxS*100}%;background:var(--orange)"><span>${s.n}<br>${cnt}</span></div>`))});
  bars.appendChild(el(`<div class="mb" style="height:${unset/maxS*100}%;background:var(--slate)"><span>Unset<br>${unset}</span></div>`));
  scb.appendChild(bars);
  v.appendChild(sc);

  // full scoring table
  const fc=el('<div class="card" style="margin-top:16px"><div class="card-h"><h3>Full Score Table by Project</h3></div><div class="card-b" style="padding:0"></div></div>');
  const fw=el('<div class="tbl-wrap" style="border:0"></div>');
  const ft=el(`<table><thead><tr><th>Project</th><th>Portfolio</th><th>F1</th><th>F2</th><th>F3</th><th>F4a</th><th>F4b</th><th>F6</th><th>SV</th><th>Risk</th><th>Rec.</th></tr></thead><tbody></tbody></table>`);
  const ftb=ft.querySelector('tbody');
  scopedProjects().forEach(p=>{
    const a=getAssessment(p.id);
    const cell=s=>`<td><span class="score-chip" style="background:${scoreColor(s)};color:#fff;min-width:26px;height:22px">${s!==null?s.toFixed(1):'—'}</span></td>`;
    const g=scoreGov(a);const re=riskExposure(a);const rec=a.recommendation?RECOMMENDATIONS.find(r=>r.v===a.recommendation):null;
    const tr=el(`<tr style="cursor:pointer"><td><b>${esc(p.name)}</b></td><td><span class="pill ${portfolioColor(p.portfolio)}">${p.portfolio}</span></td>
      ${cell(scoreScale5('smf',a).score)}<td style="font-size:11px;font-weight:700">${g.filled?g.yes+'/'+g.total:'—'}</td>${cell(scoreScale5('evi',a).score)}${cell(scoreScale5('cai',a).score)}${cell(scoreScale5('cae',a).score)}${cell(scoreScale5('sys',a).score)}
      ${cell(strategicValue(a))}<td><span class="pill ${riskCls(re.level)}">${re.level||'—'}</span></td><td>${rec?`<span class="pill ${rec.cls}">${rec.v}</span>`:'—'}</td></tr>`);
    tr.onclick=()=>go('assess',{projectId:p.id,tab:'R'});
    ftb.appendChild(tr);
  });
  fw.appendChild(ft);fc.querySelector('.card-b').appendChild(fw);v.appendChild(fc);
}

/* ---------- View: Reference ---------- */
function viewReference(v){
  const frameworks=el('<div class="card"><div class="card-h"><h3>Four Portfolio Assessment Perspectives</h3></div><div class="card-b" style="padding:0"></div></div>');
  const t1=el(`<div class="tbl-wrap" style="border:0"><table class="ref-table"><thead><tr><th>Perspective</th><th>Key Question</th><th>Tool / Framework</th></tr></thead><tbody>
    <tr><td>1. Strategic Assessment</td><td>Is this the right investment?</td><td>6-Factor Assessment Framework</td></tr>
    <tr><td>2. Programme Maturity</td><td>Where is it on the innovation-to-scale journey?</td><td>5-Stage Programme Lifecycle</td></tr>
    <tr><td>3. Intervention Level</td><td>At which level is change created?</td><td>Micro–Meso–Macro Framework</td></tr>
    <tr><td>4. Pathway to Scale</td><td>How to achieve sustainable impact at scale?</td><td>Per big bet (3 flagships: RAS, PINTAR, TELADAN)</td></tr>
  </tbody></table></div>`);
  frameworks.querySelector('.card-b').appendChild(t1);
  v.appendChild(frameworks);

  // rating scale
  const sc=el('<div class="card" style="margin-top:16px"><div class="card-h"><h3>Rating Scale 1–5 (Overall Rating Guidance)</h3></div><div class="card-b" style="padding:0"></div></div>');
  sc.querySelector('.card-b').appendChild(el(`<div class="tbl-wrap" style="border:0"><table class="ref-table"><thead><tr><th>Skor</th><th>Interpretation</th></tr></thead><tbody>
    <tr><td><span class="score-chip s5" style="background:var(--green);color:#fff">5</span></td><td>Very Strong / Very High — strong evidence from multiple evaluations, replicated results, already influencing systems.</td></tr>
    <tr><td><span class="score-chip" style="background:#3a9e6a;color:#fff">4</span></td><td>Strong / High — quality evaluation shows positive outcomes & consistent implementation.</td></tr>
    <tr><td><span class="score-chip" style="background:var(--amber);color:#fff">3</span></td><td>Medium — early evidence available; further evaluation ongoing/needed.</td></tr>
    <tr><td><span class="score-chip" style="background:#e07b1a;color:#fff">2</span></td><td>Emerging / Low — only early monitoring data; formal evaluation not yet complete.</td></tr>
    <tr><td><span class="score-chip" style="background:var(--red);color:#fff">1</span></td><td>Limited / Not Yet — evaluation not started / very limited differentiation.</td></tr>
  </tbody></table></div>`));
  v.appendChild(sc);

  // gov categories
  const gc=el('<div class="card" style="margin-top:16px"><div class="card-h"><h3>Government Alignment Categories</h3></div><div class="card-b" style="padding:0"></div></div>');
  const gt=el('<div class="tbl-wrap" style="border:0"><table class="ref-table"><thead><tr><th>Category</th><th>Definition</th><th>Recommendation</th></tr></thead><tbody></tbody></table></div>');
  const recMap={'Strong':'Continue; keep checking risks','Aligned':'Continue with adjustment: sharpen the narrative','Enabling':'Continue if strategically important; disciplined investment','Weak/No':'No-go/terminate, unless approved as an exception'};
  GOV_CATEGORIES.forEach(c=>gt.querySelector('tbody').appendChild(el(`<tr><td><span class="pill ${c.cls}">${c.v}</span></td><td>${c.def}</td><td>${recMap[c.v]}</td></tr>`)));
  gc.querySelector('.card-b').appendChild(gt);v.appendChild(gc);

  // risk indicators
  const rc=el('<div class="card" style="margin-top:16px"><div class="card-h"><h3>Risk Indicators (High / Medium / Low)</h3></div><div class="card-b" style="padding:0"></div></div>');
  const rt=el(`<div class="tbl-wrap" style="border:0"><table class="ref-table"><thead><tr><th>Risk</th><th style="color:var(--red)">HIGH</th><th style="color:var(--amber)">Medium</th><th style="color:var(--green)">LOW</th></tr></thead><tbody>
    <tr><td>Government Adoption</td><td>Policy narrative only; no budget line/target/unit/owner.</td><td>Partly present, but budget/indicators/ownership need validation; declining budget.</td><td>Clear budget line, indicators/targets, unit; clear adoption pathway; adequate/stable budget.</td></tr>
    <tr><td>Operational</td><td>Major delivery constraints; complex scope; tools/SOPs/data not ready; limited TF control.</td><td>Bottlenecks exist but can be mitigated via clear scope, TA, coordination, monitoring.</td><td>Clear, tested scope; tools/SOPs/data ready; proven capacity; sufficient TF control.</td></tr>
    <tr><td>Political</td><td>Presidential/flagship agenda; exposed to controversy/transition/instability/public scrutiny.</td><td>Government priority with policy/leadership dependency; some exposure but not controversial.</td><td>Relatively stable technical issue; low sensitivity & visibility.</td></tr>
    <tr><td>Reputational</td><td>TF directly linked to major failure/controversy/beneficiary harm/governance issues.</td><td>TF association visible but managed via role boundaries, due diligence, safeguards.</td><td>TF role limited/technical/behind the scenes; low likelihood of public association.</td></tr>
  </tbody></table></div>`);
  rc.querySelector('.card-b').appendChild(rt);v.appendChild(rc);

  // principles
  const pc=el(`<div class="card" style="margin-top:16px"><div class="card-h"><h3>Guiding Principles</h3></div><div class="card-b">
    <ul style="padding-left:18px;line-height:1.9;font-size:13px">
      <li><b>Focus on Impact, not Activities</b> — long-term contribution, not just outputs.</li>
      <li><b>Not a budget-cutting exercise</b> — efficiency can be a result, not the primary goal.</li>
      <li><b>No "good/bad" projects</b> — each project plays a different role in the portfolio.</li>
      <li><b>Manage risk, don’t avoid it</b> — take the right risks with adequate mitigation.</li>
      <li><b>Think beyond implementation</b> — who will own and sustain the solution?</li>
      <li><b>Evidence-based & objective</b> — use data, evaluation, & stakeholder feedback.</li>
    </ul>
    <div class="info-note"><span class="ic">\u24D8</span><div>No decisions are made solely from ratings in this workbook. Leadership discussion & professional judgment still determine the final recommendation.</div></div>
  </div></div>`);
  v.appendChild(pc);
}

/* ---------- View: Data ---------- */
function viewData(v){
  const c=el('<div class="card"><div class="card-h"><h3>Data & Backup</h3></div><div class="card-b"></div></div>');
  const cb=c.querySelector('.card-b');
  const assessed=DB.projects.filter(p=>completeness(p.id)>0).length;
  cb.appendChild(el(`<div class="grid g3" style="margin-bottom:20px">
    <div class="stat"><div class="lbl">Projects</div><div class="val" style="color:var(--blue)">${DB.projects.length}</div></div>
    <div class="stat"><div class="lbl">Assessed</div><div class="val" style="color:var(--orange)">${assessed}</div></div>
    <div class="stat"><div class="lbl">Data size</div><div class="val" style="color:var(--slate);font-size:22px">${(JSON.stringify(DB).length/1024).toFixed(1)} KB</div></div>
  </div>`));
  cb.appendChild(el('<div style="display:flex;gap:10px;flex-wrap:wrap"></div>'));
  const btnRow=cb.querySelector('div:last-child');
  const bExp=el('<button class="btn primary">\u2913 Export JSON</button>');bExp.onclick=exportJSON;btnRow.appendChild(bExp);
  const bImp=el('<button class="btn">\u2912 Import JSON</button>');bImp.onclick=()=>document.getElementById('importFile').click();btnRow.appendChild(bImp);
  const bCsv=el('<button class="btn">\u2637 Export CSV (scores)</button>');bCsv.onclick=exportCSV;btnRow.appendChild(bCsv);
  const bDcsv=el('<button class="btn">\u2637 Export Detailed CSV</button>');bDcsv.onclick=exportDetailedCSV;btnRow.appendChild(bDcsv);
  btnRow.appendChild(el('<input type="file" id="importFile" accept=".json" style="display:none">'));
  cb.querySelector('#importFile').onchange=importJSON;
  cb.appendChild(el('<div style="height:20px"></div>'));
  cb.appendChild(el('<div class="info-note"><span class="ic">\u24D8</span><div>Data is stored in the cloud (Supabase) and shared across devices/team in real time. Export JSON periodically for an offline backup.</div></div>'));
  v.appendChild(c);

  const dz=el('<div class="card" style="margin-top:16px"><div class="card-h"><h3>Danger Zone</h3></div><div class="card-b"><div style="display:flex;gap:10px;flex-wrap:wrap"></div></div></div>');
  const dzr=dz.querySelector('.card-b div');
  const bReset=el('<button class="btn danger">Reset to Workbook seed data</button>');
  bReset.onclick=()=>{if(confirm('Reset will delete all assessments and restore the project list to the Workbook seed. Continue?')){seed();toast('Data reset');go('dash')}};
  dzr.appendChild(bReset);
  const bClear=el('<button class="btn danger">Delete all data</button>');
  bClear.onclick=()=>{if(confirm('Delete ALL data including the project list? This action cannot be undone.')){DB={projects:[],assessments:{},meta:{}};save();toast('All data deleted');go('registry')}};
  dzr.appendChild(bClear);
  v.appendChild(dz);
}
function exportJSON(){
  const blob=new Blob([JSON.stringify(DB,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='TFID_Portfolio_Assessment_'+new Date().toISOString().slice(0,10)+'.json';a.click();toast('JSON exported')
}
function importJSON(e){
  const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.projects)throw 0;DB=d;save();toast('Data imported');go('dash')}catch(x){alert('Invalid file.')}};
  r.readAsText(f);
}
function exportCSV(){
  const rows=[['Portfolio','Project','Category','Stage','F1_MissionFit','F2_Gov_Yes','F3_Evidence','F4a_CompAdvInt','F4b_CompAdvExt','F6_SystemChange','StrategicValue','AdoptionRisk','OperationalRisk','PoliticalRisk','ReputationalRisk','RiskExposure','GovCategory','Recommendation','Completeness%']];
  DB.projects.forEach(p=>{
    const a=getAssessment(p.id);const g=scoreGov(a);const re=riskExposure(a);
    const f=k=>{const s=scoreScale5(k,a).score;return s!==null?s.toFixed(2):''};
    rows.push([p.portfolio,p.name,p.category,p.stage,f('smf'),g.filled?g.yes+'/'+g.total:'',f('evi'),f('cai'),f('cae'),f('sys'),strategicValue(a)!==null?strategicValue(a).toFixed(2):'',scoreAdoption(a).level||'',scoreLMH('operational',a).level||'',scoreLMH('political',a).level||'',scoreLMH('reputational',a).level||'',re.level||'',a.govCat||'',a.recommendation||'',completeness(p.id)]);
  });
  const csv=rows.map(r=>r.map(c=>`"${String(c==null?'':c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='TFID_Scores_'+new Date().toISOString().slice(0,10)+'.csv';a.click();toast('CSV exported')
}
function exportDetailedCSV(){
  const factorOrder=['smf','gov','evi','cai','cae','sys'];
  const riskOrder=['adoption','operational','political','reputational'];
  const head=['Portfolio','Project','Category','Project Stage','Project Level','PIC','Description'];
  const prof=[['program','A.Program'],['lead','A.Project Lead'],['years','A.Period'],['govCounterpart','A.Gov Counterpart'],['geo','A.Geographic'],['beneficiaries','A.Beneficiaries'],['funding','A.Funding Partners'],['impl','A.Impl Partners'],['inv_total','A.Inv Total'],['inv_2025','A.Inv <=2025'],['inv_2026','A.Inv 2026'],['inv_beyond','A.Inv 2027+']];
  prof.forEach(([k,l])=>head.push(l));
  factorOrder.forEach(fk=>{const f=FACTORS[fk];f.dims.forEach(([id,name])=>head.push(f.code+' '+name));head.push(f.code+(fk==='gov'?' Yes count':' Score'));if(fk==='gov')head.push('F2 Category');});
  riskOrder.forEach(rk=>{const R=RISKS[rk];R.dims.forEach(([id,name])=>head.push(R.code+' '+name));head.push(R.code+' Level');});
  head.push('Risk Exposure','Strategic Value');
  head.push('C.Current Stage','C.Evidence','C.Achievements','C.Gaps','C.Enabling','C.Target Stage');
  head.push('D.Primary Levels','D.Selected Items','D.Description');
  head.push('E.Pathway Role','E.Scaling Mechanism','E.Prerequisites');
  ['smf','gov','evi','ca','risk','sys'].forEach(k=>head.push('B.Key Evidence '+k));
  riskOrder.forEach(k=>head.push('Risk Note '+k));
  head.push('Rec: Key Reasons','Rec: Implications','Recommendation','Rec Notes','Completeness %');
  const stageLabel=id=>{const s=STAGES.find(x=>x.id===id);return s?s.n+' '+s.t:''};
  const rows=[head];
  DB.projects.forEach(p=>{
    const a=getAssessment(p.id);const row=[p.portfolio,p.name,p.category,p.stage,p.level,p.pic,p.desc];
    const pr=a.profile||{};prof.forEach(([k])=>row.push(pr[k]||''));
    factorOrder.forEach(fk=>{const f=FACTORS[fk];const fa=(a.factors&&a.factors[fk])||{};f.dims.forEach(([id])=>row.push((fa[id]&&fa[id].resp)||''));
      if(fk==='gov'){const g=scoreGov(a);row.push(g.filled?g.yes+'/'+g.total:'');row.push(a.govCat||'');}
      else{const s=scoreScale5(fk,a).score;row.push(s!==null?s.toFixed(2):'');}});
    riskOrder.forEach(rk=>{const R=RISKS[rk];const ra=(a.risks&&a.risks[rk])||{};R.dims.forEach(([id])=>row.push((ra[id]&&ra[id].resp)||''));
      row.push((rk==='adoption'?scoreAdoption(a).level:scoreLMH(rk,a).level)||'');});
    row.push(riskExposure(a).level||'');row.push(strategicValue(a)!==null?strategicValue(a).toFixed(2):'');
    const m=a.maturity||{};row.push(stageLabel(m.current),m.evidence||'',m.achievements||'',m.gaps||'',m.enabling||'',stageLabel(m.target));
    const lv=a.levels||{};const primLvls=Object.keys(LEVELS).filter(L=>Object.keys(lv.sel||{}).some(k=>k.startsWith(L+':')&&lv.sel[k]));
    const selItems=Object.keys(lv.sel||{}).filter(k=>lv.sel[k]).map(k=>k.split(':')[1]);
    row.push(primLvls.join(' / '),selItems.join('; '),lv.desc||'');
    const pw=a.pathway||{};row.push((pw.role||[]).join('|'),pw.mechanism||'',pw.prereq||'');
    const rg=a.ringkas||{};const bk=rg.bukti||{};['smf','gov','evi','ca','risk','sys'].forEach(k=>row.push(bk[k]||''));
    const rn=rg.risknote||{};riskOrder.forEach(k=>row.push(rn[k]||''));
    row.push(rg.alasan||'',rg.implikasi||'',a.recommendation||'',a.recNote||'',completeness(p.id));
    rows.push(row);
  });
  const csv=rows.map(r=>r.map(c=>`"${String(c==null?'':c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='TFID_Detailed_'+new Date().toISOString().slice(0,10)+'.csv';a.click();toast('Detailed CSV exported')
}
let _dlReady=false;
function setupDownload(){
  if(_dlReady)return;
  const btn=document.getElementById('dlBtn'),menu=document.getElementById('dlMenu');
  if(!btn||!menu)return; _dlReady=true;
  menu.innerHTML='';
  [['Data backup (JSON)',exportJSON],['Scores summary (CSV)',exportCSV],['Detailed data (CSV)',exportDetailedCSV]].forEach(([label,fn])=>{
    const b=el(`<button>${label}</button>`);b.onclick=()=>{menu.classList.remove('open');fn()};menu.appendChild(b);
  });
  btn.onclick=(e)=>{e.stopPropagation();menu.classList.toggle('open')};
  document.addEventListener('click',(e)=>{if(!e.target.closest('.dl-wrap'))menu.classList.remove('open')});
}

/* ---------- Project Modal ---------- */
function openProjectModal(id){
  const editing=!!id;const p=editing?getProject(id):{portfolio:'ECED',category:'Project',level:'Micro'};
  const m=document.getElementById('modal');
  m.innerHTML=`<div class="modal-h"><h3>${editing?'Edit':'Add'} Program/Project</h3></div><div class="modal-b">
    <div class="field"><label>Program/Project Name</label><input class="inp" id="m_name" value="${esc(p.name||'')}"></div>
    <div class="row2">
      <div class="field"><label>Portfolio</label><select class="inp" id="m_pf">${PORTFOLIOS.map(x=>`<option ${p.portfolio===x?'selected':''}>${x}</option>`).join('')}</select></div>
      <div class="field"><label>Category</label><select class="inp" id="m_cat"><option ${p.category==='Program'?'selected':''}>Program</option><option ${p.category==='Project'?'selected':''}>Project</option></select></div>
    </div>
    <div class="field"><label>Description (\u2264 50 words)</label><textarea class="inp" id="m_desc">${esc(p.desc||'')}</textarea></div>
    <div class="row3">
      <div class="field"><label>Stage</label><input class="inp" id="m_stage" value="${esc(p.stage||'')}"></div>
      <div class="field"><label>Level</label><select class="inp" id="m_level"><option ${p.level==='Micro'?'selected':''}>Micro</option><option ${p.level==='Meso'?'selected':''}>Meso</option><option ${p.level==='Macro'?'selected':''}>Macro</option><option ${p.level==='Meso-Macro'?'selected':''}>Meso-Macro</option></select></div>
      <div class="field"><label>Dep-PIC</label><input class="inp" id="m_pic" value="${esc(p.pic||'')}"></div>
    </div>
  </div><div class="modal-f">${editing?'<button class="btn danger" id="m_del">Delete</button>':''}<button class="btn" id="m_cancel">Cancel</button><button class="btn orange" id="m_save">Save</button></div>`;
  document.getElementById('overlay').classList.add('show');
  document.getElementById('m_cancel').onclick=closeModal;
  document.getElementById('m_save').onclick=()=>{
    const name=document.getElementById('m_name').value.trim();if(!name){alert('Name is required');return}
    const data={portfolio:document.getElementById('m_pf').value,category:document.getElementById('m_cat').value,name,desc:document.getElementById('m_desc').value.trim(),stage:document.getElementById('m_stage').value.trim(),level:document.getElementById('m_level').value,pic:document.getElementById('m_pic').value.trim()};
    if(editing){Object.assign(getProject(id),data)}else{DB.projects.push({id:uid(),...data})}
    save();closeModal();toast(editing?'Project updated':'Project added');render();renderNav();
  };
  if(editing)document.getElementById('m_del').onclick=()=>{if(confirm('Delete the project and its assessment?')){DB.projects=DB.projects.filter(x=>x.id!==id);delete DB.assessments[id];save();closeModal();toast('Project deleted');go('registry')}};
}
function closeModal(){document.getElementById('overlay').classList.remove('show')}
document.getElementById('overlay').onclick=e=>{if(e.target.id==='overlay')closeModal()};

/* ---------- Init ---------- */


window.go = go;
window.openProjectModal = openProjectModal;
(async () => { try { await load(); renderNav(); render(); } catch (e) { console.error(e); } })();
}
