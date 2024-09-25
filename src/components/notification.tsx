import { AlertTriangle, ArrowDownRight, ArrowUpRight, Bell } from 'lucide-react'
import React from 'react'
import type { Notification} from '~/types/index'
function Notification({notifications}: {notifications: Notification[]}) {
  return (
<div className="mt-6">
<h3 className="text-xl font-semibold mb-4 text-green-100">Recent Notifications</h3>
<div className="space-y-2">
  {notifications.map((notification) => (
    <div key={notification.id} className={`p-3 rounded-md ${
      notification.type === 'success' ? 'bg-green-100 text-green-800' :
      notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
      notification.type === 'error' ? 'bg-red-100 text-red-800' :
      'bg-blue-100 text-blue-800'
    }`}>
      <div className="flex items-center">
        {notification.type === 'success' && <ArrowUpRight className="h-4 w-4 mr-2" />}
        {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 mr-2" />}
        {notification.type === 'error' && <ArrowDownRight className="h-4 w-4 mr-2" />}
        {notification.type === 'info' && <Bell className="h-4 w-4 mr-2" />}
        <span>{notification.message}</span>
      </div>
      <span className="text-xs mt-1 block">{notification.timestamp.toLocaleTimeString()}</span>
    </div>
  ))}
</div>
</div>
  )
}

export default Notification;

