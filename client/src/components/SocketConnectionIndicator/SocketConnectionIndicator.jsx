import { useHelperRequest } from '../../context/HelperRequestContext'

export default function SocketConnectionIndicator() {
  const { connectionStatus } = useHelperRequest()

  if (connectionStatus === 'connected') {
    return (
      <div className="fixed bottom-4 left-4 bg-green-500 text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm z-40">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        Connected
      </div>
    )
  }

  if (connectionStatus === 'error') {
    return (
      <div className="fixed bottom-4 left-4 bg-red-500 text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm z-40">
        <div className="w-2 h-2 bg-white rounded-full"></div>
        Connection Error
      </div>
    )
  }

  if (connectionStatus === 'disconnected') {
    return (
      <div className="fixed bottom-4 left-4 bg-gray-500 text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm z-40">
        <div className="w-2 h-2 bg-white rounded-full"></div>
        Disconnected
      </div>
    )
  }

  return null
}
