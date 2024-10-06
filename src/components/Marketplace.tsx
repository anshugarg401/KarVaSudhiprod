import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Progress } from '@radix-ui/react-progress'
import PieChartComponent from './Piechart'
import { Button } from './ui/button'
import { House,MapPin,TreePine, Users } from 'lucide-react'
import Image from 'next/image'
import type {NFT, ResourceData} from '~/types/index'
interface Props {
    handleBuyNFT: (nft: NFT) => void
    resourceData: ResourceData
    availableNFTs: NFT[]
    isWalletConnected: boolean
    sudhiBalance: number
}
function Marketplace({resourceData, handleBuyNFT,availableNFTs,isWalletConnected,sudhiBalance}: Props) {
  return (
    <Card className="bg-green-50">
    <CardHeader>
      <CardTitle className="text-2xl text-green-800">Kenyan Forest NFT Market</CardTitle>
      <CardDescription className="text-green-600">
        Invest in the future of Kenya&apos;s forests and support local communities
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-800">Resource Availability</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-green-700">
              <span>Available Land:</span>
              <span>{resourceData.availableLand} / {resourceData.totalLand}</span>
            </div>
            <Progress value={(resourceData.availableLand / resourceData.totalLand) * 100} className="w-full bg-green-200" />
            <div className="flex justify-between text-green-700">
              <span>Available Trees:</span>
              <span>{resourceData.availableTrees} / {resourceData.totalTrees}</span>
            </div>
            <Progress value={(resourceData.availableTrees / resourceData.totalTrees) * 100} className="w-full bg-green-200" />
            <div className="flex justify-between text-green-700">
              <span>Carbon Offset:</span>
              <span>{resourceData.carbonOffset} tons</span>
            </div>
            <Progress value={(resourceData.carbonOffset / 10000) * 100} className="w-full bg-green-200"  />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-800">Resource Charts</h3>
          <div className="flex space-x-4">
            {/* <div>
              <h4 className="text-sm font-medium mb-2 text-green-700">Conservation Progress</h4>
              <BarChartComponent data={resourceData} />
            </div> */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-green-700">Resource Distribution</h4>
              <PieChartComponent data={resourceData} />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-green-800">Available NFTs</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {availableNFTs.map((nft) => (
            <Card key={nft.id} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">{nft.name}</CardTitle>
                <CardDescription className="text-green-700">{nft.type === 'land' ? 'Land NFT' : 'Tree NFT'}</CardDescription>
              </CardHeader>
              <CardContent>
                  {/* <Image src={nft.image} alt={nft.name} layout="responsive" width={16} height={9} className="object-cover rounded-md" /> */}
                  <Image src={nft.image} alt={nft.name} layout="responsive" width={16} height={9} className="object-cover rounded-md" />
                <p className="text-sm text-gray-600 mb-2">{nft.description}</p>
                <div className="flex items-center text-sm text-green-700 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {nft.location}
                </div>
                <div className="flex items-center text-sm text-green-700 mb-4">
                  <Users className="h-4 w-4 mr-1" />
                  {nft.communityImpact}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-green-800">{nft.price} SUDHI</span>
                  <div className="flex items-center">
                    <span className={`text-sm mr-2 ${
                      nft.rarity === 'legendary' ? 'text-yellow-500' :
                      nft.rarity === 'rare' ? 'text-purple-500' :
                      nft.rarity === 'uncommon' ? 'text-blue-500' :
                      'text-gray-500'
                    }`}>
                      {nft.rarity.charAt(0).toUpperCase() + nft.rarity.slice(1)}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleBuyNFT(nft)}
                      disabled={sudhiBalance < nft.price || !isWalletConnected}
                      className="bg-green-500 text-white hover:bg-green-600"
                    >
                      {nft.type === 'land' ? 
                     ( <House  className="mr-2 h-4 w-4" />) : (<TreePine className="mr-2 h-4 w-4" />)}
                      Buy NFT
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
  )
}

export default Marketplace