"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Palette,
  Type,
  ImageIcon,
  Shapes,
  Upload,
  Download,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Square,
  Circle,
  Triangle,
} from "lucide-react"
import Image from "next/image"

export default function DesignStudioPage() {
  const [selectedProduct, setSelectedProduct] = useState("t-shirt")
  const [selectedColor, setSelectedColor] = useState("#ffffff")
  const [canvasZoom, setCanvasZoom] = useState([100])
  const [activeTab, setActiveTab] = useState("text")

  const products = [
    {
      id: "t-shirt",
      name: "T-Shirt",
      image: "/placeholder.svg?height=400&width=400",
      price: 599,
    },
    {
      id: "hoodie",
      name: "Hoodie",
      image: "/placeholder.svg?height=400&width=400",
      price: 1299,
    },
    {
      id: "tote-bag",
      name: "Tote Bag",
      image: "/placeholder.svg?height=400&width=400",
      price: 399,
    },
  ]

  const colors = [
    "#ffffff",
    "#000000",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#ffa500",
    "#800080",
  ]

  const fonts = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "Comic Sans MS",
    "Impact",
    "Trebuchet MS",
    "Courier New",
  ]

  const templates = [
    {
      id: 1,
      name: "Vintage Logo",
      image: "/placeholder.svg?height=200&width=200",
      category: "Logo",
    },
    {
      id: 2,
      name: "Modern Typography",
      image: "/placeholder.svg?height=200&width=200",
      category: "Text",
    },
    {
      id: 3,
      name: "Abstract Art",
      image: "/placeholder.svg?height=200&width=200",
      category: "Art",
    },
    {
      id: 4,
      name: "Nature Pattern",
      image: "/placeholder.svg?height=200&width=200",
      category: "Pattern",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Design Studio</h1>
          <p className="text-gray-600">Create your custom designs with our powerful editor</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Tools */}
          <div className="lg:col-span-1 space-y-6">
            {/* Product Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Choose Product</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedProduct === product.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedProduct(product.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        width={50}
                        height={50}
                        className="rounded"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">₹{product.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Design Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Design Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="text" className="p-2">
                      <Type className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="shapes" className="p-2">
                      <Shapes className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="images" className="p-2">
                      <ImageIcon className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="p-2">
                      <Palette className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="text-input">Add Text</Label>
                      <Input id="text-input" placeholder="Enter your text" />
                    </div>
                    <div>
                      <Label htmlFor="font-select">Font</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select font" />
                        </SelectTrigger>
                        <SelectContent>
                          {fonts.map((font) => (
                            <SelectItem key={font} value={font}>
                              {font}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Font Size</Label>
                      <Slider defaultValue={[16]} max={72} min={8} step={1} />
                    </div>
                    <Button className="w-full">Add Text</Button>
                  </TabsContent>

                  <TabsContent value="shapes" className="space-y-4 mt-4">
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" className="aspect-square bg-transparent">
                        <Square className="h-6 w-6" />
                      </Button>
                      <Button variant="outline" className="aspect-square bg-transparent">
                        <Circle className="h-6 w-6" />
                      </Button>
                      <Button variant="outline" className="aspect-square bg-transparent">
                        <Triangle className="h-6 w-6" />
                      </Button>
                    </div>
                    <div>
                      <Label>Shape Color</Label>
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {colors.map((color) => (
                          <button
                            key={color}
                            className="w-8 h-8 rounded border-2 border-gray-300"
                            style={{ backgroundColor: color }}
                            onClick={() => setSelectedColor(color)}
                          />
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="images" className="space-y-4 mt-4">
                    <Button className="w-full bg-transparent" variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                    <div className="text-center text-sm text-gray-500">Supported: JPG, PNG, SVG</div>
                  </TabsContent>

                  <TabsContent value="templates" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-2">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className="cursor-pointer border rounded-lg p-2 hover:border-blue-500 transition-colors"
                        >
                          <Image
                            src={template.image || "/placeholder.svg"}
                            alt={template.name}
                            width={80}
                            height={80}
                            className="w-full rounded"
                          />
                          <p className="text-xs mt-1 text-center">{template.name}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Main Canvas Area */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Design Canvas</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Redo className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">{canvasZoom[0]}%</span>
                  <Button variant="outline" size="sm">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="relative bg-gray-100 rounded-lg p-8 min-h-[500px] flex items-center justify-center">
                  <div className="relative">
                    <Image
                      src={products.find((p) => p.id === selectedProduct)?.image || products[0].image}
                      alt="Product mockup"
                      width={300}
                      height={300}
                      className="max-w-full h-auto"
                    />
                    {/* Design overlay area */}
                    <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-dashed border-blue-400 bg-blue-50/20 flex items-center justify-center">
                      <p className="text-blue-600 text-sm">Design Area</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Properties & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Canvas Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Canvas Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Zoom Level</Label>
                  <Slider value={canvasZoom} onValueChange={setCanvasZoom} max={200} min={25} step={25} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Move className="mr-2 h-4 w-4" />
                    Move
                  </Button>
                  <Button variant="outline" size="sm">
                    <RotateCw className="mr-2 h-4 w-4" />
                    Rotate
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Product Customization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Product Color</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded border-2 border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="size-select">Size</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="s">Small</SelectItem>
                      <SelectItem value="m">Medium</SelectItem>
                      <SelectItem value="l">Large</SelectItem>
                      <SelectItem value="xl">X-Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Design
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Preview
                </Button>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">Total:</span>
                    <span className="text-xl font-bold">₹{products.find((p) => p.id === selectedProduct)?.price}</span>
                  </div>
                  <Button className="w-full" size="lg">
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
