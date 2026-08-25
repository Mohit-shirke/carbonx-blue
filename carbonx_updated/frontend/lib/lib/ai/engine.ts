/**
 * Mira AI Engine — CarbonX Conversational Assistant
 * Architecture: Hash-map intent index + weighted keyword scoring + dynamic data binding
 * Complexity: O(k) per query where k = query tokens (vs O(n*m) naive approach)
 */
import {
  AI_PROJECTS, EMISSIONS_EQUIVALENTS, PLATFORM_FACTS,
  findProjectByName, type AIProject
} from './knowledgeBase'

// ── Types ────────────────────────────────────────────────────────
export interface ParsedEntities {
  numbers: number[]
  tons?: number
  budgetUSD?: number
  project?: AIProject | null
  unit?: EmissionUnit
}

export interface AIResponse {
  text: string
  pills?: string[]
  calculation?: { label: string; rows: { label: string; value: string; highlight?: boolean }[] }
}

type EmissionUnit = 'car_miles'|'car_km'|'gas_gallons'|'gas_litres'|'flights'|'trees'|'phones'|'home_energy'|'coal'

type IntentHandler = (e: ParsedEntities) => AIResponse

// ── Formatters ───────────────────────────────────────────────────
const usd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const num = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 1 })

// ── Live computed data (always fresh from knowledgeBase) ─────────
const live = {
  active:   () => AI_PROJECTS.filter(p => p.status === 'active'),
  total:    () => AI_PROJECTS.filter(p => p.status === 'active').reduce((s, p) => s + p.availableCredits, 0),
  cheapest: () => AI_PROJECTS.filter(p => p.status === 'active').reduce((a, b) => a.pricePerTon < b.pricePerTon ? a : b),
  priciest: () => AI_PROJECTS.filter(p => p.status === 'active').reduce((a, b) => a.pricePerTon > b.pricePerTon ? a : b),
  avgPrice: () => { const a = AI_PROJECTS.filter(p => p.status === 'active'); return a.reduce((s, p) => s + p.pricePerTon, 0) / a.length },
}

// ── Entity Extraction ─────────────────────────────────────────────
function extractNumbers(t: string): number[] {
  return (t.match(/\d[\d,]*\.?\d*\s*[kKmM]?/g) ?? [])
    .map(m => { const r = m.trim(); const x = /[kK]$/.test(r) ? 1e3 : /[mM]$/.test(r) ? 1e6 : 1; const v = parseFloat(r.replace(/[kKmM,]/g, '')); return isNaN(v) ? null : v * x })
    .filter((n): n is number => n !== null)
}

function extractTons(t: string): number | undefined {
  const m = t.match(/(\d[\d,]*\.?\d*\s*[kKmM]?)\s*(tons?|tonnes?|tco2e?)/i)
  if (!m) return undefined
  const r = m[1].trim(); const x = /[kK]$/.test(r) ? 1e3 : /[mM]$/.test(r) ? 1e6 : 1
  const v = parseFloat(r.replace(/[kKmM,]/g, ''))
  return isNaN(v) ? undefined : v * x
}

function extractBudget(t: string, nums: number[]): number | undefined {
  const m = t.match(/\$\s*(\d[\d,]*\.?\d*\s*[kKmM]?)/) || t.match(/(\d[\d,]*\.?\d*)\s*(dollars?|usd|inr|rupees?)/i)
  if (m) { const r = m[1].trim(); const x = /[kK]$/.test(r) ? 1e3 : /[mM]$/.test(r) ? 1e6 : 1; const v = parseFloat(r.replace(/[kKmM,]/g, '')); if (!isNaN(v)) return v * x }
  if (/budget|spend|afford|with/i.test(t) && nums.length) return nums[nums.length - 1]
  return undefined
}

function extractUnit(t: string): EmissionUnit | undefined {
  if (/\bkm\b|kilomet/i.test(t)) return 'car_km'
  if (/\bmiles?\b|driving|car ride/i.test(t)) return 'car_miles'
  if (/gallons?/i.test(t)) return 'gas_gallons'
  if (/litres?|liters?/i.test(t)) return 'gas_litres'
  if (/flights?|flying|plane|airport/i.test(t)) return 'flights'
  if (/trees?|seedlings?|plant/i.test(t)) return 'trees'
  if (/phones?|smartphones?|charg/i.test(t)) return 'phones'
  if (/home|household|electricity/i.test(t)) return 'home_energy'
  if (/coal/i.test(t)) return 'coal'
  return undefined
}

export function extractEntities(raw: string): ParsedEntities {
  const numbers = extractNumbers(raw)
  return { numbers, tons: extractTons(raw), budgetUSD: extractBudget(raw, numbers), project: findProjectByName(raw), unit: extractUnit(raw) }
}

