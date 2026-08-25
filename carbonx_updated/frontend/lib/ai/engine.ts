import { AI_PROJECTS, EMISSIONS_EQUIVALENTS, PLATFORM_FACTS, findProjectByName, type AIProject } from './knowledgeBase'

export interface ParsedEntities { numbers:number[]; tons?:number; budgetUSD?:number; project?:AIProject|null; unit?:'car_miles'|'car_km'|'gas_gallons'|'gas_litres'|'flights'|'trees'|'phones'|'home_energy'|'coal' }
export interface AIResponse { text:string; pills?:string[]; calculation?:{label:string; rows:{label:string;value:string;highlight?:boolean}[]} }
export type IntentType = 'greeting'|'identity'|'thanks'|'help'|'what_is_carbonx'|'how_it_works'|'what_is_carbon_credit'|'what_is_blue_carbon'|'what_is_mrv'|'what_is_ndvi'|'calc_price_for_tons'|'calc_tons_for_budget'|'calc_emissions_equivalent'|'project_lookup'|'project_list'|'compare_projects'|'cheapest_project'|'most_expensive_project'|'total_credits_available'|'platform_stats'|'how_to_buy'|'how_to_register'|'is_it_free'|'contact_support'|'token_explainer'|'retire_explainer'|'role_explainer'|'payment_explainer'|'validator_explainer'|'fallback'

function extractNumbers(t:string):number[]{return(t.match(/\d[\d,]*\.?\d*\s*[kKmM]?/g)??[]).map(m=>{const r=m.trim();const mult=/[kK]$/.test(r)?1000:/[mM]$/.test(r)?1e6:1;const v=parseFloat(r.replace(/[kKmM,]/g,''));return isNaN(v)?null:v*mult}).filter((n):n is number=>n!==null)}
function extractCurrency(t:string,nums:number[]):number|undefined{const dm=t.match(/\$\s*(\d[\d,]*\.?\d*\s*[kKmM]?)/);if(dm){const r=dm[1].trim();const m=/[kK]$/.test(r)?1000:/[mM]$/.test(r)?1e6:1;const v=parseFloat(r.replace(/[kKmM,]/g,''));if(!isNaN(v))return v*m};const wm=t.match(/(\d[\d,]*\.?\d*)\s*(dollars?|usd)/i);if(wm){const v=parseFloat(wm[1]);if(!isNaN(v))return v};const hb=/budget|spend|afford/i.test(t);if(hb&&nums.length===1)return nums[0];if(hb&&nums.length>1)return nums[nums.length-1];return undefined}
function extractTons(t:string):number|undefined{const a=t.match(/(\d[\d,]*\.?\d*\s*[kKmM]?)\s*(tons?|tonnes?|tco2e?)/i);if(a){const r=a[1].trim();const m=/[kK]$/.test(r)?1000:/[mM]$/.test(r)?1e6:1;const v=parseFloat(r.replace(/[kKmM,]/g,''));if(!isNaN(v))return v*m};return undefined}
function extractUnit(t:string):ParsedEntities['unit']{if(/\bkm\b|kilomet/i.test(t))return'car_km';if(/\bmiles?\b|driving|car/i.test(t))return'car_miles';if(/gallons?/i.test(t))return'gas_gallons';if(/litres?|liters?/i.test(t))return'gas_litres';if(/flights?|flying|plane/i.test(t))return'flights';if(/trees?|seedlings?/i.test(t))return'trees';if(/phones?|smartphones?/i.test(t))return'phones';if(/home energy|household|electricity/i.test(t))return'home_energy';if(/coal/i.test(t))return'coal';return undefined}

export function extractEntities(raw:string):ParsedEntities{const numbers=extractNumbers(raw);return{numbers,tons:extractTons(raw),budgetUSD:extractCurrency(raw,numbers),project:findProjectByName(raw),unit:extractUnit(raw)}}

