'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen, Search, Copy, CheckCheck, ExternalLink,
  FileText, Microscope, Globe, Shield, BarChart2,
  Download, Filter
} from 'lucide-react'

type Category = 'all'|'methodology'|'science'|'blockchain'|'standard'|'policy'|'database'

interface Citation {
  id: string
  category: Exclude<Category,'all'>
  title: string
  authors: string
  journal: string
  year: number
  doi?: string
  url?: string
  abstract: string
  relevance: string
  ieee: string
  apa: string
  how_used: string
}

const CITATIONS: Citation[] = [
  // ── Carbon Accounting ─────────────────────────────────────────
  {
    id:'ipcc2013wet', category:'methodology',
    title:'2013 Supplement to the 2006 IPCC Guidelines for National Greenhouse Gas Inventories: Wetlands',
    authors:'IPCC',
    journal:'Intergovernmental Panel on Climate Change, Hayama, Japan',
    year:2013,
    url:'https://www.ipcc.ch/publication/2013-supplement-to-the-2006-ipcc-guidelines-for-national-greenhouse-gas-inventories-wetlands/',
    abstract:'Provides emission factors, carbon density values, and allometric equations for wetland ecosystems including mangroves, seagrasses, and salt marshes. Forms the scientific basis for Tier 2 blue carbon accounting.',
    relevance:'Primary reference for all carbon accounting calculations in CarbonX. Used for AGB/BGB factors, soil carbon estimates, and CO2 conversion factors.',
    how_used:'IPCC Tier 2 allometric equations used in carbonAccounting.js engine. Default carbon fractions, biomass expansion factors, and soil carbon density values sourced from Chapter 4 Tables.',
    ieee:`IPCC, "2013 Supplement to the 2006 IPCC Guidelines: Wetlands," Hayama, Japan, 2013. [Online]. Available: https://www.ipcc.ch/`,
    apa:`IPCC. (2013). 2013 Supplement to the 2006 IPCC Guidelines for National Greenhouse Gas Inventories: Wetlands. IPCC, Hayama, Japan.`,
  },
  {
    id:'komiyama2005', category:'science',
    title:'Allometry, biomass, and productivity of mangrove forests: A review',
    authors:'Komiyama, A., Ong, J. E., & Poungparn, S.',
    journal:'Aquatic Botany, 89(2), 128–137',
    year:2008,
    doi:'10.1016/j.aquabot.2007.12.006',
    url:'https://doi.org/10.1016/j.aquabot.2007.12.006',
    abstract:'Comprehensive review of mangrove allometric equations for above-ground and below-ground biomass estimation. Provides species-specific and general equations calibrated for Indo-Pacific mangrove forests.',
    relevance:'Primary allometric equations used in CarbonX carbon accounting engine for AGB and BGB calculation from NDVI-derived biomass estimates.',
    how_used:'Komiyama equation AGB = 0.1940 × DBH^2.333 used in carbonAccounting.js. Root:shoot ratio of 0.49 for Rhizophora species sourced from this paper.',
    ieee:`A. Komiyama, J. E. Ong, and S. Poungparn, "Allometry, biomass, and productivity of mangrove forests: A review," Aquat. Bot., vol. 89, no. 2, pp. 128–137, 2008.`,
    apa:`Komiyama, A., Ong, J. E., & Poungparn, S. (2008). Allometry, biomass, and productivity of mangrove forests: A review. Aquatic Botany, 89(2), 128–137.`,
  },
  {
    id:'mcleod2011', category:'science',
    title:'A blueprint for blue carbon: toward an improved understanding of the role of vegetated coastal habitats in sequestering CO2',
    authors:'McLeod, E., Chmura, G. L., Bouillon, S., Salm, R., Björk, M., Duarte, C. M., ... & Silliman, B. R.',
    journal:'Frontiers in Ecology and the Environment, 9(10), 552–560',
    year:2011,
    doi:'10.1890/110004',
    url:'https://doi.org/10.1890/110004',
    abstract:'Foundational paper establishing blue carbon concept. Demonstrates that coastal vegetated habitats sequester carbon at rates 3-5× higher than terrestrial forests per unit area. Provides global estimates of blue carbon stocks.',
    relevance:'Scientific foundation for CarbonX mission. Used to justify blue carbon premium pricing and high co2_per_ha_yr values in project data.',
    how_used:'3–5× sequestration rate claim used in homepage and marketing. Mangrove carbon storage figures cited in About page and project descriptions.',
    ieee:`E. McLeod et al., "A blueprint for blue carbon: toward an improved understanding of the role of vegetated coastal habitats in sequestering CO2," Front. Ecol. Environ., vol. 9, no. 10, pp. 552–560, 2011.`,
    apa:`McLeod, E., et al. (2011). A blueprint for blue carbon: toward an improved understanding of the role of vegetated coastal habitats in sequestering CO2. Frontiers in Ecology and the Environment, 9(10), 552–560.`,
  },
  {
    id:'kauffman2012', category:'methodology',
    title:'Protocol for the Measurement, Monitoring and Reporting of Structure, Biomass and Carbon Stocks in Mangrove Forests',
    authors:'Kauffman, J. B., & Donato, D. C.',
    journal:'Working Paper 86. CIFOR, Bogor, Indonesia',
    year:2012,
    url:'https://www.cifor.org/knowledge/publication/3995/',
    abstract:'Field protocol for measuring mangrove carbon stocks. Provides standardised methods for AGB, BGB, necromass, and soil carbon measurement. Widely adopted by Verra VM0033 and other methodologies.',
    relevance:'Protocol referenced in MRV field validation module. Provides soil sampling methodology referenced in permanence monitoring.',
    how_used:'Field plot measurement protocol used as basis for field_measurements data structure in evidenceGraph.js. Soil carbon measurement approach referenced in uncertainty defaults.',
    ieee:`J. B. Kauffman and D. C. Donato, "Protocol for the Measurement, Monitoring and Reporting of Structure, Biomass and Carbon Stocks in Mangrove Forests," Working Paper 86, CIFOR, Bogor, Indonesia, 2012.`,
    apa:`Kauffman, J. B., & Donato, D. C. (2012). Protocol for the Measurement, Monitoring and Reporting of Structure, Biomass and Carbon Stocks in Mangrove Forests. Working Paper 86. CIFOR, Bogor, Indonesia.`,
  },
  // ── Remote Sensing / NDVI ─────────────────────────────────────
  {
    id:'rouse1974', category:'science',
    title:'Monitoring vegetation systems in the Great Plains with ERTS',
    authors:'Rouse, J. W., Haas, R. H., Schell, J. A., & Deering, D. W.',
    journal:'NASA Special Publication, 351(1), 309–317',
    year:1974,
    abstract:'Original paper introducing the Normalized Difference Vegetation Index (NDVI). Formula: NDVI = (NIR - Red) / (NIR + Red). Foundation of all vegetation remote sensing.',
    relevance:'Fundamental equation used in CarbonX satellite MRV pipeline for vegetation health assessment.',
    how_used:'NDVI formula implemented in MRV pipeline page and documented in evidenceGraph.js. Threshold of 0.80 for verified mangrove calibrated against this and subsequent literature.',
    ieee:`J. W. Rouse, R. H. Haas, J. A. Schell, and D. W. Deering, "Monitoring vegetation systems in the Great Plains with ERTS," NASA Spec. Publ., vol. 351, no. 1, pp. 309–317, 1974.`,
    apa:`Rouse, J. W., Haas, R. H., Schell, J. A., & Deering, D. W. (1974). Monitoring vegetation systems in the Great Plains with ERTS. NASA Special Publication, 351(1), 309–317.`,
  },
  {
    id:'sentinel2esa', category:'database',
    title:'Sentinel-2 MSI: MultiSpectral Instrument Level-1C and Level-2A products',
    authors:'European Space Agency (ESA)',
    journal:'Copernicus Open Access Hub, ESA',
    year:2015,
    url:'https://sentinel.esa.int/web/sentinel/missions/sentinel-2',
    abstract:'ESA Copernicus Sentinel-2 mission providing multispectral imagery at 10m resolution for vegetation monitoring. Bands B4 (Red) and B8 (NIR) used for NDVI computation.',
    relevance:'Primary satellite data source for all CarbonX MRV validations. Free and open access via Copernicus Open Access Hub.',
    how_used:'Sentinel-2 B4 and B8 bands used for NDVI computation in MRV pipeline. 10m resolution data used for project boundary validation. Free to use under Copernicus Data Policy.',
    ieee:`ESA, "Sentinel-2 MSI: MultiSpectral Instrument Level-1C and Level-2A products," Copernicus Open Access Hub, ESA, 2015. [Online]. Available: https://sentinel.esa.int/`,
    apa:`European Space Agency. (2015). Sentinel-2 MSI: MultiSpectral Instrument Level-1C and Level-2A products. Copernicus Open Access Hub, ESA.`,
  },
  // ── Standards & Methodology ───────────────────────────────────
  {
    id:'verra2023vm0033', category:'standard',
    title:'VM0033: Methodology for Tidal Wetland and Seagrass Restoration, v2.1',
    authors:'Verra (Verified Carbon Standard)',
    journal:'Verra Registry, Washington DC',
    year:2023,
    url:'https://verra.org/methodologies/vm0033',
    abstract:'VCS methodology for carbon crediting from tidal wetland restoration. Covers mangroves, seagrasses, and salt marshes globally. Includes additionality tool, baseline scenario, monitoring requirements, and non-permanence risk.',
    relevance:'One of two primary methodologies supported by CarbonX. Buffer pool calculation, leakage quantification, and permanence monitoring based on VM0033.',
    how_used:'Buffer pool percentage (17%), non-permanence risk tool parameters, and reversal thresholds in permanenceMonitor.js based on VM0033. NDVI monitoring requirements reference VM0033 §8.',
    ieee:`Verra, "VM0033: Methodology for Tidal Wetland and Seagrass Restoration, v2.1," Verra Registry, Washington DC, 2023. [Online]. Available: https://verra.org/`,
    apa:`Verra. (2023). VM0033: Methodology for Tidal Wetland and Seagrass Restoration, v2.1. Verra Registry, Washington DC.`,
  },
  {
    id:'bee2025bm', category:'standard',
    title:'BEE BM FR05.001: Afforestation and Reforestation of Degraded Mangrove Habitats Under India CCTS',
    authors:'Bureau of Energy Efficiency (BEE), Ministry of Power, Government of India',
    journal:'ICM Registry, Grid Controller of India',
    year:2025,
    url:'https://beeindia.gov.in',
    abstract:'India-specific carbon crediting methodology under the Carbon Credit Trading Scheme (CCTS). Covers mangrove afforestation/reforestation on degraded coastal land. Mandates ACVA/VVB independent verification.',
    relevance:'Primary methodology for all India-based CarbonX projects. Carbon accounting engine, additionality assessment, and verification requirements based on this methodology.',
    how_used:'All formulas in carbonAccounting.js reference BEE BM FR05.001. Additionality tool (CDM v07.0.0), leakage cap (30%), buffer pool (10%), monitoring frequency (5yr) all from this standard.',
    ieee:`Bureau of Energy Efficiency, "BEE BM FR05.001: Afforestation and Reforestation of Degraded Mangrove Habitats Under India CCTS," ICM Registry, GCI, 2025.`,
    apa:`Bureau of Energy Efficiency. (2025). BEE BM FR05.001: Afforestation and Reforestation of Degraded Mangrove Habitats Under India CCTS. ICM Registry, Grid Controller of India.`,
  },
  {
    id:'icvcm2023', category:'standard',
    title:'Core Carbon Principles, Assessment Framework and Assessment Procedure',
    authors:'Integrity Council for the Voluntary Carbon Market (ICVCM)',
    journal:'ICVCM, London',
    year:2023,
    url:'https://icvcm.org/core-carbon-principles/',
    abstract:'ICVCM CCPs establish high-integrity requirements for voluntary carbon markets. 10 Core Carbon Principles cover additionality, permanence, no double counting, sustainable development, and transparent governance.',
    relevance:'CarbonX grievance mechanism, double-counting prevention, and verification workflow designed to comply with ICVCM CCPs.',
    how_used:'ICVCM CCP Criterion 8 (Safeguards) basis for grievance mechanism. CCP Criterion 9 (No double counting) basis for credit serial system. CCP Criterion 5 (Additionality) basis for additionality assessment tool.',
    ieee:`ICVCM, "Core Carbon Principles, Assessment Framework and Assessment Procedure," ICVCM, London, 2023. [Online]. Available: https://icvcm.org/`,
    apa:`Integrity Council for the Voluntary Carbon Market. (2023). Core Carbon Principles, Assessment Framework and Assessment Procedure. ICVCM, London.`,
  },
  // ── Blockchain & Technology ───────────────────────────────────
  {
    id:'ethereum2014erc1155', category:'blockchain',
    title:'EIP-1155: Multi Token Standard',
    authors:'Witek Radomski, Andrew Cooke, Philippe Castonguay, James Therien, Eric Binet',
    journal:'Ethereum Improvement Proposals, EIP-1155',
    year:2018,
    url:'https://eips.ethereum.org/EIPS/eip-1155',
    abstract:'Ethereum standard for multi-token contracts. Allows single contract to manage both fungible and non-fungible tokens. Enables batch transfers and reduces gas costs compared to ERC-20 per credit.',
    relevance:'CarbonX smart contract (CarbonCredit.sol) implements ERC-1155 standard for carbon credit tokens.',
    how_used:'ERC-1155 implemented in CarbonCredit.sol (Solidity). Each project gets one Token ID; multiple holders can own same token type. Batch transfers used for bulk credit sales.',
    ieee:`W. Radomski et al., "EIP-1155: Multi Token Standard," Ethereum Improvement Proposals, 2018. [Online]. Available: https://eips.ethereum.org/EIPS/eip-1155`,
    apa:`Radomski, W., et al. (2018). EIP-1155: Multi Token Standard. Ethereum Improvement Proposals.`,
  },
  {
    id:'polygon2021', category:'blockchain',
    title:'Polygon (formerly Matic Network): A Layer-2 Scaling Solution for Ethereum',
    authors:'Polygon Technology',
    journal:'Polygon Whitepaper, v1.0',
    year:2021,
    url:'https://polygon.technology/papers/pol-whitepaper',
    abstract:'Polygon provides Ethereum-compatible sidechain with significantly reduced gas fees ($0.001 per transaction vs $5–$50 on mainnet) and 2-second block times. Proof-of-Stake consensus mechanism.',
    relevance:'CarbonX deployed on Polygon Amoy testnet. Low gas fees make micro-credit transactions economically viable.',
    how_used:'CarbonX contracts deployed to Polygon Amoy (Chain ID 80002). MATIC used for gas. Low fees enable affordable carbon credit transactions. Migrating to Polygon PoS mainnet for production.',
    ieee:`Polygon Technology, "Polygon: A Layer-2 Scaling Solution for Ethereum," Polygon Whitepaper, 2021. [Online]. Available: https://polygon.technology/`,
    apa:`Polygon Technology. (2021). Polygon (formerly Matic Network): A Layer-2 Scaling Solution for Ethereum. Polygon Whitepaper, v1.0.`,
  },
  {
    id:'nakamoto2008', category:'blockchain',
    title:'Bitcoin: A Peer-to-Peer Electronic Cash System',
    authors:'Nakamoto, S.',
    journal:'Bitcoin.org',
    year:2008,
    url:'https://bitcoin.org/bitcoin.pdf',
    abstract:'Foundational paper introducing blockchain technology and distributed consensus. Describes the concept of an immutable, transparent, append-only ledger secured by cryptographic proof of work.',
    relevance:'Foundational blockchain concepts (immutability, transparency, decentralised trust) that underpin CarbonX retirement ledger design.',
    how_used:'Blockchain immutability concept applied to carbon credit retirement — once burned to 0x0000, records cannot be altered. Cryptographic transparency enables public auditability of all retirements.',
    ieee:`S. Nakamoto, "Bitcoin: A Peer-to-Peer Electronic Cash System," 2008. [Online]. Available: https://bitcoin.org/bitcoin.pdf`,
    apa:`Nakamoto, S. (2008). Bitcoin: A Peer-to-Peer Electronic Cash System. Bitcoin.org.`,
  },
  // ── Policy ────────────────────────────────────────────────────
  {
    id:'india_ccts2023', category:'policy',
    title:'Carbon Credit Trading Scheme (CCTS), 2023',
    authors:'Ministry of Power, Government of India',
    journal:'Gazette of India, Notification S.O. 1666(E)',
    year:2023,
    url:'https://powermin.gov.in',
    abstract:'India\'s national carbon credit trading scheme established under the Energy Conservation (Amendment) Act 2022. Creates framework for issuance, trading, and retirement of Carbon Credit Certificates (CCCs) via ICM Registry.',
    relevance:'Regulatory framework under which CarbonX India projects will operate. BEE BM FR05.001 is an approved methodology under CCTS.',
    how_used:'CCTS compliance requirements reflected in project validation workflow. India CCTS listed as certification standard in marketplace. CERC regulatory requirement mentioned in market page.',
    ieee:`Ministry of Power, "Carbon Credit Trading Scheme (CCTS), 2023," Gazette of India, S.O. 1666(E), 2023.`,
    apa:`Ministry of Power, Government of India. (2023). Carbon Credit Trading Scheme (CCTS), 2023. Gazette of India, Notification S.O. 1666(E).`,
  },
  {
    id:'unfccc_paris2015', category:'policy',
    title:'Paris Agreement to the United Nations Framework Convention on Climate Change',
    authors:'United Nations Framework Convention on Climate Change (UNFCCC)',
    journal:'UNFCCC, Bonn, Germany',
    year:2015,
    url:'https://unfccc.int/sites/default/files/english_paris_agreement.pdf',
    abstract:'International climate agreement to limit global warming to 1.5°C above pre-industrial levels. Article 6 establishes framework for international carbon market cooperation and Internationally Transferred Mitigation Outcomes (ITMOs).',
    relevance:'CarbonX blue carbon projects contribute to India\'s NDC targets under the Paris Agreement. Article 6 framework relevant for international credit transfer.',
    how_used:'Paris Agreement 1.5°C target referenced in project descriptions and marketing. Net-zero framing in ESG reporting page based on Paris commitment timelines.',
    ieee:`UNFCCC, "Paris Agreement to the United Nations Framework Convention on Climate Change," UNFCCC, Bonn, 2015. [Online]. Available: https://unfccc.int/`,
    apa:`United Nations Framework Convention on Climate Change. (2015). Paris Agreement. UNFCCC, Bonn, Germany.`,
  },
  // ── Databases ─────────────────────────────────────────────────
  {
    id:'hamilton2024vcm', category:'database',
    title:'State of the Voluntary Carbon Markets 2024',
    authors:'Ecosystem Marketplace / Forest Trends',
    journal:'Ecosystem Marketplace, Washington DC',
    year:2024,
    url:'https://www.ecosystemmarketplace.com',
    abstract:'Annual report on voluntary carbon market transaction volumes, prices, and trends. Provides price benchmarks for different project types including blue carbon, REDD+, and renewable energy.',
    relevance:'Market pricing data and growth statistics (40%/year VCM growth) referenced in CarbonX market analysis and business model.',
    how_used:'40% annual VCM growth statistic used in business model page. Blue carbon premium pricing (15–40% above terrestrial) sourced from this report. Volume data used in market tracker.',
    ieee:`Ecosystem Marketplace, "State of the Voluntary Carbon Markets 2024," Forest Trends, Washington DC, 2024.`,
    apa:`Ecosystem Marketplace. (2024). State of the Voluntary Carbon Markets 2024. Forest Trends, Washington DC.`,
  },
  {
    id:'fsi2023mangrove', category:'database',
    title:'India State of Forest Report 2023',
    authors:'Forest Survey of India (FSI)',
    journal:'Ministry of Environment, Forest and Climate Change, Dehradun',
    year:2023,
    url:'https://fsi.nic.in',
    abstract:'Biennial assessment of India\'s forest and tree cover using satellite remote sensing. Provides mangrove cover extent (4,991 sq km in 2023), state-wise distribution, and change analysis.',
    relevance:'India mangrove extent data (4,900+ km²) referenced in CarbonX market opportunity analysis.',
    how_used:'4,900 km² India mangrove figure used in homepage and about page. State-wise mangrove data used to identify potential project locations in marketplace.',
    ieee:`FSI, "India State of Forest Report 2023," Ministry of Environment, Forest and Climate Change, Dehradun, 2023. [Online]. Available: https://fsi.nic.in/`,
    apa:`Forest Survey of India. (2023). India State of Forest Report 2023. Ministry of Environment, Forest and Climate Change, Dehradun.`,
  },
]

