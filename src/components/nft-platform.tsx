'use client'

import { useState, useEffect } from 'react'
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Label } from "~/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { toast } from "~/components/ui/use-toast"
import { Loader2, Upload, Coins, Lock, Unlock, Clock, Plus, Leaf, Map, BarChart2, PieChart, MapPin, AlertTriangle, Wallet, TreePine , Users, House , Sun, Moon, Bell, ArrowUpRight, ArrowDownRight } from "lucide-react"
import Notification from './notification'
import Dashboard from './Dashboard'
import Staking from './Staking'
import Marketplace from './Marketplace'
import type {NFT, ResourceData, Notification, StakedNFT} from '~/types/index'


const fetchRealTimeData = (): ResourceData => {
  return {
    totalLand: 1000,
    availableLand: Math.floor(Math.random() * 200) + 800,
    totalTrees: 5000,
    availableTrees: Math.floor(Math.random() * 1000) + 4000,
    carbonOffset: Math.floor(Math.random() * 1000) + 5000,
  }
}

//barchart



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

  const [resourceData, setResourceData] = useState<ResourceData>(fetchRealTimeData())
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [autoStakeEnabled, setAutoStakeEnabled] = useState(false)
  const [stakingMultiplier, setStakingMultiplier] = useState(1)

  const [ownedNFTs, setOwnedNFTs] = useState<NFT[]>([
    { id: 1, name: 'Kakamega Forest Plot', image: '/placeholder.svg?height=100&width=100', type: 'land', price: 100, description: 'A lush plot in the heart of Kakamega Forest', location: 'Kakamega, Kenya', communityImpact: 'Supports local beekeepers', rarity: 'uncommon' },
    { id: 2, name: 'Meru Oak', image: '/placeholder.svg?height=100&width=100', type: 'tree', price: 50, description: 'A majestic Meru Oak tree', location: 'Meru, Kenya', communityImpact: 'Provides shade for coffee plants', rarity: 'common' },
  ])

  const [stakedNFTs, setStakedNFTs] = useState<StakedNFT[]>([
    { 
      id: 1, 
      landNFT: { id: 5, name: "Mount Kenya Forest Plot", image: "/placeholder.svg?height=100&width=100", type: 'land', price: 150, description: 'A scenic plot near Mount Kenya', location: 'Mount Kenya, Kenya', communityImpact: 'Supports local wildlife conservation efforts', rarity: 'rare' },
      treeNFT: { id: 6, name: "Acacia Tree", image: "/placeholder.svg?height=100&width=100", type: 'tree', price: 70, description: 'An iconic Acacia tree', location: 'Maasai Mara, Kenya', communityImpact: 'Provides habitat for native bird species', rarity: 'uncommon' },
      stakedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), 
      stakingPeriod: 30, 
      rewardRate: 15,
      location: { latitude: -0.1015, longitude: 37.3088 },
      status: 'alive',
      healthScore: 85
    },
  ])

  const [availableNFTs, setAvailableNFTs] = useState<NFT[]>([
    { id: 7, name: 'Aberdare Forest Plot', image: '/placeholder.svg?height=100&width=100', type: 'land', price: 200, description: 'A misty plot in the Aberdare Forest', location: 'Aberdare, Kenya', communityImpact: 'Supports local water conservation projects', rarity: 'rare' },
    { id: 8, name: 'Baobab Tree', image: '/placeholder.svg?height=100&width=100', type: 'tree', price: 80, description: 'An ancient Baobab tree', location: 'Tsavo, Kenya', communityImpact: 'Provides food and medicine for local communities', rarity: 'legendary' },
    { id: 9, name: 'Coastal Mangrove Plot', image: '/placeholder.svg?height=100&width=100', type: 'land', price: 180, description: 'A vital mangrove ecosystem plot', location: 'Lamu, Kenya', communityImpact: 'Protects coastline and supports local fisheries', rarity: 'uncommon' },
    { id: 10, name: 'Bamboo Grove', image: '/placeholder.svg?height=100&width=100', type: 'tree', price: 90, description: 'A fast-growing bamboo grove', location: 'Kisumu, Kenya', communityImpact: 'Provides sustainable building material for local artisans', rarity: 'common' },
  ])

  useEffect(() => {
    if(window !== undefined) {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      setResourceData(fetchRealTimeData())
      updateStakedNFTs()
    }, 5000)
    return () => clearInterval(timer)
  }
  }, [])

  useEffect(() => {
    if(window !== undefined) {
    if (autoStakeEnabled) {
      const autoStakeTimer = setInterval(() => {
        const availableLandNFT = ownedNFTs.find(nft => nft.type === 'land')
        const availableTreeNFT = ownedNFTs.find(nft => nft.type === 'tree')
        if (availableLandNFT && availableTreeNFT) {
           handleStake(availableLandNFT, availableTreeNFT)
        }
      }, 60000) // Auto-stake every minute if enabled
      return () => clearInterval(autoStakeTimer)
    }
  }
  }, [autoStakeEnabled, ownedNFTs])

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
      addNotification('Wallet not connected. Please connect your wallet to mint NFTs.', 'warning')
      return
    }

    setIsMinting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    const newNFT: NFT = { 
      id: Math.max(...ownedNFTs.map(nft => nft.id), ...availableNFTs.map(nft => nft.id)) + 1, 
      name: nftName, 
      image: nftImage || '/placeholder.svg?height=100&width=100',
      type: Math.random() > 0.5 ? 'land' : 'tree',
      price: Math.floor(Math.random() * 100) + 50,
      description: nftDescription,
      location: 'Kenya',
      communityImpact: 'Supports local conservation efforts',
      rarity: Math.random() > 0.9 ? 'legendary' : Math.random() > 0.7 ? 'rare' : Math.random() > 0.4 ? 'uncommon' : 'common'
    }
    setOwnedNFTs([...ownedNFTs, newNFT])
    setIsMinting(false)
    setNftName('')
    setNftDescription('')
    setNftImage(null)
    addNotification(`Successfully minted ${newNFT.name}!`, 'success')
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

  const handleStake = async (landNFT: NFT, treeNFT: NFT) => {
    if (!isWalletConnected) {
      addNotification('Wallet not connected. Please connect your wallet to stake NFTs.', 'warning')
      return
    }

    const stakingFee = 50
    if (sudhiBalance < stakingFee) {
      addNotification(`Insufficient balance. You need ${stakingFee} SUDHI to stake.`, 'error')
      return
    }

    setIsStaking(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    const newStakedNFT: StakedNFT = {
      id: stakedNFTs.length + 1,
      landNFT: landNFT,
      treeNFT: treeNFT,
      stakedAt: new Date(),
      stakingPeriod: parseInt(stakingPeriod),
      rewardRate: 10 * stakingMultiplier,
      location: { latitude: -1.2921, longitude: 36.8219 },
      status: 'alive',
      healthScore: 100
    }
    setStakedNFTs([...stakedNFTs, newStakedNFT])
    setOwnedNFTs(ownedNFTs.filter(nft => nft.id !== landNFT.id && nft.id !== treeNFT.id))
    setSudhiBalance(sudhiBalance - stakingFee)
    setIsStaking(false)
    addNotification(`Successfully staked ${landNFT.name} and ${treeNFT.name}!`, 'success')
  }

  const handleUnstake = async (stakedNFTId: number) => {
    if (!isWalletConnected) {
      addNotification('Wallet not connected. Please connect your wallet to unstake NFTs.', 'warning')
      return
    }

    const nftToUnstake = stakedNFTs.find(nft => nft.id === stakedNFTId)
    if (nftToUnstake) {
      const earnedTokens = calculateRewards(nftToUnstake)
      setTokensClaimed(tokensClaimed + earnedTokens)
      setKv1Balance(kv1Balance + earnedTokens)
      setOwnedNFTs([...ownedNFTs, nftToUnstake.landNFT, nftToUnstake.treeNFT])
      setStakedNFTs(stakedNFTs.filter(nft => nft.id !== stakedNFTId))
      addNotification(`Successfully unstaked NFTs! You earned ${earnedTokens} KV1 tokens.`, 'success')
    }
  }

  const handleClaimDeadTree = async (stakedNFTId: number) => {
    if (!isWalletConnected) {
      addNotification('Wallet not connected. Please connect your wallet to claim dead tree NFTs.', 'warning')
      return
    }

    const deadTreeNFT = stakedNFTs.find(nft => nft.id === stakedNFTId && nft.status === 'dead')
    if (deadTreeNFT) {
      const earnedTokens = calculateRewards(deadTreeNFT)
      setTokensClaimed(tokensClaimed + earnedTokens)
      setKv1Balance(kv1Balance + earnedTokens)
      setOwnedNFTs([...ownedNFTs, deadTreeNFT.landNFT, deadTreeNFT.treeNFT])
      setStakedNFTs(stakedNFTs.filter(nft => nft.id !== stakedNFTId))
      addNotification(`Successfully claimed dead tree NFTs. You earned ${earnedTokens} KV1 tokens.`, 'success')
    }
  }

  const handleBuyNFT = (nft: NFT) => {
    if (!isWalletConnected) {
      addNotification('Wallet not connected. Please connect your wallet to buy NFTs.', 'warning')
      return
    }

    if (sudhiBalance >= nft.price) {
      setSudhiBalance(sudhiBalance - nft.price)
      setOwnedNFTs([...ownedNFTs, nft])
      setAvailableNFTs(availableNFTs.filter(availableNFT => availableNFT.id !== nft.id))
      addNotification(`Successfully purchased ${nft.name} for ${nft.price} SUDHI tokens.`, 'success')
    } else {
      addNotification(`Insufficient balance. You need ${nft.price} SUDHI to purchase this NFT.`, 'error')
    }
  }


  const calculateRewards = (nft: StakedNFT) => {
    const elapsedTime = currentTime.getTime() - nft.stakedAt.getTime()
    const elapsedDays = elapsedTime / (24 * 60 * 60 * 1000)
    return Math.floor(elapsedDays * nft.rewardRate * (nft.healthScore / 100))
  }

  const updateStakedNFTs = () => {
    setStakedNFTs(prevStakedNFTs => 
      prevStakedNFTs.map(nft => {
        const newHealthScore = Math.max(0, nft.healthScore - Math.random() * 5)
        const newStatus = newHealthScore > 0 ? 'alive' : 'dead'
        return { ...nft, healthScore: newHealthScore, status: newStatus }
      })
    )
  }

  const connectWallet = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsWalletConnected(true)
    addNotification('Wallet successfully connected!', 'success')
  }

  const addNotification = (message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const newNotification: Notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    }
    setNotifications(prev => [newNotification, ...prev].slice(0, 5))
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // In a real application, you would apply the dark mode styles here
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-green-900' : 'bg-gradient-to-b from-green-800 to-green-400'} p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-100">EcoNFT: Kenyan Forest Platform</h1>
          <div className="flex items-center space-x-4">
            <Button onClick={toggleDarkMode} variant="outline" size="icon" className="bg-green-600 hover:bg-green-700 text-white">
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button onClick={connectWallet} disabled={isWalletConnected} className="bg-green-600 hover:bg-green-700 text-white">
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
        </div>
        <div className="bg-green-100 bg-opacity-90 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-green-800">Your Green Portfolio</h2>
            <div className="flex space-x-4">
              <div className="text-right">
                <p className="text-sm text-green-600">KV1 Token</p>
                <p className="text-lg font-medium text-green-800">{kv1Balance}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600">SUDHI Token</p>
                <p className="text-lg font-medium text-green-800">{sudhiBalance}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600">Total Claimed</p>
                <p className="text-lg font-medium text-green-800">{tokensClaimed}</p>
              </div>
            </div>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-green-700">
            <TabsTrigger value="dashboard" className="text-green-100 data-[state=active]:bg-green-600">Dashboard</TabsTrigger>
            <TabsTrigger value="mint" className="text-green-100 data-[state=active]:bg-green-600">Mint</TabsTrigger>
            <TabsTrigger value="stake" className="text-green-100 data-[state=active]:bg-green-600">Stake</TabsTrigger>
            <TabsTrigger value="market" className="text-green-100 data-[state=active]:bg-green-600">Market</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
              {/* // Dashboard content */}
            <Dashboard stakedNFTs={stakedNFTs} calculateProgress={calculateProgress} calculateTimeRemaining={calculateTimeRemaining} formatTimeRemaining={formatTimeRemaining} handleUnstake={handleUnstake} handleClaimDeadTree={handleClaimDeadTree} calculateRewards={calculateRewards}/>
          </TabsContent>
          <TabsContent value="mint">
            <Card className="bg-green-50">
              <CardHeader>
                <CardTitle className="text-2xl text-green-800">Mint New NFT</CardTitle>
                <CardDescription className="text-green-600">
                  Create a new Land or Tree NFT to contribute to Kenyan forest conservation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleMint(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nft-name" className="text-green-700">NFT Name</Label>
                    <Input
                      id="nft-name"
                      placeholder="Enter NFT name"
                      value={nftName}
                      onChange={(e) => setNftName(e.target.value)}
                      className="border-green-300 focus:border-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nft-description" className="text-green-700">Description</Label>
                    <Textarea
                      id="nft-description"
                      placeholder="Describe your NFT"
                      value={nftDescription}
                      onChange={(e) => setNftDescription(e.target.value)}
                      className="border-green-300 focus:border-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nft-image" className="text-green-700">Upload Image</Label>
                    <Input
                      id="nft-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="border-green-300 focus:border-green-500"
                    />
                  </div>
                  {nftImage && (
                    <div className="mt-4">
                      <Label className="text-green-700">Preview</Label>
                      <img src={nftImage} alt="NFT Preview" className="mt-2 rounded-lg max-h-48 mx-auto" />
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white" 
                    disabled={isMinting || !isWalletConnected}
                  >
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
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="stake">
         <Staking ownedNFTs={ownedNFTs} isStaking={isStaking} stakingPeriod={stakingPeriod} stakingMultiplier={stakingMultiplier} autoStakeEnabled={autoStakeEnabled} setStakingPeriod={setStakingPeriod} setStakingMultiplier={setStakingMultiplier} setAutoStakeEnabled={setAutoStakeEnabled} isWalletConnected={isWalletConnected} handleStake={handleStake}/>
          </TabsContent>
          <TabsContent value="market">
                    <Marketplace  resourceData={resourceData} availableNFTs={availableNFTs} sudhiBalance={sudhiBalance} isWalletConnected={isWalletConnected} handleBuyNFT={handleBuyNFT}/>
          </TabsContent>
        </Tabs>
        <Notification notifications={notifications} />
      </div>
    </div>
  )
}