const RULES:{intent:IntentType;priority:number;test:(t:string,e:ParsedEntities)=>boolean}[]=[
  {intent:'identity',               priority:100,test:t=>/\bwho are you\b|\byour name\b|\bintroduce yourself\b|\bwhat are you\b/i.test(t)},
  {intent:'greeting',               priority:95, test:t=>/^(hi+|hello+|hey+|yo|sup|namaste|good (morning|afternoon|evening))\b/i.test(t.trim())},
  {intent:'thanks',                 priority:90, test:t=>/\bthank(s| you)\b|\bthx\b|\bappreciate\b|\bawesome\b|\bgreat\b/i.test(t)},
  {intent:'what_is_carbonx',        priority:85, test:t=>/what is carbonx|tell me about carbonx|explain carbonx|about (this |the )?platform/i.test(t)},
  {intent:'how_it_works',           priority:85, test:t=>/how (does|do) (it|this|carbonx) work|how (the )?(platform|system) works/i.test(t)},
  {intent:'what_is_carbon_credit',  priority:82, test:t=>/what (is|are) (a |carbon )?credits?|carbon offset/i.test(t)},
  {intent:'what_is_blue_carbon',    priority:82, test:t=>/what is blue carbon|blue carbon|mangrove|seagrass|coastal wetland/i.test(t)},
  {intent:'what_is_mrv',            priority:80, test:t=>/\bmrv\b|what is mrv|satellite|sentinel|ndvi|verif/i.test(t)},
  {intent:'what_is_ndvi',           priority:80, test:t=>/\bndvi\b|vegetation index|biomass/i.test(t)},
  {intent:'calc_price_for_tons',    priority:78, test:(t,e)=>!!e.tons&&!e.budgetUSD&&/price|cost|worth|how much/i.test(t)},
  {intent:'calc_tons_for_budget',   priority:78, test:(t,e)=>!!e.budgetUSD&&/how many (tons?|credits?)|can i (get|buy|afford)|budget/i.test(t)},
  {intent:'calc_emissions_equivalent',priority:75,test:(t,e)=>!!e.unit&&(!!e.tons||/equal|equivalent|convert|how many/i.test(t))},
  {intent:'compare_projects',       priority:70, test:t=>/\bcompare\b|\bvs\b|\bversus\b|\bcheaper\b/i.test(t)},
  {intent:'cheapest_project',       priority:70, test:t=>/cheapest|lowest price|most affordable|best (price|deal)/i.test(t)},
  {intent:'most_expensive_project', priority:70, test:t=>/most expensive|highest price|priciest/i.test(t)},
  {intent:'total_credits_available',priority:68, test:t=>/how many credits?|total credits?|credits? available|how much (carbon|co2) (is |are )?available/i.test(t)},
  {intent:'project_lookup',         priority:65, test:(t,e)=>!!e.project&&!e.tons},
  {intent:'project_list',           priority:60, test:t=>/(list|show|what|give me) (all |the )?(projects?|listings?)|available projects?/i.test(t)},
  {intent:'platform_stats',         priority:58, test:t=>/\bstats?|how many projects?|platform (numbers|overview)/i.test(t)},
  {intent:'how_to_buy',             priority:55, test:t=>/how (do i|to|can i) (buy|purchase|get) (credits?|tokens?)/i.test(t)},
  {intent:'how_to_register',        priority:55, test:t=>/how (do i|to|can i) (register|sign up|create account|join)/i.test(t)},
  {intent:'is_it_free',             priority:55, test:t=>/is it free|cost to (use|join|register)|free (to use|platform)/i.test(t)},
  {intent:'contact_support',        priority:50, test:t=>/contact|support|help desk|email|reach you/i.test(t)},
  {intent:'token_explainer',        priority:48, test:t=>/\btoken|erc.?1155|nft|blockchain|polygon|amoy/i.test(t)},
  {intent:'retire_explainer',       priority:48, test:t=>/\bretire|burn|offset (my|a)\b|permanently/i.test(t)},
  {intent:'role_explainer',         priority:48, test:t=>/\brole|ngo\b|validator|corporate buyer|academic/i.test(t)},
  {intent:'payment_explainer',      priority:48, test:t=>/\bstripe|payment|fiat|card|pay\b|checkout|matic\b/i.test(t)},
  {intent:'validator_explainer',    priority:48, test:t=>/\bverra|ccts|gold standard|certif/i.test(t)},
  {intent:'help',                   priority:40, test:t=>/\bhelp\b|what can you do|guide me|capabilities/i.test(t)},
]

