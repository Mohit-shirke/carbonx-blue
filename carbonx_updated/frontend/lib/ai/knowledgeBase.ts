export interface AIProject {
  id:string; name:string; shortName:string; aliases:string[]
  location:string; validator:'Verra'|'CCTS'|'Gold Standard'
  tokenId:number; pricePerTon:number; availableCredits:number
  ndvi:number; status:'active'|'soldout'|'upcoming'
}

export const AI_PROJECTS: AIProject[] = [
  { id:'p1', name:'Sundarbans Mangrove Reserve', shortName:'Sundarbans',    aliases:['sundarban','sundarbans','sunderban'],   location:'West Bengal, India',    validator:'Verra',        tokenId:1001, pricePerTon:28.50, availableCredits:8200, ndvi:0.84, status:'active'   },
  { id:'p2', name:'Bhitarkanika Coastal Forest', shortName:'Bhitarkanika',  aliases:['bhitarkanika','bhitar'],               location:'Odisha, India',         validator:'CCTS',         tokenId:1002, pricePerTon:22.00, availableCredits:5100, ndvi:0.76, status:'active'   },
  { id:'p3', name:'Pichavaram Mangrove Block',   shortName:'Pichavaram',    aliases:['pichavaram','pitchavaram'],            location:'Tamil Nadu, India',     validator:'Gold Standard', tokenId:1003, pricePerTon:19.75, availableCredits:3400, ndvi:0.71, status:'active'   },
  { id:'p4', name:'Godavari Delta Reserve',      shortName:'Godavari',      aliases:['godavari','godavari delta'],           location:'Andhra Pradesh, India', validator:'Verra',        tokenId:1004, pricePerTon:31.00, availableCredits:6700, ndvi:0.79, status:'active'   },
  { id:'p5', name:'Gulf of Mannar Marine Park',  shortName:'Gulf of Mannar',aliases:['gulf of mannar','mannar'],            location:'Tamil Nadu, India',     validator:'CCTS',         tokenId:1005, pricePerTon:16.50, availableCredits:2100, ndvi:0.65, status:'upcoming' },
  { id:'p6', name:'Chilika Lagoon Sanctuary',    shortName:'Chilika',       aliases:['chilika','chilka'],                   location:'Odisha, India',         validator:'Gold Standard', tokenId:1006, pricePerTon:24.00, availableCredits:0,    ndvi:0.68, status:'soldout'  },
]

export function findProjectByName(text: string): AIProject | null {
  const lower = text.toLowerCase()
  for (const p of AI_PROJECTS) if (p.aliases.some(a => lower.includes(a))) return p
  return null
}

export const EMISSIONS_EQUIVALENTS = {
  carMilesPerTon:2481, carKmPerTon:3993, gallonsGasPerTon:112.7,
  litresGasPerTon:426.6, flightsLongHaulPerTon:0.5, flightsShortHaulPerTon:2.2,
  treeSeedlingsGrown10yr:16.5, smartphonesCharged:121643, homeEnergyMonths:1.2, lbsCoalBurned:1124,
} as const

export const PLATFORM_FACTS = {
  chainName:'Polygon Amoy Testnet', chainId:80002, tokenStandard:'ERC-1155',
  rpcUrl:'https://rpc-amoy.polygon.technology/', explorerUrl:'https://www.oklink.com/amoy',
  burnAddress:'0x0000000000000000000000000000000000000000',
  validators:['Verra','CCTS','Gold Standard'] as const,
  satelliteSource:'Copernicus Sentinel-2', satelliteResolution:'10 metres per pixel',
  ndviPassThreshold:0.80, platformFeePercent:2.9,
  roles:[
    {id:'ngo',        label:'NGO / Project Proposer',      power:'submit new blue carbon projects'              },
    {id:'government', label:'Government Validator',         power:'run MRV pipelines and approve projects'       },
    {id:'corporate',  label:'Corporate Enterprise Buyer',   power:'purchase credits at scale to offset emissions'},
    {id:'academic',   label:'Independent Academic Auditor', power:'conduct third-party scientific review'        },
  ],
} as const
