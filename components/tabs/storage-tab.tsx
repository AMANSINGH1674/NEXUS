"use client"

import { useState } from "react"
import { Search, HardDrive, ImageIcon, FileText, Trash2, Download, Folder } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { StorageItem } from "@/types/chat"

// Mock storage data
const mockStorageItems: StorageItem[] = [
  {
    id: "1",
    name: "Emergency_Plan.pdf",
    type: "file",
    size: 2048000,
    date: new Date(Date.now() - 86400000),
    chatId: "group_1",
  },
  {
    id: "2",
    name: "Location_Screenshot.jpg",
    type: "image",
    size: 1536000,
    date: new Date(Date.now() - 172800000),
    chatId: "1",
  },
  {
    id: "3",
    name: "Chat with Alice Johnson",
    type: "chat",
    size: 512000,
    date: new Date(Date.now() - 259200000),
    chatId: "1",
  },
  {
    id: "4",
    name: "Group_Photo.jpg",
    type: "image",
    size: 3072000,
    date: new Date(Date.now() - 345600000),
    chatId: "group_1",
  },
  {
    id: "5",
    name: "Meeting_Notes.txt",
    type: "file",
    size: 256000,
    date: new Date(Date.now() - 432000000),
    chatId: "group_2",
  },
]

export default function StorageTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"all" | "images" | "files" | "chats">("all")

  const filteredItems = mockStorageItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" ||
      item.type === selectedCategory ||
      (selectedCategory === "chats" && item.type === "chat")
    return matchesSearch && matchesCategory
  })

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
    return mockStorageItems.reduce((total, item) => total + item.size, 0)
  }

  const getUsedStorage = () => {
    return getTotalStorage()
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
            { key: "all", label: "All", count: mockStorageItems.length },
            { key: "images", label: "Images", count: mockStorageItems.filter((i) => i.type === "image").length },
            { key: "files", label: "Files", count: mockStorageItems.filter((i) => i.type === "file").length },
            { key: "chats", label: "Chats", count: mockStorageItems.filter((i) => i.type === "chat").length },
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
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <HardDrive className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No files found</p>
            <p className="text-sm mt-1">Files will appear here as you chat</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="flex items-center p-4 hover:bg-gray-50 border-b border-gray-100">
              <div className="mr-3">{getIcon(item.type)}</div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <span>{formatFileSize(item.size)}</span>
                  <span>•</span>
                  <span>{formatDate(item.date)}</span>
                  {item.chatId && (
                    <>
                      <span>•</span>
                      <span>From chat</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
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