export function classifyIntent(raw:string,e:ParsedEntities):IntentType{for(const r of[...RULES].sort((a,b)=>b.priority-a.priority))if(r.test(raw,e))return r.intent;return'fallback'}

const usd=(n:number)=>`$${n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`
const num=(n:number)=>n.toLocaleString('en-US',{maximumFractionDigits:1})
const PF=PLATFORM_FACTS
const active=()=>AI_PROJECTS.filter(p=>p.status==='active')
const total=()=>active().reduce((s,p)=>s+p.availableCredits,0)
const avg=()=>active().reduce((s,p)=>s+p.pricePerTon,0)/active().length
const cheapest=()=>active().reduce((a,b)=>a.pricePerTon<b.pricePerTon?a:b)
const priciest=()=>active().reduce((a,b)=>a.pricePerTon>b.pricePerTon?a:b)

function priceForTons(e:ParsedEntities):AIResponse{
  const tons=e.tons!;const p=e.project
  if(p){const t=tons*p.pricePerTon;const note=p.status==='soldout'?'⚠️ This project is sold out.':p.status==='upcoming'?'⚠️ Not yet purchasable.':` ${p.availableCredits.toLocaleString()} tCO₂e available.`
    return{text:`**${num(tons)} tCO₂e** from **${p.name}** at ${usd(p.pricePerTon)}/ton = **${usd(t)}**.${note}`,calculation:{label:`${p.shortName} — Price`,rows:[{label:'Price/ton',value:usd(p.pricePerTon)},{label:'Quantity',value:`${num(tons)} tCO₂e`},{label:'Subtotal',value:usd(t),highlight:true},{label:'Card fee (2.9%)',value:usd(t*0.029)},{label:'Total with fee',value:usd(t*1.029)},{label:'MATIC (est.)',value:`${(tons*0.06).toFixed(4)}`}]},pills:['🛒 Open Marketplace','🌍 Convert to emissions']}}
  const a=active();const ch=cheapest();const pr=priciest()
  return{text:`For **${num(tons)} tCO₂e**, prices range from **${usd(tons*ch.pricePerTon)}** (${ch.shortName}) to **${usd(tons*pr.pricePerTon)}** (${pr.shortName}).`,calculation:{label:`${num(tons)} tCO₂e — All Projects`,rows:a.map(p=>({label:p.shortName,value:usd(tons*p.pricePerTon),highlight:p.id===ch.id}))},pills:['💰 Cheapest project','🛒 Open Marketplace']}
}

function tonsForBudget(e:ParsedEntities):AIResponse{
  const budget=e.budgetUSD!;const p=e.project
  if(p)return{text:`With **${usd(budget)}** at ${p.name}'s rate, you can buy ~**${num(budget/p.pricePerTon)} tCO₂e**.`,calculation:{label:`Budget — ${p.shortName}`,rows:[{label:'Budget',value:usd(budget)},{label:'Price/ton',value:usd(p.pricePerTon)},{label:'Credits',value:`${num(budget/p.pricePerTon)} tCO₂e`,highlight:true}]},pills:['🛒 Open Marketplace']}
  const a=active();const ch=cheapest()
  return{text:`With **${usd(budget)}**, up to **${num(budget/ch.pricePerTon)} tCO₂e** at ${ch.shortName} (cheapest).`,calculation:{label:`${usd(budget)} Budget`,rows:a.map(p=>({label:p.shortName,value:`${num(budget/p.pricePerTon)} tCO₂e`,highlight:p.id===ch.id}))},pills:['💰 Cheapest project','🛒 Open Marketplace']}
}

