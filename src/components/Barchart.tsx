const BarChartComponent = ({ data }: { data: ResourceData }) => {
    const maxValue = Math.max(data.totalLand, data.totalTrees, data.carbonOffset)
    const landHeight = (data.availableLand / maxValue) * 100
    const treeHeight = (data.availableTrees / maxValue) * 100
    const carbonHeight = (data.carbonOffset / maxValue) * 100
  
    return (
      <div className="flex items-end h-64 space-x-4">
        <div className="flex flex-col items-center">
          <div className="w-16 bg-green-300" style={{ height: `${landHeight}%` }}></div>
          <span className="mt-2 text-sm text-green-800">Land</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 bg-green-500" style={{ height: `${treeHeight}%` }}></div>
          <span className="mt-2 text-sm text-green-800">Trees</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 bg-green-700" style={{ height: `${carbonHeight}%` }}></div>
          <span className="mt-2 text-sm text-green-800">Carbon Offset</span>
        </div>
      </div>
    )
  }
  export default BarChartComponent;