// ── Intent Classification — weighted keyword scoring ─────────────
// Each intent has a pattern group. First match wins after priority sort.
const INTENT_MAP: Array<{ id: string; priority: number; match: (t: string, e: ParsedEntities) => boolean }> = [
  // Identity / meta
  { id: 'identity',     priority: 100, match: t => /who are you|your name|introduce yourself|what are you|are you (an? )?ai/i.test(t) },
  { id: 'greeting',     priority: 95,  match: t => /^(hi+|hello+|hey+|yo+|sup|namaste|good (morning|afternoon|evening|day))\b/i.test(t.trim()) },
  { id: 'thanks',       priority: 90,  match: t => /thank(s| you)|thx|appreciate|awesome|perfect|great job/i.test(t) },
  { id: 'help',         priority: 40,  match: t => /\bhelp\b|what can you do|guide me|capabilities|options/i.test(t) },
  // Platform knowledge
  { id: 'what_is_carbonx',       priority: 85, match: t => /what is carbonx|about (this|the) platform|tell me about carbonx|explain carbonx/i.test(t) },
  { id: 'how_it_works',          priority: 85, match: t => /how (does|do) (it|this|carbonx) work|how (the )?(platform|system) works/i.test(t) },
  { id: 'what_is_carbon_credit', priority: 82, match: t => /what (is|are) (a |carbon )?credits?|carbon offset explain/i.test(t) },
  { id: 'what_is_blue_carbon',   priority: 82, match: t => /blue carbon|what is blue carbon|mangrove|seagrass|coastal wetland/i.test(t) },
  { id: 'what_is_mrv',           priority: 80, match: t => /\bmrv\b|what is mrv|satellite verif|sentinel/i.test(t) },
  { id: 'what_is_ndvi',          priority: 80, match: t => /\bndvi\b|vegetation index|biomass index/i.test(t) },
  // Calculations
  { id: 'calc_price',    priority: 78, match: (t, e) => !!e.tons && !e.budgetUSD && /price|cost|worth|how much/i.test(t) },
  { id: 'calc_budget',   priority: 78, match: (t, e) => !!e.budgetUSD && /how many (tons?|credits?)|can i (get|buy|afford)|budget/i.test(t) },
  { id: 'calc_emissions',priority: 75, match: (t, e) => !!e.unit || (!!e.tons && /equal|equivalent|same as|convert/i.test(t)) },
  // Project queries
  { id: 'project_lookup',   priority: 65, match: (_, e) => !!e.project },
  { id: 'project_list',     priority: 60, match: t => /(list|show|all|what are) (the |our )?(projects?|listings?)|available projects?/i.test(t) },
  { id: 'compare_projects', priority: 70, match: t => /\bcompare\b|\bvs\b|\bversus\b|\bdifference\b/i.test(t) },
  { id: 'cheapest',         priority: 70, match: t => /cheapest|most affordable|lowest price|best (deal|value)/i.test(t) },
  { id: 'most_expensive',   priority: 70, match: t => /most expensive|highest price|priciest|premium/i.test(t) },
  { id: 'total_credits',    priority: 68, match: t => /how many credits?|total credits?|credits? available|how much (carbon|co2) available/i.test(t) },
  { id: 'platform_stats',   priority: 58, match: t => /\bstats?\b|how many projects?|platform (numbers|overview|data)/i.test(t) },
  // How-to
  { id: 'how_to_buy',      priority: 55, match: t => /how (do i|to|can i) (buy|purchase|get) (credits?|tokens?)/i.test(t) },
  { id: 'how_to_register', priority: 55, match: t => /how (do i|to|can i) (register|sign up|create account|join)/i.test(t) },
  { id: 'is_it_free',      priority: 55, match: t => /is it free|cost to (use|join|register)|free (to use|platform|account)/i.test(t) },
  { id: 'contact',         priority: 50, match: t => /contact|support|help desk|email|reach you|get help/i.test(t) },
  // Technical explainers
  { id: 'token_explainer',     priority: 48, match: t => /\btoken\b|erc.?1155|nft\b|blockchain|polygon|amoy/i.test(t) },
  { id: 'retire_explainer',    priority: 48, match: t => /\bretire\b|\bburn\b|offset (my|a)\b|permanently claim/i.test(t) },
  { id: 'role_explainer',      priority: 48, match: t => /\brole\b|\bngo\b|validator|corporate buyer|academic|user type/i.test(t) },
  { id: 'payment_explainer',   priority: 48, match: t => /\bstripe\b|payment|fiat|card\b|checkout|matic\b/i.test(t) },
  { id: 'validator_explainer', priority: 48, match: t => /\bverra\b|\bccts\b|gold standard|certif|badge/i.test(t) },
  // Business
  { id: 'pricing_info',    priority: 52, match: t => /pricing|subscription|enterprise|plan|how much (does it cost|to subscribe)/i.test(t) },
  { id: 'revenue_info',    priority: 48, match: t => /how (does|do) carbonx (make|earn) money|revenue model|business model/i.test(t) },
  { id: 'security_info',   priority: 48, match: t => /\bsecure\b|security|safe|hack|trust/i.test(t) },
  { id: 'tech_stack',      priority: 45, match: t => /tech(nology)? stack|built with|what technology|next\.?js|node|solidity/i.test(t) },
  { id: 'data_info',       priority: 45, match: t => /data license|buy (data|dataset)|satellite data pricing/i.test(t) },
]