function emissionsEquiv(e:ParsedEntities):AIResponse{
  const tons=e.tons??e.numbers[0]??1;const unit=e.unit;const EE=EMISSIONS_EQUIVALENTS
  const convs:Record<NonNullable<ParsedEntities['unit']>,{label:string;factor:number;suffix:string}>={
    car_miles:{label:'Car miles driven',factor:EE.carMilesPerTon,suffix:'miles'},car_km:{label:'Car km driven',factor:EE.carKmPerTon,suffix:'km'},
    gas_gallons:{label:'Gallons of gasoline',factor:EE.gallonsGasPerTon,suffix:'gal'},gas_litres:{label:'Litres of gasoline',factor:EE.litresGasPerTon,suffix:'L'},
    flights:{label:'Long-haul return flights',factor:EE.flightsLongHaulPerTon,suffix:'flights'},trees:{label:'Tree seedlings (10yr)',factor:EE.treeSeedlingsGrown10yr,suffix:'trees'},
    phones:{label:'Smartphones charged',factor:EE.smartphonesCharged,suffix:'charges'},home_energy:{label:'Months of home energy',factor:EE.homeEnergyMonths,suffix:'months'},coal:{label:'Pounds of coal',factor:EE.lbsCoalBurned,suffix:'lbs'},
  }
  if(!unit)return{text:`**${num(tons)} tCO₂e** equals roughly:\n• 🚗 ${num(tons*EE.carMilesPerTon)} car miles\n• ✈️ ${num(tons*EE.flightsLongHaulPerTon)} long-haul flights\n• 🌳 ${num(tons*EE.treeSeedlingsGrown10yr)} tree seedlings\n• ⛽ ${num(tons*EE.gallonsGasPerTon)} gallons of gasoline\n• 📱 ${num(tons*EE.smartphonesCharged)} phone charges`,calculation:{label:`${num(tons)} tCO₂e Equivalents`,rows:[{label:'🚗 Car miles',value:`${num(tons*EE.carMilesPerTon)} mi`},{label:'✈️ Long-haul flights',value:`${num(tons*EE.flightsLongHaulPerTon)}`},{label:'🌳 Tree seedlings',value:`${num(tons*EE.treeSeedlingsGrown10yr)}`},{label:'⛽ Gasoline',value:`${num(tons*EE.gallonsGasPerTon)} gal`},{label:'📱 Phone charges',value:`${num(tons*EE.smartphonesCharged)}`}]},pills:['🧮 Calculate price instead']}
  const c=convs[unit]
  return{text:`**${num(tons)} tCO₂e** ≈ **${num(tons*c.factor)} ${c.suffix}** (${c.label.toLowerCase()}) — EPA factors.`,calculation:{label:'Emissions Equivalence',rows:[{label:'Carbon',value:`${num(tons)} tCO₂e`},{label:c.label,value:`${num(tons*c.factor)} ${c.suffix}`,highlight:true}]},pills:['🧮 Calculate price instead','🛒 Open Marketplace']}
}

