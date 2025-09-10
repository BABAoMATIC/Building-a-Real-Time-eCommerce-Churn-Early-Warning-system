export interface OfferRule {
  id: string
  condition: string
  action: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ChurnCondition {
  value: string
  label: string
  description: string
}

export interface CreateOfferRuleRequest {
  condition: string
  action: string
}

export interface OfferRulesResponse {
  rules: OfferRule[]
  total: number
}
