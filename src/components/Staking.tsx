import React, { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Leaf, Loader2, Lock, MapPin } from 'lucide-react'
import { Label } from '@radix-ui/react-label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@radix-ui/react-select'
import { Slider } from '@radix-ui/react-slider'
import { Switch } from '@radix-ui/react-switch'
import type {NFT} from '~/types/index'
 interface Props {
    ownedNFTs: NFT[]
    isStaking: boolean
    stakingPeriod: string
    autoStakeEnabled: boolean
    stakingMultiplier: number
    setStakingMultiplier: (value: number) => void
    setAutoStakeEnabled: (value: boolean) => void
    setStakingPeriod: (value: string) => void
    isWalletConnected: boolean
    handleStake: (landNFT: NFT, treeNFT: NFT) => void
}

function Staking({ownedNFTs, isStaking,stakingPeriod,stakingMultiplier,autoStakeEnabled,setStakingPeriod, setStakingMultiplier,setAutoStakeEnabled,isWalletConnected, handleStake}: Props) {
    const [selectedLandNFT, setSelectedLandNFT] = useState<NFT | null>(null)
const [selectedTreeNFT, setSelectedTreeNFT] = useState<NFT | null>(null)
  return (
    <Card className="bg-green-50">
    <CardHeader>
      <CardTitle className="text-2xl text-green-800">Stake Your NFTs</CardTitle>
      <CardDescription className="text-green-600">
        Stake your Land and Tree NFTs to earn rewards and support Kenyan forests
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-green-800">Select Land NFT</h3>
          {ownedNFTs.filter(nft => nft.type === 'land').map((nft) => (
            <div key={nft.id} className="flex items-center justify-between p-2 border border-green-200 rounded mb-2">
              <div className="flex items-center">
                {/* <Image src={nft.image} alt={nft.name} width={40} height={40} className="rounded mr-2" /> */}
                <Image src={nft.image} alt={nft.name} width={40} height={40} className="rounded mr-2" />
                <span className="text-green-700">{nft.name}</span>
              </div>
              <Button 
                variant={selectedLandNFT?.id === nft.id ? "secondary" : "outline"}
                onClick={() => setSelectedLandNFT(nft)}
                className="bg-green-100 text-green-800 hover:bg-green-200"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-green-800">Select Tree NFT</h3>
          {ownedNFTs.filter(nft => nft.type === 'tree').map((nft) => (
            <div key={nft.id} className="flex items-center justify-between p-2 border border-green-200 rounded mb-2">
              <div className="flex items-center">
                <Image src={nft.image} alt={nft.name} width={40} height={40} className="rounded mr-2" />
                <span className="text-green-700">{nft.name}</span>
              </div>
              <Button 
                variant={selectedTreeNFT?.id === nft.id ? "secondary" : "outline"}
                onClick={() => setSelectedTreeNFT(nft)}
                className="bg-green-100 text-green-800 hover:bg-green-200"
              >
                <Leaf className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <Label htmlFor="staking-period" className="text-green-700">Staking Period</Label>
        <Select value={stakingPeriod} onValueChange={setStakingPeriod}>
          <SelectTrigger id="staking-period" className="border-green-300 focus:border-green-500">
            <SelectValue placeholder="Select staking period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 Days</SelectItem>
            <SelectItem value="60">60 Days</SelectItem>
            <SelectItem value="90">90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4">
        <Label htmlFor="staking-multiplier" className="text-green-700">Staking Multiplier</Label>
        <Slider
          id="staking-multiplier"
          min={1}
          max={5}
          step={0.1}
          value={[stakingMultiplier]}
          onValueChange={(value: number[]) => setStakingMultiplier(value[0] ?? stakingMultiplier)}
          className="mt-2"
        />
        <p className="text-sm text-green-600 mt-1">Current multiplier: {stakingMultiplier.toFixed(1)}x</p>
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <Switch
          id="auto-stake"
          checked={autoStakeEnabled}
          onCheckedChange={setAutoStakeEnabled}
        />
        <Label htmlFor="auto-stake" className="text-green-700">Enable Auto-Staking</Label>
      </div>
      <div className="mt-4">
        <p className="text-sm text-green-600">Staking Fee: 50 SUDHI</p>
        <p className="text-sm text-green-600">This fee goes to the organization welfare pool.</p>
      </div>
    </CardContent>
    <CardFooter>
      <Button 
        className="w-full bg-green-600 hover:bg-green-700 text-white" 
        onClick={() => selectedLandNFT && selectedTreeNFT && handleStake(selectedLandNFT, selectedTreeNFT)} 
        disabled={isStaking || !selectedLandNFT || !selectedTreeNFT || !isWalletConnected}
      >
        {isStaking ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Staking...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Stake NFTs
          </>
        )}
      </Button>
    </CardFooter>
  </Card>
  )
}

export default Staking;