export function generateResponse(rawText:string):AIResponse{
  const e=extractEntities(rawText);const intent=classifyIntent(rawText,e)
  switch(intent){
    case'identity':return{text:`I'm **Mira** 🌿, the AI assistant built into CarbonX. I run entirely in your browser — no external API, zero cost.\n\nI can:\n• Calculate carbon credit prices by project & quantity\n• Convert CO₂ tons to real-world equivalents\n• Compare projects, find cheapest, check availability\n• Answer any question about CarbonX, MRV, blockchain\n\nTry: **"Sundarbans 2 tons price"** or **"What is CarbonX?"**`,pills:['🧮 Calculate a price','📊 Platform stats','💡 Tour the Marketplace']}
    case'greeting':return{text:`Hey there! 👋 I'm **Mira**, CarbonX's AI assistant. Ask me anything about carbon credits, prices, or the platform.`,pills:['💬 What is CarbonX?','📊 Platform stats','🧮 Calculate a price']}
    case'thanks':return{text:`Anytime! 🌿 Let me know if you need anything else.`}
    case'help':return{text:`Here's what I can do:\n\n**💰 Pricing** — "Sundarbans 3 tons price"\n**💵 Budget** — "how many tons can I buy with $500?"\n**🌍 Emissions** — "2 tons equal how many car miles?"\n**📊 Projects** — "compare all projects" · "cheapest project"\n**📖 Knowledge** — "What is CarbonX?" · "What is MRV?" · "How do I buy?"`,pills:['🧮 Calculate a price','📊 Platform stats']}
    case'what_is_carbonx':return{text:`**CarbonX** is a blockchain-based blue carbon registry.\n\n• 🌿 Lists verified mangrove, seagrass & wetland projects\n• 🛰️ Validates them with AI satellite imagery (Sentinel-2, NDVI)\n• 🪙 Issues credits as ERC-1155 tokens on Polygon Amoy\n• 🛒 Buy via MATIC or Stripe card\n• 🔒 Retirements permanently recorded on-chain\n\nCurrently **${active().length} active projects** with **${total().toLocaleString()} tCO₂e** available.`,pills:['📊 Platform stats','🛒 Open Marketplace']}
    case'how_it_works':return{text:`CarbonX in 4 steps:\n\n**1. 🌱 Project Proposal** — NGO submits a mangrove project\n**2. 🛰️ AI MRV** — Sentinel-2 satellite computes NDVI. Score ≥ ${PF.ndviPassThreshold} = VERIFIED\n**3. 🪙 Minting** — ERC-1155 tokens minted on Polygon Amoy\n**4. 🛒 Purchase & Retire** — Buy via MATIC or Stripe. Burn to claim permanent offset`,pills:['🧮 Calculate a price','🌱 Learn About MRV','🛒 Open Marketplace']}
    case'what_is_carbon_credit':return{text:`A **carbon credit** = 1 metric tonne of CO₂ equivalent (tCO₂e) sequestered.\n\nOn CarbonX credits are ERC-1155 tokens, backed by satellite-verified NDVI data. You can trade or retire (burn) them to permanently claim an offset.\n\nCurrent prices: **${usd(cheapest().pricePerTon)}** to **${usd(priciest().pricePerTon)}** per tCO₂e.`,pills:['🧮 Calculate a price','💰 Cheapest project']}
    case'what_is_blue_carbon':return{text:`**Blue carbon** = carbon captured by coastal ecosystems:\n\n• 🌿 **Mangroves** — store 3–5× more carbon per hectare than tropical forests\n• 🌾 **Seagrasses** — store 10% of ocean carbon\n• 🌊 **Salt marshes** — highly productive coastal sinks\n\nCarbonX focuses on blue carbon because mangroves disappear at 1–2%/year.`,pills:['🛒 Open Marketplace','📊 Platform stats']}
    case'what_is_mrv':return{text:`**MRV** = Measurement, Reporting & Verification.\n\nCarbonX automates MRV:\n1. Downloads **Copernicus Sentinel-2** imagery (10m resolution)\n2. Computes **NDVI** vegetation health index\n3. Cross-references historical imagery for deforestation\n4. Generates cryptographic signature if NDVI ≥ ${PF.ndviPassThreshold}\n5. Updates project status to **VERIFIED** on-chain`,pills:['🛰️ What is NDVI?','🛒 Open Marketplace']}
    case'what_is_ndvi':return{text:`**NDVI** (Normalized Difference Vegetation Index) measures vegetation health from satellite imagery.\n\n**Score guide:**\n• **0.80–1.0** ✅ Dense healthy forest — PASSES MRV\n• **0.60–0.79** ⚠️ Moderate — pending review\n• **< 0.60** ❌ Sparse — fails verification\n\nOur active projects score **${Math.min(...active().map(p=>p.ndvi)).toFixed(2)}** to **${Math.max(...active().map(p=>p.ndvi)).toFixed(2)}**.`,pills:['🌱 Learn About MRV','📊 Platform stats']}
    case'calc_price_for_tons':return priceForTons(e)
    case'calc_tons_for_budget':return tonsForBudget(e)
    case'calc_emissions_equivalent':return emissionsEquiv(e)
    case'project_lookup':{const p=e.project!;return{text:`**${p.name}** (${p.location})\nValidator: **${p.validator}** | Price: **${usd(p.pricePerTon)}/tCO₂e** | NDVI: **${p.ndvi.toFixed(2)}** | Status: **${p.status.toUpperCase()}**${p.status==='active'?`\n${p.availableCredits.toLocaleString()} tCO₂e available`:''}`,calculation:{label:p.name,rows:[{label:'Location',value:p.location},{label:'Validator',value:p.validator},{label:'Price/ton',value:usd(p.pricePerTon),highlight:true},{label:'NDVI',value:p.ndvi.toFixed(2)},{label:'Available',value:p.status==='active'?`${p.availableCredits.toLocaleString()} tCO₂e`:p.status.toUpperCase()},{label:'Token',value:`ERC-1155 #${p.tokenId}`}]},pills:[`🛒 Buy ${p.shortName} credits`,'🧮 Calculate price']}}
    case'project_list':{const a=active();return{text:`**${a.length} active projects**, total **${total().toLocaleString()} tCO₂e** available:`,calculation:{label:'All CarbonX Projects',rows:AI_PROJECTS.map(p=>({label:p.name,value:p.status==='active'?`${usd(p.pricePerTon)}/ton`:p.status.toUpperCase()}))},pills:['🛒 Open Marketplace','💰 Cheapest project']}}
    case'compare_projects':{const a=active().sort((a,b)=>a.pricePerTon-b.pricePerTon);return{text:`Active projects by price (cheapest first):`,calculation:{label:'Project Comparison',rows:a.map((p,i)=>({label:`${p.shortName} — ${p.validator}`,value:usd(p.pricePerTon),highlight:i===0}))},pills:['💰 Cheapest project','🛒 Open Marketplace']}}
    case'cheapest_project':{const ch=cheapest();return{text:`Most affordable: **${ch.name}** at **${usd(ch.pricePerTon)}/tCO₂e** — ${ch.validator}, **${ch.availableCredits.toLocaleString()} tCO₂e** available.`,calculation:{label:'Cheapest Project',rows:[{label:'Project',value:ch.name},{label:'Price/ton',value:usd(ch.pricePerTon),highlight:true},{label:'Validator',value:ch.validator},{label:'Available',value:`${ch.availableCredits.toLocaleString()} tCO₂e`}]},pills:[`🛒 Buy ${ch.shortName} credits`]}}
    case'most_expensive_project':{const pr=priciest();return{text:`Premium project: **${pr.name}** at **${usd(pr.pricePerTon)}/tCO₂e** — NDVI **${pr.ndvi.toFixed(2)}**, ${pr.validator}.`,calculation:{label:'Premium Project',rows:[{label:'Project',value:pr.name},{label:'Price/ton',value:usd(pr.pricePerTon),highlight:true},{label:'NDVI',value:pr.ndvi.toFixed(2)},{label:'Validator',value:pr.validator}]},pills:['💰 Cheapest project']}}
    case'total_credits_available':{const a=active();const tot=total();return{text:`**${tot.toLocaleString()} tCO₂e** available across **${a.length} active projects**:`,calculation:{label:'Credits Available',rows:[...a.map(p=>({label:p.shortName,value:`${p.availableCredits.toLocaleString()} tCO₂e`})),{label:'TOTAL',value:`${tot.toLocaleString()} tCO₂e`,highlight:true}]},pills:['🛒 Open Marketplace','🧮 Calculate a price']}}
    case'platform_stats':return{text:`Live CarbonX snapshot:`,calculation:{label:'Platform Overview',rows:[{label:'Active projects',value:`${active().length}`},{label:'Total credits',value:`${total().toLocaleString()} tCO₂e`,highlight:true},{label:'Avg price',value:usd(avg())},{label:'Cheapest',value:`${cheapest().shortName} @ ${usd(cheapest().pricePerTon)}`},{label:'Blockchain',value:PF.chainName},{label:'Standard',value:PF.tokenStandard}]},pills:['🛒 Open Marketplace','🧮 Calculate a price']}
    case'how_to_buy':return{text:`**How to buy credits:**\n\n1. Create account at /auth → Corporate Buyer role\n2. Connect MetaMask (optional)\n3. Go to Marketplace → pick a project\n4. Click **"Purchase Credits"**\n5. Pay via MATIC or Stripe card\n6. Credits arrive as ERC-1155 tokens\n7. Retire on Ledger page when ready`,pills:['🛒 Open Marketplace','🔒 View Ledger']}
    case'how_to_register':return{text:`**Register on CarbonX:**\n\n1. Go to /auth → "Create Account" tab\n2. Enter name, email, password (8+ chars)\n3. Select your role (NGO, Validator, Buyer, or Auditor)\n4. Optionally add wallet address\n5. Click Create Account — done!\n\nFree to register. No subscription needed.`,pills:['💡 Tour the Marketplace']}
    case'is_it_free':return{text:`**Account creation is completely free ✅**\n\nCosts only when:\n• 🛒 Buying credits — ${usd(cheapest().pricePerTon)} to ${usd(priciest().pricePerTon)}/tCO₂e\n• 💳 Card payment — 2.9% Stripe fee\n• ⛽ Web3 payment — small gas fee (~0.001–0.003 MATIC)\n\nBrowsing, MRV, Ledger, Mira AI — all free.`,pills:['🧮 Calculate a price','🛒 Open Marketplace']}
    case'contact_support':return{text:`For help:\n• 💬 **Ask me (Mira)** — I answer most questions instantly\n• 📧 **Email** — support@carbonx.app\n• 📞 **Phone** — +91 80 4567 8900 (Mon–Fri, 9am–6pm IST)\n• 📖 **Docs** — see COMMANDS_GUIDE.md in the project\n\nI am available 24/7 for pricing, lookups, and platform questions!`,pills:['❓ What can you do?']}
    case'token_explainer':return{text:`CarbonX uses **${PF.tokenStandard}** on **${PF.chainName}** (Chain ID: ${PF.chainId}).\n\nEach project gets a unique Token ID. Buying mints quantities to your wallet. Retiring calls \`retireCredits()\` — burns to address(0) permanently, creating an immutable on-chain offset record.`,pills:['🔒 View Ledger Transparency','🧮 Calculate price']}
    case'retire_explainer':return{text:`**Retiring credits permanently claims your carbon offset:**\n\n1. Go to the Ledger page\n2. Enter Token ID, amount, and note\n3. Click "Retire & Burn Credits"\n4. Tokens burn to \`0x0000…\` — **irreversible**\n5. Public record on ${PF.explorerUrl}\n\nThis makes your offset tamper-proof forever.`,pills:['🔒 View Ledger Transparency']}
    case'role_explainer':return{text:`CarbonX has 4 roles:\n\n${PF.roles.map(r=>`• **${r.label}** — ${r.power}`).join('\n')}`,pills:['💡 Tour the Marketplace']}
    case'payment_explainer':return{text:`Two payment methods:\n\n• **Web3 / MATIC** — MetaMask on Polygon Amoy with live gas estimates\n• **Card / USD** — Stripe (test card: 4242 4242 4242 4242)\n\n${PF.platformFeePercent}% fee on card only. On success, backend webhook auto-calls \`mintCarbonCredits()\`.`,pills:['🛒 Open Marketplace']}
    case'validator_explainer':return{text:`Three certification badges:\n\n• **Verra (VCS)** — world's most-used voluntary carbon standard\n• **CCTS** — Climate, Community & Biodiversity Standards\n• **Gold Standard** — founded by WWF, focused on SDGs`,pills:['🌱 Learn About MRV']}
    default:return{text:`I'm not sure about that. Try:\n• "What is CarbonX?" — platform overview\n• "Sundarbans 2 tons price" — price calculation\n• "How many credits are available?" — live stats\n• "How do I buy credits?" — purchase guide`,pills:['❓ What can you do?','📊 Platform stats','🧮 Calculate a price']}
  }
}
