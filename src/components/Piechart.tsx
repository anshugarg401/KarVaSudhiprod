const PieChartComponent = ({ data }: { data: ResourceData }) => {
    const total = data.totalLand + data.totalTrees + data.carbonOffset
    const landPercentage = (data.availableLand / total) * 100
    const treePercentage = (data.availableTrees / total) * 100
    const carbonPercentage = (data.carbonOffset / total) * 100
  
    return (
      <div className="flex space-x-4">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
            <div 
              className="absolute inset-0 border-4 border-green-400 rounded-full"
              style={{ 
                clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((landPercentage / 100) * Math.PI * 2)}% ${50 - 50 * Math.sin((landPercentage / 100) * Math.PI * 2)}%, 50% 50%)`
              }}
            ></div>
          </div>
          <span className="mt-2 text-sm text-green-800">Land: {landPercentage.toFixed(1)}%</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
            <div 
              className="absolute inset-0 border-4 border-green-600 rounded-full"
              style={{ 
                clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((treePercentage / 100) * Math.PI * 2)}% ${50 - 50 * Math.sin((treePercentage / 100) * Math.PI * 2)}%, 50% 50%)`
              }}
            ></div>
          </div>
          <span className="mt-2 text-sm text-green-800">Trees: {treePercentage.toFixed(1)}%</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
            <div 
              className="absolute inset-0 border-4 border-green-800 rounded-full"
              style={{ 
                clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((carbonPercentage / 100) * Math.PI * 2)}% ${50 - 50 * Math.sin((carbonPercentage / 100) * Math.PI * 2)}%, 50% 50%)`
              }}
            ></div>
          </div>
          <span className="mt-2 text-sm text-green-800">Carbon Offset: {carbonPercentage.toFixed(1)}%</span>
        </div>
      </div>
    )
  }
  export default PieChartComponent;