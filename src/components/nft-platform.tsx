'use client'

import { useState, useEffect } from 'react'
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Label } from "~/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Progress } from "~/components/ui/progress"
import { Loader2, Upload, Coins, Lock, Unlock, Clock, Plus, Leaf, Map, BarChart, PieChart, MapPin, AlertTriangle, Wallet } from "lucide-react"
import { toast } from "~/hooks/use-toast"

interface NFT {
  id: number
  name: string
  image: string
  type: 'land' | 'tree'
  price: number
}

interface StakedNFT {
  id: number
  landNFT: NFT
  treeNFT: NFT
  stakedAt: Date
  stakingPeriod: number // in days
  rewardRate: number // tokens per day
  location: {
    latitude: number
    longitude: number
  }
  status: 'alive' | 'dead'
}

interface ResourceData {
  totalLand: number
  availableLand: number
  totalTrees: number
  availableTrees: number
}

// Mock function to simulate fetching real-time data
const fetchRealTimeData = (): ResourceData => {
  return {
    totalLand: 1000,
    availableLand: Math.floor(Math.random() * 200) + 800,
    totalTrees: 5000,
    availableTrees: Math.floor(Math.random() * 1000) + 4000,
  }
}

const BarChartComponent = ({ data }: { data: ResourceData }) => {
  const maxValue = Math.max(data.totalLand, data.totalTrees)
  const landHeight = (data.availableLand / maxValue) * 100
  const treeHeight = (data.availableTrees / maxValue) * 100

  return (
    <div className="flex items-end h-64 space-x-4">
      <div className="flex flex-col items-center">
        <div className="w-16 bg-blue-500" style={{ height: `${landHeight}%` }}></div>
        <span className="mt-2 text-sm">Land</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-16 bg-green-500" style={{ height: `${treeHeight}%` }}></div>
        <span className="mt-2 text-sm">Trees</span>
      </div>
    </div>
  )
}

const PieChartComponent = ({ data }: { data: ResourceData }) => {
  const landPercentage = (data.availableLand / data.totalLand) * 100
  const treePercentage = (data.availableTrees / data.totalTrees) * 100

  return (
    <div className="flex space-x-4">
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div 
            className="absolute inset-0 border-4 border-blue-500 rounded-full"
            style={{ 
              clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((landPercentage / 100) * Math.PI * 2)}% ${50 - 50 * Math.sin((landPercentage / 100) * Math.PI * 2)}%, 50% 50%)`
            }}
          ></div>
        </div>
        <span className="mt-2 text-sm">Land: {landPercentage.toFixed(1)}%</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div 
            className="absolute inset-0 border-4 border-green-500 rounded-full"
            style={{ 
              clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((treePercentage / 100) * Math.PI * 2)}% ${50 - 50 * Math.sin((treePercentage / 100) * Math.PI * 2)}%, 50% 50%)`
            }}
          ></div>
        </div>
        <span className="mt-2 text-sm">Trees: {treePercentage.toFixed(1)}%</span>
      </div>
    </div>
  )
}