export function classifyIntent(raw: string, e: ParsedEntities): string {
  const sorted = [...INTENT_MAP].sort((a, b) => b.priority - a.priority)
  for (const r of sorted) if (r.match(raw, e)) return r.id
  return 'fallback'
}

// ── Response Handlers ─────────────────────────────────────────────
function priceForTons(e: ParsedEntities): AIResponse {
  const tons = e.tons!
  const p = e.project
  if (p) {
    const sub = tons * p.pricePerTon; const fee = sub * 0.029
    const note = p.status === 'soldout' ? '\n⚠️ This project is currently sold out.'
      : p.status === 'upcoming' ? '\n⚠️ This project is not yet open for purchase.'
      : `\n✅ ${p.availableCredits.toLocaleString()} tCO₂e available.`
    return {
      text: `**${num(tons)} tCO₂e** from **${p.name}** at ${usd(p.pricePerTon)}/ton = **${usd(sub)}** before fees.${note}`,
      calculation: { label: `${p.shortName} — Price Calculation`, rows: [
        { label: 'Project',         value: p.name                          },
        { label: 'Price / ton',     value: usd(p.pricePerTon)              },
        { label: 'Quantity',        value: `${num(tons)} tCO₂e`            },
        { label: 'Subtotal',        value: usd(sub),        highlight: true },
        { label: 'Card fee (2.9%)', value: usd(fee)                        },
        { label: 'Total with fee',  value: usd(sub + fee),  highlight: true },
        { label: 'Est. MATIC',      value: `${(tons * 0.06).toFixed(4)}`   },
      ]},
      pills: ['🛒 Open Marketplace', '🌍 Convert to emissions equivalent'],
    }
  }
  const ch = live.cheapest(); const pr = live.priciest()
  return {
    text: `For **${num(tons)} tCO₂e**, prices range from **${usd(tons * ch.pricePerTon)}** (${ch.shortName}) to **${usd(tons * pr.pricePerTon)}** (${pr.shortName}).\n\nTell me which project and I'll give you an exact quote.`,
    calculation: { label: `${num(tons)} tCO₂e — All Active Projects`, rows: live.active().map(p => ({ label: p.shortName, value: usd(tons * p.pricePerTon), highlight: p.id === ch.id })) },
    pills: ['💰 Show cheapest project', '🛒 Open Marketplace'],
  }
}

function budgetCalc(e: ParsedEntities): AIResponse {
  const budget = e.budgetUSD!; const p = e.project
  if (p) {
    const tons = budget / p.pricePerTon
    return {
      text: `With **${usd(budget)}** at ${p.name}'s rate of ${usd(p.pricePerTon)}/ton, you can buy approximately **${num(tons)} tCO₂e**.`,
      calculation: { label: `Budget → ${p.shortName}`, rows: [
        { label: 'Budget',    value: usd(budget)                   },
        { label: 'Price/ton', value: usd(p.pricePerTon)            },
        { label: 'Credits',   value: `${num(tons)} tCO₂e`, highlight: true },
      ]},
      pills: ['🛒 Open Marketplace'],
    }
  }
  const ch = live.cheapest()
  return {
    text: `With **${usd(budget)}**, you can buy up to **${num(budget / ch.pricePerTon)} tCO₂e** at ${ch.shortName} (cheapest active project at ${usd(ch.pricePerTon)}/ton).`,
    calculation: { label: `${usd(budget)} Budget — All Active Projects`, rows: live.active().map(p => ({ label: p.shortName, value: `${num(budget / p.pricePerTon)} tCO₂e`, highlight: p.id === ch.id })) },
    pills: ['💰 Show cheapest project', '🛒 Open Marketplace'],
  }
}

