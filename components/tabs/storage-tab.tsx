"use client"

import { useState } from "react"
import { Search, HardDrive, ImageIcon, FileText, Trash2, Download, Folder } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { StorageItem } from "@/types/chat"

export default function StorageTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"all" | "images" | "files" | "chats">("all")

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString()
  }

  const getTotalStorage = () => {
    // This function needs to be implemented to return the total storage
    return 0
  }

  const getUsedStorage = () => {
    // This function needs to be implemented to return the used storage
    return 0
  }

  const getStoragePercentage = () => {
    const maxStorage = 1024 * 1024 * 1024 // 1GB
    return (getUsedStorage() / maxStorage) * 100
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-5 w-5 text-blue-500" />
      case "file":
        return <FileText className="h-5 w-5 text-green-500" />
      case "chat":
        return <Folder className="h-5 w-5 text-purple-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Storage</h1>
          <Button variant="ghost" size="sm" className="text-white hover:bg-green-700">
            <HardDrive className="h-5 w-5" />
          </Button>
        </div>

        <div className="text-sm opacity-90">
          <span>{formatFileSize(getUsedStorage())} used</span>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Local Storage</span>
          <span className="text-sm text-gray-500">{getStoragePercentage().toFixed(1)}% used</span>
        </div>
        <Progress value={getStoragePercentage()} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatFileSize(getUsedStorage())}</span>
          <span>1 GB</span>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="p-4 border-b">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: "all", label: "All", count: 0 },
            { key: "images", label: "Images", count: 0 },
            { key: "files", label: "Files", count: 0 },
            { key: "chats", label: "Chats", count: 0 },
          ].map((category) => (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.key as any)}
              className="whitespace-nowrap"
            >
              {category.label} ({category.count})
            </Button>
          ))}
        </div>
      </div>

      {/* Storage Items */}
      <div className="flex-1 overflow-y-auto">
        {/* This section needs to be implemented to display storage items */}
        <div className="p-8 text-center text-gray-500">
          <HardDrive className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No files found</p>
          <p className="text-sm mt-1">Files will appear here as you chat</p>
        </div>
      </div>

      {/* Clear Storage Button */}
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent">
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All Storage
        </Button>
      </div>
    </div>
  )
}
