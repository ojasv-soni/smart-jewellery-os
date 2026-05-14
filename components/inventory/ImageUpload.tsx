'use client'

import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'

interface ImageUploadProps {
  onUpload: (file: File) => void
  onCapture?: (file: File) => void
  preview?: string
  onRemove?: () => void
}

export function ImageUpload({ onUpload, onCapture, preview, onRemove }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onUpload(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (file) onUpload(file)
  }

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (file && onCapture) onCapture(file)
  }

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Product" className="w-full h-64 object-cover rounded-lg" />
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-2 rounded-lg hover:bg-destructive/90"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
              isDragging ? 'border-primary bg-primary/10' : 'border-border'
            }`}
          >
            <Upload className="mx-auto mb-3 text-primary" size={28} />
            <p className="text-foreground font-semibold">Drag and drop image here</p>
            <p className="text-muted-foreground text-sm">or</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition"
            >
              Select Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Camera Capture */}
          <div className="border border-border rounded-lg p-4">
            <p className="text-foreground font-semibold mb-2">Or capture from camera</p>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full bg-secondary text-secondary-foreground py-2 px-4 rounded-lg hover:bg-secondary/90 transition"
            >
              📷 Open Camera
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCapture}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  )
}