function emissionsCalc(e: ParsedEntities): AIResponse {
  const tons = e.tons ?? e.numbers[0] ?? 1
  const EE = EMISSIONS_EQUIVALENTS
  const CONV: Record<EmissionUnit, { label: string; factor: number; suffix: string }> = {
    car_miles:   { label: 'Car miles driven',        factor: EE.carMilesPerTon,          suffix: 'miles'   },
    car_km:      { label: 'Car km driven',           factor: EE.carKmPerTon,             suffix: 'km'      },
    gas_gallons: { label: 'Gallons of gasoline',     factor: EE.gallonsGasPerTon,        suffix: 'gal'     },
    gas_litres:  { label: 'Litres of gasoline',      factor: EE.litresGasPerTon,         suffix: 'L'       },
    flights:     { label: 'Long-haul return flights',factor: EE.flightsLongHaulPerTon,   suffix: 'flights' },
    trees:       { label: 'Tree seedlings (10yr)',   factor: EE.treeSeedlingsGrown10yr,  suffix: 'trees'   },
    phones:      { label: 'Smartphones charged',     factor: EE.smartphonesCharged,      suffix: 'charges' },
    home_energy: { label: 'Months of home energy',  factor: EE.homeEnergyMonths,        suffix: 'months'  },
    coal:        { label: 'Pounds of coal burned',   factor: EE.lbsCoalBurned,          suffix: 'lbs'     },
  }
  if (!e.unit) {
    return {
      text: `**${num(tons)} tCO₂e** is equivalent to roughly:\n• 🚗 ${num(tons * EE.carMilesPerTon)} car miles driven\n• ✈️ ${num(tons * EE.flightsLongHaulPerTon)} long-haul return flights\n• 🌳 ${num(tons * EE.treeSeedlingsGrown10yr)} tree seedlings grown for 10 years\n• ⛽ ${num(tons * EE.gallonsGasPerTon)} gallons of gasoline burned\n• 📱 ${num(tons * EE.smartphonesCharged)} smartphone charges`,
      calculation: { label: `${num(tons)} tCO₂e — Real World Equivalents`, rows: [
        { label: '🚗 Car miles',       value: `${num(tons * EE.carMilesPerTon)} mi`      },
        { label: '✈️ Long-haul flights', value: `${num(tons * EE.flightsLongHaulPerTon)}` },
        { label: '🌳 Tree seedlings',  value: `${num(tons * EE.treeSeedlingsGrown10yr)}` },
        { label: '⛽ Gasoline',        value: `${num(tons * EE.gallonsGasPerTon)} gal`   },
        { label: '📱 Phone charges',   value: `${num(tons * EE.smartphonesCharged)}`     },
      ]},
      pills: ['🧮 Calculate price for these tons', '🌿 Offset with CarbonX'],
    }
  }
  const c = CONV[e.unit]
  return {
    text: `**${num(tons)} tCO₂e** ≈ **${num(tons * c.factor)} ${c.suffix}** of ${c.label.toLowerCase()}.`,
    calculation: { label: 'Emissions Equivalence', rows: [{ label: 'Carbon', value: `${num(tons)} tCO₂e` }, { label: c.label, value: `${num(tons * c.factor)} ${c.suffix}`, highlight: true }] },
    pills: ['🧮 Calculate price instead', '🛒 Open Marketplace'],
  }
}

