import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { Progress } from '@radix-ui/react-progress'
import { AlertTriangle, Clock, Coins, Leaf, MapPin, Sun, Lock, Unlock } from 'lucide-react'
import { Button } from './ui/button'
//stakedNFTs
import type { StakedNFT} from '~/types/index'

interface props {
    stakedNFTs: StakedNFT[]
    calculateTimeRemaining: (nft: StakedNFT) => number
    formatTimeRemaining: (time: number) => string
    calculateProgress: (nft: StakedNFT) => number
    handleUnstake: (id: number) => void
    handleClaimDeadTree: (id: number) => void
    calculateRewards: (nft: StakedNFT) => number
}
function Dashboard({stakedNFTs,calculateTimeRemaining,formatTimeRemaining,calculateProgress,handleUnstake,handleClaimDeadTree,calculateRewards}:props) {
  return (
<Card className="bg-green-50">
              <CardHeader>
                <CardTitle className="text-2xl text-green-800">Your Forest Dashboard</CardTitle>
                <CardDescription className="text-green-600">
                  Monitor your staked NFTs and their impact on Kenyan forests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {stakedNFTs.map(nft => (
                    <Card key={nft.id} className="bg-white">
                      <CardHeader>
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={nft.landNFT.image} alt={nft.landNFT.name} />
                            <AvatarFallback>{nft.landNFT.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-green-800">{nft.landNFT.name} + {nft.treeNFT.name}</CardTitle>
                            <CardDescription className="text-green-600">Staked {nft.stakedAt.toLocaleDateString()}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-700">Staking Progress</span>
                            <span className="text-sm font-medium text-green-700">{calculateProgress(nft).toFixed(0)}%</span>
                          </div>
                          <Progress value={calculateProgress(nft)} className="w-full" />
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">
                              {formatTimeRemaining(calculateTimeRemaining(nft))} remaining
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Coins className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">
                              {calculateRewards(nft)} KV1 tokens earned
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">
                              Location: {nft.location.latitude.toFixed(4)}, {nft.location.longitude.toFixed(4)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Leaf className={`h-4 w-4 ${nft.status === 'alive' ? 'text-green-500' : 'text-red-500'}`} />
                            <span className={`text-sm ${nft.status === 'alive' ? 'text-green-500' : 'text-red-500'}`}>
                              Status: {nft.status.charAt(0).toUpperCase() + nft.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Sun className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">
                              Health Score: {nft.healthScore.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        {nft.status === 'alive' ? (
                          <Button 
                            variant="outline" 
                            className="w-full bg-green-100 text-green-800 hover:bg-green-200"
                            onClick={() => handleUnstake(nft.id)}
                            disabled={calculateTimeRemaining(nft) > 0}
                          >
                            {calculateTimeRemaining(nft) > 0 ? (
                              <Lock className="mr-2 h-4 w-4" />
                            ) : (
                              <Unlock className="mr-2 h-4 w-4" />
                            )}
                            {calculateTimeRemaining(nft) > 0 ? 'Locked' : 'Unstake'}
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            className="w-full bg-red-100 text-red-800 hover:bg-red-200"
                            onClick={() => handleClaimDeadTree(nft.id)}
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Claim Dead Tree
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
  )
}

export default Dashboard