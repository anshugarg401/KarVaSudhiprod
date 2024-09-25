export interface NFT {
    id: number
    name: string
    image: string
    type: 'land' | 'tree'
    price: number
    description: string
    location: string
    communityImpact: string
    rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
  }
  
  export interface StakedNFT {
    id: number
    landNFT: NFT
    treeNFT: NFT
    stakedAt: Date
    stakingPeriod: number
    rewardRate: number
    location: {
      latitude: number
      longitude: number
    }
    status: 'alive' | 'dead'
    healthScore: number
  }
  
  export interface ResourceData {
    totalLand: number
    availableLand: number
    totalTrees: number
    availableTrees: number
    carbonOffset: number
  }
  
  export interface Notification {
    id: number
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    timestamp: Date
  }