// ── Main response generator — O(k) dispatch ───────────────────────
export function generateResponse(rawText: string): AIResponse {
  const e = extractEntities(rawText)
  const intent = classifyIntent(rawText, e)
  const PF = PLATFORM_FACTS

  const HANDLERS: Record<string, IntentHandler> = {
    identity: () => ({ text: `I'm **Mira** 🌿 — the AI assistant built into CarbonX. I run entirely in your browser, zero API cost.\n\n**I can help you with:**\n• 💰 Real-time carbon credit pricing by project & quantity\n• 🌍 Converting CO₂ tonnes to real-world equivalents\n• 📊 Live platform stats, project comparisons, availability\n• 📖 Everything about CarbonX, MRV, blockchain, blue carbon\n• 🛒 Guiding you through purchase, registration, and retirement\n\n**Try:** "Sundarbans 5 tons price" or "What is blue carbon?"`, pills: ['🧮 Calculate a price', '📊 Platform stats', '📖 What is CarbonX?'] }),

    greeting: () => ({ text: `Hey there! 👋 I'm **Mira**, your CarbonX AI guide.\n\nI can calculate carbon credit prices, explain the science, or guide you through the platform. What can I help you with?`, pills: ['💬 What is CarbonX?', '📊 Platform stats', '🧮 Calculate a price'] }),

    thanks: () => ({ text: `Anytime! 🌿 Let me know if you have more questions about carbon credits, the platform, or anything else.` }),

    help: () => ({ text: `Here's everything I can do:\n\n**💰 Pricing**\n• "Sundarbans 3 tons price"\n• "How many tons can I buy with $500?"\n\n**📊 Platform & Projects**\n• "List all projects" · "Compare all projects"\n• "Cheapest project?" · "Platform stats"\n\n**🌍 Emissions Science**\n• "5 tons equal how many flights?"\n• "2 tons in car miles?"\n\n**📖 Knowledge**\n• "What is CarbonX?" · "What is blue carbon?"\n• "How does MRV work?" · "What is NDVI?"\n\n**🛒 How-To**\n• "How do I buy credits?"\n• "How do I retire credits?"`, pills: ['🧮 Calculate a price', '📊 Platform stats', '📖 What is blue carbon?'] }),

    what_is_carbonx: () => ({ text: `**CarbonX** is the world's first AI-verified blue carbon registry.\n\n🌿 **What it does:**\n• Lists verified mangrove, seagrass & wetland projects in India\n• Validates them using AI + Copernicus Sentinel-2 satellite imagery\n• Issues credits as ERC-1155 tokens on Polygon Amoy blockchain\n• Lets you buy credits via MATIC or Stripe card payment\n• Records all retirements permanently on-chain\n\n📊 **Right now:** ${live.active().length} active projects · ${live.total().toLocaleString()} tCO₂e available · Prices from ${usd(live.cheapest().pricePerTon)}/ton`, pills: ['📊 Platform stats', '🛒 Open Marketplace', '🧮 Calculate a price'] }),

    how_it_works: () => ({ text: `CarbonX works in **4 steps**:\n\n**1. 🌱 NGO Proposes** — An NGO submits GPS coordinates and ecosystem type for a coastal project.\n\n**2. 🛰️ AI Validates** — Sentinel-2 satellite computes NDVI biomass index. Score ≥ ${PF.ndviPassThreshold} = VERIFIED automatically.\n\n**3. 🪙 Credits Minted** — Upon verification, ERC-1155 tokens are minted on Polygon — one token per tCO₂e sequestered.\n\n**4. 🛒 Buy & Retire** — Buy via MATIC or Stripe. Retiring burns tokens to address(0), creating an immutable on-chain offset certificate.`, pills: ['🧮 Calculate a price', '🌱 What is MRV?', '🛒 Open Marketplace'] }),

    what_is_carbon_credit: () => ({ text: `A **carbon credit** = 1 metric tonne of CO₂ equivalent (tCO₂e) captured or sequestered from the atmosphere.\n\n**On CarbonX, each credit is:**\n• An **ERC-1155 token** on Polygon — transparent and tradeable\n• Backed by **satellite-verified NDVI data** — no manual auditing\n• Retirable by burning to address(0) — creating a permanent, public offset record\n\n💰 Current prices: **${usd(live.cheapest().pricePerTon)}** to **${usd(live.priciest().pricePerTon)}** per tCO₂e`, pills: ['🧮 Calculate a price', '💰 Cheapest project'] }),

    what_is_blue_carbon: () => ({ text: `**Blue carbon** is carbon captured and stored by **coastal and ocean ecosystems**:\n\n• 🌿 **Mangroves** — store 3–5× more carbon per hectare than tropical rainforests. Disappearing at 1–2%/year.\n• 🌾 **Seagrasses** — cover <0.2% of ocean floor but store ~10% of all ocean carbon\n• 🌊 **Salt marshes** — highly productive carbon sinks with strong biodiversity benefits\n\n**Why CarbonX focuses on blue carbon:** These ecosystems offer the highest carbon density, protect coastlines, and support fishing communities. India has 4,900 km² of mangroves — one of the world's largest.`, pills: ['🛒 Open Marketplace', '📊 Platform stats'] }),

    what_is_mrv: () => ({ text: `**MRV** = Measurement, Reporting & Verification — the process of independently confirming how much carbon a project sequesters.\n\n**CarbonX automates MRV:**\n1. Downloads **Copernicus Sentinel-2** imagery (10m resolution, free)\n2. Computes **NDVI** (vegetation density index) for the project area\n3. Cross-references 2 years of historical imagery for deforestation events\n4. Generates a **cryptographic signature** if NDVI ≥ ${PF.ndviPassThreshold}\n5. Updates project status to **VERIFIED** on-chain\n\nThis replaces expensive third-party auditors (typically $50,000–$200,000 per project) with an automated pipeline costing $100–$500/run.`, pills: ['🛰️ What is NDVI?', '🛒 Open Marketplace'] }),

    what_is_ndvi: () => ({ text: `**NDVI** (Normalized Difference Vegetation Index) is a satellite-derived measure of vegetation health.\n\n**Formula:** NDVI = (NIR − Red) / (NIR + Red)\n\n**Score guide:**\n• **0.80–1.0** ✅ Dense healthy forest — **PASSES** MRV validation\n• **0.60–0.79** ⚠️ Moderate — pending detailed review\n• **< 0.60** ❌ Sparse or degraded — fails verification\n\n**Our projects:** Score ${Math.min(...live.active().map(p => p.ndvi)).toFixed(2)} to ${Math.max(...live.active().map(p => p.ndvi)).toFixed(2)} — all above the 0.80 threshold.`, pills: ['🌱 What is MRV?', '📊 Platform stats'] }),

    calc_price:    priceForTons,
    calc_budget:   budgetCalc,
    calc_emissions: emissionsCalc,

    project_lookup: (e) => {
      const p = e.project!
      return {
        text: `**${p.name}**\n📍 ${p.location}\n✅ Validator: **${p.validator}**\n💰 Price: **${usd(p.pricePerTon)}/tCO₂e**\n🛰️ NDVI: **${p.ndvi.toFixed(2)}**\n📊 Status: **${p.status.toUpperCase()}**${p.status === 'active' ? `\n🪙 Available: **${p.availableCredits.toLocaleString()} tCO₂e**` : ''}`,
        calculation: { label: p.name, rows: [
          { label: 'Location',   value: p.location              },
          { label: 'Validator',  value: p.validator             },
          { label: 'Price/ton',  value: usd(p.pricePerTon), highlight: true },
          { label: 'NDVI Score', value: p.ndvi.toFixed(2)       },
          { label: 'Available',  value: p.status === 'active' ? `${p.availableCredits.toLocaleString()} tCO₂e` : p.status.toUpperCase() },
          { label: 'Token ID',   value: `ERC-1155 #${p.tokenId}` },
        ]},
        pills: [`🛒 Buy ${p.shortName} credits`, '🧮 Calculate price for this project'],
      }
    },

    project_list: () => ({
      text: `CarbonX has **${live.active().length} active projects** with **${live.total().toLocaleString()} tCO₂e** available for purchase:`,
      calculation: { label: 'All CarbonX Projects', rows: AI_PROJECTS.map(p => ({ label: p.name, value: p.status === 'active' ? `${usd(p.pricePerTon)}/ton` : p.status.toUpperCase() })) },
      pills: ['🛒 Open Marketplace', '💰 Show cheapest project', '📊 Compare all projects'],
    }),

    compare_projects: () => {
      const a = live.active().sort((a, b) => a.pricePerTon - b.pricePerTon)
      return {
        text: `Here are all active projects sorted by price (cheapest first):`,
        calculation: { label: 'Project Comparison (per tCO₂e)', rows: a.map((p, i) => ({ label: `${p.shortName} — ${p.validator}`, value: usd(p.pricePerTon), highlight: i === 0 })) },
        pills: ['💰 Show cheapest project', '🛒 Open Marketplace'],
      }
    },

    cheapest: () => { const ch = live.cheapest(); return { text: `Most affordable active project: **${ch.name}** at **${usd(ch.pricePerTon)}/tCO₂e**\n\n✅ Validator: ${ch.validator}\n📍 Location: ${ch.location}\n🛰️ NDVI: ${ch.ndvi.toFixed(2)}\n🪙 Available: ${ch.availableCredits.toLocaleString()} tCO₂e`, calculation: { label: 'Cheapest Active Project', rows: [{ label: 'Project', value: ch.name }, { label: 'Price/ton', value: usd(ch.pricePerTon), highlight: true }, { label: 'Validator', value: ch.validator }, { label: 'Available', value: `${ch.availableCredits.toLocaleString()} tCO₂e` }] }, pills: [`🛒 Buy ${ch.shortName} credits`] } },

    most_expensive: () => { const pr = live.priciest(); return { text: `Premium project: **${pr.name}** at **${usd(pr.pricePerTon)}/tCO₂e**\n\n✅ Validator: ${pr.validator}\n📍 Location: ${pr.location}\n🛰️ NDVI: ${pr.ndvi.toFixed(2)} (highest quality)`, calculation: { label: 'Premium Project', rows: [{ label: 'Project', value: pr.name }, { label: 'Price/ton', value: usd(pr.pricePerTon), highlight: true }, { label: 'NDVI', value: pr.ndvi.toFixed(2) }, { label: 'Validator', value: pr.validator }] }, pills: ['💰 Show cheapest project'] } },

    total_credits: () => { const tot = live.total(); return { text: `CarbonX currently has **${tot.toLocaleString()} tCO₂e** available across **${live.active().length} active projects**.`, calculation: { label: 'Credits Available by Project', rows: [...live.active().map(p => ({ label: p.shortName, value: `${p.availableCredits.toLocaleString()} tCO₂e` })), { label: 'TOTAL', value: `${tot.toLocaleString()} tCO₂e`, highlight: true }] }, pills: ['🛒 Open Marketplace', '🧮 Calculate a price'] } },

    platform_stats: () => ({ text: `Live CarbonX registry snapshot:`, calculation: { label: 'Platform Overview', rows: [{ label: 'Active projects', value: `${live.active().length}` }, { label: 'Total credits', value: `${live.total().toLocaleString()} tCO₂e`, highlight: true }, { label: 'Avg price', value: usd(live.avgPrice()) }, { label: 'Cheapest', value: `${live.cheapest().shortName} @ ${usd(live.cheapest().pricePerTon)}` }, { label: 'Blockchain', value: PF.chainName }, { label: 'Standard', value: PF.tokenStandard }] }, pills: ['🛒 Open Marketplace', '🧮 Calculate a price'] }),

    how_to_buy: () => ({ text: `**How to buy carbon credits on CarbonX:**\n\n1. 👤 Create a free account at /auth → select "Corporate Buyer" role\n2. 🔗 Connect your MetaMask wallet (optional — needed only for Web3 payment)\n3. 🛒 Go to Marketplace → browse all verified projects\n4. 📦 Click **"Purchase Credits"** on any active project\n5. 💳 Choose payment:\n   • **Web3/MATIC** — pay from MetaMask, zero platform fee\n   • **Card/USD** — Stripe checkout, 2.9% platform fee\n6. ✅ Credits arrive as ERC-1155 tokens in your wallet instantly\n7. 🔥 Retire credits on the Ledger page when you want to claim your offset`, pills: ['🛒 Open Marketplace', '🔒 View Ledger'] }),

    how_to_register: () => ({ text: `**Registering on CarbonX (it's free):**\n\n1. Click "Create Account" or go to /auth\n2. Switch to the **"Create Account"** tab\n3. Enter your name, email, and password (minimum 8 characters)\n4. Select your **role:**\n   • 🌿 NGO — submit carbon projects\n   • 🏛️ Government — run MRV validations\n   • 🏢 Corporate — buy credits at scale\n   • 🎓 Academic — conduct scientific audits\n5. Optionally add your MetaMask wallet address\n6. Click **Create Account** — you're done!`, pills: ['💡 Tour the Marketplace'] }),

    is_it_free: () => ({ text: `**Account creation and browsing are completely free ✅**\n\nYou only pay when:\n• 🛒 **Buying credits** — ${usd(live.cheapest().pricePerTon)} to ${usd(live.priciest().pricePerTon)}/tCO₂e depending on project\n• 💳 **Card payment** — 2.9% Stripe processing fee\n• ⛽ **Web3 payment** — small gas fee (~0.001–0.003 MATIC ≈ $0.001)\n\n**Always free:** Browsing, MRV, Ledger, Mira AI, Blog, Carbon Calculator`, pills: ['🧮 Calculate a price', '🛒 Open Marketplace'] }),

    contact: () => ({ text: `**Get in touch with CarbonX:**\n\n• 📧 **Email** — support@carbonx.app\n• 📞 **Phone** — +91 80 4567 8900 (Mon–Fri, 9am–6pm IST)\n• 💬 **Ask Mira** — I answer most questions instantly, 24/7\n• 📋 **Contact form** — /contact\n• 🐦 **Twitter** — @carbonx\n• 💻 **GitHub** — github.com/carbonx`, pills: ['❓ What can you do?'] }),

    token_explainer: () => ({ text: `CarbonX uses **${PF.tokenStandard}** on **${PF.chainName}** (Chain ID: ${PF.chainId}).\n\n**ERC-1155 advantages over ERC-721 (NFTs):**\n• Each project gets one Token ID — multiple users can hold the same token\n• Batch transfers save gas fees\n• Retiring calls \`retireCredits()\` — burns to address(0) permanently\n• All retirements visible on OKLink Explorer: ${PF.explorerUrl}`, pills: ['🔒 View Ledger', '🧮 Calculate price'] }),

    retire_explainer: () => ({ text: `**Retiring credits = permanently claiming your carbon offset:**\n\n1. Go to the **Ledger page** (/ledger)\n2. Enter Token ID, amount, and a retirement note\n3. Click **"Retire & Burn Credits"**\n4. Tokens are burned to \`0x0000…\` — **irreversible**\n5. A public, timestamped record is created on ${PF.explorerUrl}\n\n💡 This makes your offset **credible, verifiable, and tamper-proof forever** — no one can reuse retired credits.`, pills: ['🔒 View Ledger'] }),

    role_explainer: () => ({ text: `CarbonX has **4 user roles**, each with different capabilities:\n\n${PF.roles.map(r => `• **${r.label}** — ${r.power}`).join('\n')}`, pills: ['💡 Tour the Marketplace'] }),

    payment_explainer: () => ({ text: `**Two payment methods:**\n\n**1. Web3 / MATIC** (recommended)\n• Connect MetaMask → pay on Polygon Amoy\n• Zero platform fee — only standard gas (~$0.001)\n• Requires MATIC tokens from faucet.polygon.technology\n\n**2. Card / USD via Stripe**\n• Standard credit/debit card checkout\n• 2.9% platform fee applies\n• Test card: 4242 4242 4242 4242, Expiry: 12/26, CVC: 123\n• On success, backend webhook auto-mints your tokens`, pills: ['🛒 Open Marketplace'] }),

    validator_explainer: () => ({ text: `CarbonX projects carry one of three internationally-recognised certification badges:\n\n• **Verra (VCS)** — World's most-used voluntary carbon standard. 1,700+ projects, 900M+ credits issued globally.\n• **CCTS** (Climate, Community & Biodiversity Standards) — Focuses on biodiversity and community co-benefits.\n• **Gold Standard** — Founded by WWF. Prioritises UN Sustainable Development Goals alongside carbon.`, pills: ['🌱 What is MRV?'] }),

    pricing_info: () => ({ text: `**CarbonX Pricing:**\n\n💳 **Transaction fee:** 2.9% on card/Stripe purchases\n\n**Subscription plans:**\n• Starter: $99/month — up to 500 tCO₂e/month\n• Pro: $499/month — up to 5,000 tCO₂e/month + API\n• Enterprise: $2,000/month — unlimited + dedicated support\n\n**Other fees:**\n• NGO listing: $500–$2,000 per project\n• MRV validation: $100–$500 per run\n• Data licensing: $5,000–$50,000 per dataset\n\nVisit /pricing for full details.`, pills: ['💰 View Pricing Page'] }),

    revenue_info: () => ({ text: `**CarbonX earns money through 6 streams:**\n\n1. **2.9% transaction fee** on all card purchases\n2. **Project listing fee** ($500–$2,000) charged to NGOs\n3. **MRV validation fee** ($100–$500/run) charged to validators\n4. **Subscription plans** ($99–$2,000/month) for enterprise buyers\n5. **Token minting fee** ($0.10–$0.50/tCO₂e) on issuance\n6. **Data licensing** ($5,000–$50,000) for satellite data\n\nAt 10,000 tons/month sold, CarbonX earns ~$8,500/month from fees alone.`, pills: ['💰 View Pricing Page'] }),

    security_info: () => ({ text: `**CarbonX Security Measures:**\n\n🔐 **Authentication:** JWT tokens in HTTP-only cookies + bcrypt password hashing\n🛡️ **API:** Helmet.js security headers + rate limiting on all endpoints\n🔒 **Blockchain:** Smart contract audited + all retirements immutable on-chain\n🛰️ **MRV:** Cryptographic signature on every validated project\n🌐 **Transport:** HTTPS enforced + CORS configured\n📋 **Privacy:** DPDP Act 2023 compliant (India)\n\nWe never store private keys server-side. Your wallet is your own.`, pills: ['📖 Privacy Policy'] }),

    tech_stack: () => ({ text: `**CarbonX Tech Stack:**\n\n**Frontend:** Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Framer Motion · Wagmi v2 · Viem v2\n\n**Backend:** Node.js + Express.js · Knex.js ORM · PostgreSQL 16 (Docker) · JWT Auth · Stripe SDK\n\n**Blockchain:** Solidity (ERC-1155) · Hardhat v2 · OpenZeppelin v5 · Polygon Amoy (Chain ID 80002)\n\n**AI/Data:** Mira AI (local NLU engine) · Copernicus Sentinel-2 · NDVI computation\n\n**DevOps:** Docker Compose · GitHub Actions ready · MIT Licensed` }),

    data_info: () => ({ text: `**CarbonX Carbon Data Licensing:**\n\nWe collect and process high-value satellite carbon data including:\n• NDVI time-series for 6 Indian blue carbon sites\n• Sequestration rate estimates with uncertainty bounds\n• Historical deforestation event detection\n• Biomass density maps at 10m resolution\n\n**Who buys this data:**\nClimate funds, ESG analytics firms, universities, World Bank, IPCC researchers\n\n**Pricing:** $5,000–$50,000 per dataset · Annual subscriptions available\n\nContact: data@carbonx.app`, pills: ['📧 Contact Us'] }),

    fallback: () => ({ text: `I'm not sure about that one. Here are some things I can help you with:\n\n• **Pricing:** "Sundarbans 2 tons price" or "How many tons can I buy with $500?"\n• **Science:** "What is blue carbon?" or "How does MRV work?"\n• **Projects:** "List all projects" or "Compare all projects"\n• **Platform:** "What is CarbonX?" or "How do I buy credits?"`, pills: ['❓ What can I do?', '📊 Platform stats', '🧮 Calculate a price'] }),
  }

  const handler = HANDLERS[intent] ?? HANDLERS.fallback
  return handler(e)
}
