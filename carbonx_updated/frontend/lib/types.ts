export type ProjectStatus  = 'active'|'soldout'|'upcoming'|'pending'|'rejected'
export type ValidatorBadge = 'Verra'|'CCTS'|'Gold Standard'
export type UserRole       = 'ngo'|'government'|'corporate'|'academic'

export interface Project {
  id:string; name:string; description:string; location:string; coordinates:string
  area_sq_km:number; validator_badge:ValidatorBadge; token_id:number
  target_credits:number; issued_credits:number; retired_credits:number
  available_credits:number; price_per_ton_usd:number; ndvi_score:number
  status:ProjectStatus; created_at:string; updated_at:string
}

export interface User {
  id:string; full_name:string; email:string; wallet_address:string|null
  assigned_role:UserRole; created_at:string
}

export interface RetirementRecord {
  id:string; project_id:string; user_id:string; token_id:number
  amount:number; note:string; tx_hash:string; block_number:number; created_at:string
  project?:{name:string}; user?:{full_name:string; email:string}
}

export interface MRVLog {
  id:string; project_id:string; ndvi_score:number
  status:'pending'|'verified'|'rejected'; signature:string; created_at:string
}