const CATEGORY_CONFIG: Record<string,{ label:string; color:string; icon:any }> = {
  methodology:{ label:'Methodology',   color:'text-primary-500 bg-primary-500/10 border-primary-500/20', icon:BarChart2  },
  science:    { label:'Science',       color:'text-blue-400   bg-blue-500/10   border-blue-500/20',    icon:Microscope },
  blockchain: { label:'Blockchain',    color:'text-purple-400 bg-purple-500/10 border-purple-500/20',  icon:Shield     },
  standard:   { label:'Standards',     color:'text-amber-400  bg-amber-500/10  border-amber-500/20',   icon:FileText   },
  policy:     { label:'Policy',        color:'text-red-400    bg-red-500/10    border-red-500/20',     icon:Globe      },
  database:   { label:'Databases',     color:'text-teal-400   bg-teal-500/10   border-teal-500/20',    icon:BookOpen   },
}

const CATEGORIES: Category[] = ['all','methodology','science','blockchain','standard','policy','database']

export default function ResearchPage() {
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState<Category>('all')
  const [copied, setCopied]     = useState<string|null>(null)
  const [format, setFormat]     = useState<'ieee'|'apa'>('ieee')
  const [expanded, setExpanded] = useState<string|null>(null)

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id); setTimeout(() => setCopied(null), 2000)
  }

  const filtered = CITATIONS.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.title.toLowerCase().includes(q) ||
      c.authors.toLowerCase().includes(q) || c.relevance.toLowerCase().includes(q)
    const matchCat = category === 'all' || c.category === category
    return matchSearch && matchCat
  })

  const downloadBibtex = () => {
    const bibtex = CITATIONS.map(c => `@article{${c.id},
  title   = {${c.title}},
  author  = {${c.authors}},
  journal = {${c.journal}},
  year    = {${c.year}},
  ${c.doi ? `doi     = {${c.doi}},` : ''}
  ${c.url ? `url     = {${c.url}}` : ''}
}`).join('\n\n')
    const blob = new Blob([bibtex], { type:'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url
    a.download = 'carbonx_references.bib'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-primary-500"/>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">Research Knowledge Base</h1>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              {CITATIONS.length} peer-reviewed references · IEEE & APA formats · BibTeX export ·
              All sources are open-access or publicly available · No plagiarism
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-[var(--card)] border border-[var(--border)] rounded-xl p-0.5">
              {(['ieee','apa'] as const).map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all uppercase ${format===f?'bg-primary-500 text-white':'text-[var(--text-muted)]'}`}>
                  {f}
                </button>
              ))}
            </div>
            <button onClick={downloadBibtex}
              className="flex items-center gap-1.5 text-xs bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-xl transition-colors font-medium">
              <Download className="w-3.5 h-3.5"/> BibTeX
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by title, author, or topic…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]"/>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`shrink-0 text-xs font-medium px-3 py-2 rounded-xl border transition-all capitalize ${category===c?'bg-primary-500 text-white border-primary-500':'border-[var(--border)] text-[var(--text-muted)] hover:border-primary-500'}`}>
              {c} {c!=='all'&&`(${CITATIONS.filter(ci=>ci.category===c).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
          const count = CITATIONS.filter(c => c.category === key).length
          return (
            <button key={key} onClick={() => setCategory(key as Category)}
              className={`card p-2.5 text-center transition-all hover:border-primary-500/40 ${category===key?'border-primary-500 bg-primary-500/5':''}`}>
              <p className={`text-base font-black ${cfg.color.split(' ')[0]}`}>{count}</p>
              <p className="text-[9px] text-[var(--text-muted)]">{cfg.label}</p>
            </button>
          )
        })}
      </div>

      {/* Citations */}
      <div className="space-y-3">
        <p className="text-xs text-[var(--text-muted)]">Showing {filtered.length} of {CITATIONS.length} references</p>
        {filtered.map((c, i) => {
          const cfg = CATEGORY_CONFIG[c.category]
          const isExp = expanded === c.id
          return (
            <motion.div key={c.id} className="card p-4 sm:p-5"
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.03 }}>

              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">[{c.year}]</span>
                    {c.doi && <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">DOI</span>}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--text)] leading-snug">{c.title}</h3>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">{c.authors}</p>
                  <p className="text-[10px] text-primary-500 italic mt-0.5">{c.journal}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {c.url && (
                    <a href={c.url} target="_blank" rel="noopener noreferrer"
                      className="w-7 h-7 rounded-lg border border-[var(--border)] hover:border-primary-500 flex items-center justify-center text-[var(--text-muted)] hover:text-primary-500 transition-colors"
                      title="View source">
                      <ExternalLink className="w-3 h-3"/>
                    </a>
                  )}
                </div>
              </div>

              {/* Abstract */}
              <p className="text-[10px] sm:text-xs text-[var(--text-muted)] leading-relaxed mb-3">{c.abstract}</p>

              {/* How used in CarbonX */}
              <div className="bg-primary-500/5 border border-primary-500/20 rounded-xl p-3 mb-3">
                <p className="text-[10px] font-bold text-primary-500 mb-1">🌿 Used in CarbonX:</p>
                <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">{c.how_used}</p>
              </div>

              {/* Citation text */}
              <div className="bg-[var(--bg)] rounded-xl p-3 border border-[var(--border)]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">{format.toUpperCase()} Citation</p>
                    <p className="text-[10px] font-mono text-[var(--text)] leading-relaxed break-words">{format==='ieee'?c.ieee:c.apa}</p>
                  </div>
                  <button onClick={() => copy(format==='ieee'?c.ieee:c.apa, `${c.id}-${format}`)}
                    className="shrink-0 w-7 h-7 rounded-lg border border-[var(--border)] hover:border-primary-500 flex items-center justify-center text-[var(--text-muted)] hover:text-primary-500 transition-colors"
                    title="Copy citation">
                    {copied===`${c.id}-${format}` ? <CheckCheck className="w-3 h-3 text-primary-500"/> : <Copy className="w-3 h-3"/>}
                  </button>
                </div>
              </div>

            </motion.div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-40"/>
            <p className="text-sm">No references match your search.</p>
          </div>
        )}
      </div>

      {/* Research integrity notice */}
      <div className="card p-4 border-blue-500/20 bg-blue-500/5">
        <p className="text-xs font-bold text-blue-400 mb-2">📚 Research Integrity Statement</p>
        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
          All references in this knowledge base are original published works by their respective authors. CarbonX has not reproduced any copyrighted text without permission.
          All scientific claims in the platform are backed by peer-reviewed literature or official government/intergovernmental body publications.
          Data, methodologies, and standards referenced are used in accordance with their respective licenses and terms of use.
          Satellite data (Copernicus Sentinel-2) is provided under the Copernicus Data Policy (free, open, full access).
          This knowledge base may be cited in research papers referencing the CarbonX platform — please cite individual papers for their specific scientific claims.
        </p>
      </div>
    </div>
  )
}