export function NftPlatform() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [nftName, setNftName] = useState('')
  const [nftDescription, setNftDescription] = useState('')
  const [nftImage, setNftImage] = useState<string | null>(null)
  const [isMinting, setIsMinting] = useState(false)
  const [isStaking, setIsStaking] = useState(false)
  const [stakingPeriod, setStakingPeriod] = useState('30')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [tokensClaimed, setTokensClaimed] = useState(500)
  const [kv1Balance, setKv1Balance] = useState(1000)
  const [sudhiBalance, setSudhiBalance] = useState(750)
  const [selectedLandNFT, setSelectedLandNFT] = useState<NFT | null>(null)
  const [selectedTreeNFT, setSelectedTreeNFT] = useState<NFT | null>(null)
  const [resourceData, setResourceData] = useState<ResourceData>(fetchRealTimeData())
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  const [ownedNFTs, setOwnedNFTs] = useState<NFT[]>([
    { id: 1, name: 'Land Plot #1', image: '/placeholder.svg?height=100&width=100', type: 'land', price: 100 },
    { id: 2, name: 'Oak Tree #42', image: '/placeholder.svg?height=100&width=100', type: 'tree', price: 50 },
    { id: 3, name: 'Land Plot #2', image: '/placeholder.svg?height=100&width=100', type: 'land', price: 120 },
    { id: 4, name: 'Pine Tree #7', image: '/placeholder.svg?height=100&width=100', type: 'tree', price: 60 },
  ])

  const [stakedNFTs, setStakedNFTs] = useState<StakedNFT[]>([
    { 
      id: 1, 
      landNFT: { id: 5, name: "Land Plot #3", image: "/placeholder.svg?height=100&width=100", type: 'land', price: 150 },
      treeNFT: { id: 6, name: "Maple Tree #13", image: "/placeholder.svg?height=100&width=100", type: 'tree', price: 70 },
      stakedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), 
      stakingPeriod: 30, 
      rewardRate: 15,
      location: { latitude: 40.7128, longitude: -74.0060 },
      status: 'alive'
    },
  ])

  const [availableNFTs, setAvailableNFTs] = useState<NFT[]>([
    { id: 7, name: 'Land Plot #4', image: '/placeholder.svg?height=100&width=100', type: 'land', price: 200 },
    { id: 8, name: 'Birch Tree #22', image: '/placeholder.svg?height=100&width=100', type: 'tree', price: 80 },
    { id: 9, name: 'Land Plot #5', image: '/placeholder.svg?height=100&width=100', type: 'land', price: 180 },
    { id: 10, name: 'Willow Tree #9', image: '/placeholder.svg?height=100&width=100', type: 'tree', price: 90 },
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      setResourceData(fetchRealTimeData())
    }, 5000) // Update every 5 seconds
    return () => clearInterval(timer)
  }, [])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNftImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMint = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint NFTs.",
        variant: "destructive",
      })
      return
    }

    setIsMinting(true)
    // Simulating minting process
    await new Promise(resolve => setTimeout(resolve, 2000))
    const newNFT: NFT = { 
      id: Math.max(...ownedNFTs.map(nft => nft.id), ...availableNFTs.map(nft => nft.id)) + 1, 
      name: nftName, 
      image: nftImage || '/placeholder.svg?height=100&width=100',
      type: Math.random() > 0.5 ? 'land' : 'tree',
      price: Math.floor(Math.random() * 100) + 50
    }
    setOwnedNFTs([...ownedNFTs, newNFT])
    setIsMinting(false)
    setNftName('')
    setNftDescription('')
    setNftImage(null)
    toast({
      title: "NFT Minted",
      description: "Your NFT has been successfully minted!",
    })
  }

  const handleStake = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to stake NFTs.",
        variant: "destructive",
      })
      return
    }

    if (!selectedLandNFT || !selectedTreeNFT) {
      toast({
        title: "Selection Required",
        description: "Please select both a land NFT and a tree NFT to stake.",
        variant: "destructive",
      })
      return
    }

    const stakingFee = 50 // Example fixed fee in SUDHI
    if (sudhiBalance < stakingFee) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${stakingFee} SUDHI to stake. Current balance: ${sudhiBalance} SUDHI`,
        variant: "destructive",
      })
      return
    }

    setIsStaking(true)
    // Simulating staking process
    await new Promise(resolve => setTimeout(resolve, 2000))
    const newStakedNFT: StakedNFT = {
      id: stakedNFTs.length + 1,
      landNFT: selectedLandNFT,
      treeNFT: selectedTreeNFT,
      stakedAt: new Date(),
      stakingPeriod: parseInt(stakingPeriod),
      rewardRate: 10, // Default reward rate
      location: { latitude: 40.7128, longitude: -74.0060 }, // Example location
      status: 'alive'
    }
    setStakedNFTs([...stakedNFTs, newStakedNFT])
    setOwnedNFTs(ownedNFTs.filter(nft => nft.id !== selectedLandNFT.id && nft.id !== selectedTreeNFT.id))
    setSudhiBalance(sudhiBalance - stakingFee)
    setSelectedLandNFT(null)
    setSelectedTreeNFT(null)
    setIsStaking(false)
    toast({
      title: "NFTs Staked",
      description: `NFTs staked successfully! ${stakingFee} SUDHI has been added to the organization welfare pool.`,
    })
  }

  const handleUnstake = async (stakedNFTId: number) => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to unstake NFTs.",
        variant: "destructive",
      })
      return
    }

    const nftToUnstake = stakedNFTs.find(nft => nft.id === stakedNFTId)
    if (nftToUnstake) {
      const earnedTokens = calculateRewards(nftToUnstake)
      setTokensClaimed(tokensClaimed + earnedTokens)
      setKv1Balance(kv1Balance + earnedTokens)
      setOwnedNFTs([...ownedNFTs, nftToUnstake.landNFT, nftToUnstake.treeNFT])
      setStakedNFTs(stakedNFTs.filter(nft => nft.id !== stakedNFTId))
      toast({
        title: "NFTs Unstaked",
        description: `NFTs unstaked successfully! You earned ${earnedTokens} KV1 tokens.`,
      })
    }
  }

  const handleClaimDeadTree = async (stakedNFTId: number) => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to claim dead tree NFTs.",
        variant: "destructive",
      })
      return
    }

    const deadTreeNFT = stakedNFTs.find(nft => nft.id === stakedNFTId && nft.status === 'dead')
    if (deadTreeNFT) {
      const earnedTokens = calculateRewards(deadTreeNFT)
      setTokensClaimed(tokensClaimed + earnedTokens)
      setKv1Balance(kv1Balance + earnedTokens)
      setOwn
edNFTs([...ownedNFTs, deadTreeNFT.landNFT, deadTreeNFT.treeNFT])
      setStakedNFTs(stakedNFTs.filter(nft => nft.id !== stakedNFTId))
      toast({
        title: "Dead Tree Claimed",
        description: `You've successfully claimed the land and tree NFTs. You earned ${earnedTokens} KV1 tokens.`,
      })
    }
  }

  const handleBuyNFT = (nft: NFT) => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to buy NFTs.",
        variant: "destructive",
      })
      return
    }

    if (sudhiBalance >= nft.price) {
      setSudhiBalance(sudhiBalance - nft.price)
      setOwnedNFTs([...ownedNFTs, nft])
      setAvailableNFTs(availableNFTs.filter(availableNFT => availableNFT.id !== nft.id))
      toast({
        title: "NFT Purchased",
        description: `Successfully purchased ${nft.name} for ${nft.price} SUDHI tokens.`,
      })
    } else {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough SUDHI tokens to purchase this NFT.",
        variant: "destructive",
      })
    }
  }

  const calculateTimeRemaining = (nft: StakedNFT) => {
    const endTime = new Date(nft.stakedAt.getTime() + nft.stakingPeriod * 24 * 60 * 60 * 1000)
    const timeRemaining = endTime.getTime() - currentTime.getTime()
    return Math.max(0, timeRemaining)
  }

  const formatTimeRemaining = (timeRemaining: number) => {
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
    return `${days}d ${hours}h ${minutes}m`
  }

  const calculateProgress = (nft: StakedNFT) => {
    const totalStakingTime = nft.stakingPeriod * 24 * 60 * 60 * 1000
    const elapsedTime = currentTime.getTime() - nft.stakedAt.getTime()
    return Math.min(100, (elapsedTime / totalStakingTime) * 100)
  }

  const calculateRewards = (nft: StakedNFT) => {
    const elapsedTime = currentTime.getTime() - nft.stakedAt.getTime()
    const elapsedDays = elapsedTime / (24 * 60 * 60 * 1000)
    return Math.floor(elapsedDays * nft.rewardRate)
  }

  const connectWallet = async () => {
    // Simulating wallet connection process
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsWalletConnected(true)
    toast({
      title: "Wallet Connected",
      description: "Your wallet has been successfully connected.",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-500 to-indigo-500 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">NFT Platform</h1>
          <Button onClick={connectWallet} disabled={isWalletConnected}>
            {isWalletConnected ? (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connected
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </>
            )}
          </Button>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Your Balances</h2>
            <div className="flex space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">KV1 Token</p>
                <p className="text-lg font-medium">{kv1Balance}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">SUDHI Token</p>
                <p className="text-lg font-medium">{sudhiBalance}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Claimed</p>
                <p className="text-lg font-medium">{tokensClaimed}</p>
              </div>
            </div>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="mint">Mint</TabsTrigger>
            <TabsTrigger value="stake">Stake</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
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
                        <CardTitle>{nft.landNFT.name} + {nft.treeNFT.name}</CardTitle>
                        <CardDescription>Staked {nft.stakedAt.toLocaleDateString()}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Staking Progress</span>
                        <span className="text-sm font-medium">{calculateProgress(nft).toFixed(0)}%</span>
                      </div>
                      <Progress value={calculateProgress(nft)} className="w-full" />
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatTimeRemaining(calculateTimeRemaining(nft))} remaining
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Coins className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {calculateRewards(nft)} KV1 tokens earned
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Location: {nft.location.latitude.toFixed(4)}, {nft.location.longitude.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Leaf className={`h-4 w-4 ${nft.status === 'alive' ? 'text-green-500' : 'text-red-500'}`} />
                        <span className={`text-sm ${nft.status === 'alive' ? 'text-green-500' : 'text-red-500'}`}>
                          Status: {nft.status.charAt(0).toUpperCase() + nft.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {nft.status === 'alive' ? (
                      <Button 
                        variant="outline" 
                        className="w-full" 
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
                        className="w-full" 
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
          </TabsContent>
          <TabsContent value="mint">
            <Card>
              <CardHeader>
                <CardTitle>Create Your NFT</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nft-name">NFT Name</Label>
                  <Input
                    id="nft-name"
                    placeholder="Enter NFT name"
                    value={nftName}
                    onChange={(e) => setNftName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nft-description">Description</Label>
                  <Textarea
                    id="nft-description"
                    placeholder="Describe your NFT"
                    value={nftDescription}
                    onChange={(e) => setNftDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nft-image">Upload Image</Label>
                  <Input
                    id="nft-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                {nftImage && (
                  <div className="mt-4">
                    <Label>Preview</Label>
                    <img src={nftImage} alt="NFT Preview" className="mt-2 rounded-lg max-h-48 mx-auto" />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleMint} disabled={isMinting || !isWalletConnected}>
                  {isMinting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Mint NFT
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="stake">
            <Card>
              <CardHeader>
                <CardTitle>Stake Your NFTs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Select Land NFT</h3>
                    {ownedNFTs.filter(nft => nft.type === 'land').map((nft) => (
                      <div key={nft.id} className="flex items-center justify-between p-2 border rounded mb-2">
                        <div className="flex items-center">
                          <img src={nft.image} alt={nft.name} className="w-10 h-10 rounded mr-2" />
                          <span>{nft.name}</span>
                        </div>
                        <Button 
                          variant={selectedLandNFT?.id === nft.id ? "secondary" : "outline"}
                          onClick={() => setSelectedLandNFT(nft)}
                        >
                          <Map className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Select Tree NFT</h3>
                    {ownedNFTs.filter(nft => nft.type === 'tree').map((nft) => (
                      <div key={nft.id} className="flex items-center justify-between p-2 border rounded mb-2">
                        <div className="flex items-center">
                          <img src={nft.image} alt={nft.name} className="w-10 h-10 rounded mr-2" />
                          <span>{nft.name}</span>
                        </div>
                        <Button 
                          variant={selectedTreeNFT?.id === nft.id ? "secondary" : "outline"}
                          onClick={() => setSelectedTreeNFT(nft)}
                        >
                          <Leaf className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="staking-period">Staking Period</Label>
                  <Select value={stakingPeriod} onValueChange={setStakingPeriod}>
                    <SelectTrigger id="staking-period">
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
                  <p className="text-sm text-muted-foreground">Staking Fee: 50 SUDHI</p>
                  <p className="text-sm text-muted-foreground">This fee goes to the organization welfare pool.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleStake} 
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
          </TabsContent>
          <TabsContent value="market">
            <Card>
              <CardHeader>
                <CardTitle>NFT Market</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Resource Availability</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Available Land:</span>
                        <span>{resourceData.availableLand} / {resourceData.totalLand}</span>
                      </div>
                      <Progress value={(resourceData.availableLand / resourceData.totalLand) * 100} className="w-full" />
                      <div className="flex justify-between">
                        <span>Available Trees:</span>
                        <span>{resourceData.availableTrees} / {resourceData.totalTrees}</span>
                      </div>
                      <Progress value={(resourceData.availableTrees / resourceData.totalTrees) * 100} className="w-full" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Resource Charts</h3>
                    <div className="flex space-x-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Bar Chart</h4>
                        <BarChartComponent data={resourceData} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Pie Chart</h4>
                        <PieChartComponent data={resourceData} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Land NFTs</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {availableNFTs.filter(nft => nft.type === 'land').map((nft) => (
                      <div key={nft.id} className="flex items-center justify-between p-2 border rounded mb-2">
                        <div className="flex items-center">
                          <img src={nft.image} alt={nft.name} className="w-10 h-10 rounded mr-2" />
                          <div>
                            <span className="font-medium">{nft.name}</span>
                            <p className="text-sm text-muted-foreground">Land NFT</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{nft.price} SUDHI</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleBuyNFT(nft)}
                            disabled={sudhiBalance < nft.price || !isWalletConnected}
                          >
                            Buy
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Tree NFTs</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {availableNFTs.filter(nft => nft.type === 'tree').map((nft) => (
                      <div key={nft.id} className="flex items-center justify-between p-2 border rounded mb-2">
                        <div className="flex items-center">
                          <img src={nft.image} alt={nft.name} className="w-10 h-10 rounded mr-2" />
                          <div>
                            <span className="font-medium">{nft.name}</span>
                            <p className="text-sm text-muted-foreground">Tree NFT</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{nft.price} SUDHI</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleBuyNFT(nft)}
                            disabled={sudhiBalance < nft.price || !isWalletConnected}
                          >
                            Buy
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}