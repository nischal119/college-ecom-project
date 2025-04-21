"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    isHot: boolean;
  };
  onAddToCart: (id: number) => void;
  onAddToWishlist: (id: number) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="h-full"
      >
        <Card
          className={cn(
            "overflow-hidden h-full transition-all duration-300 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border-accent/20",
            isHovered ? "shadow-xl ring-2 ring-accent/20" : "shadow-md"
          )}
        >
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500"
              style={{ transform: isHovered ? "scale(1.1)" : "scale(1)" }}
            />

            {product.isHot && (
              <div className="absolute top-3 left-3 z-10">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-3 py-1 text-white">
                  <motion.span
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    Hot Deal
                  </motion.span>
                </Badge>
              </div>
            )}

            <motion.div
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 transition-opacity"
              style={{ opacity: isHovered ? 1 : 0 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.2 }}
                className="flex gap-2"
              >
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30"
                  onClick={() => setShowQuickView(true)}
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Quick view</span>
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30"
                  onClick={() => onAddToWishlist(product.id)}
                >
                  <Heart className="h-4 w-4" />
                  <span className="sr-only">Add to wishlist</span>
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30"
                  onClick={() => onAddToCart(product.id)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="sr-only">Add to cart</span>
                </Button>
              </motion.div>
            </motion.div>
          </div>

          <CardContent className="p-4">
            <div className="mb-1 text-sm text-accent font-medium">
              {product.category}
            </div>
            <h3 className="font-semibold text-lg mb-1 line-clamp-1 text-foreground">
              {product.name}
            </h3>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {product.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="font-bold text-lg text-primary">
                ${product.price.toFixed(2)}
              </div>
              <Button
                size="sm"
                onClick={() => onAddToCart(product.id)}
                className="rounded-full bg-primary hover:bg-primary/90"
              >
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
            <DialogDescription>{product.category}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="relative aspect-square">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
              />
              {product.isHot && (
                <div className="absolute top-3 left-3 z-10">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-white">
                    Hot Deal
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <p className="text-muted-foreground mb-4">
                {product.description}
              </p>
              <div className="text-2xl font-bold mb-6">
                ${product.price.toFixed(2)}
              </div>

              <div className="space-y-4 mt-auto">
                <Button
                  className="w-full"
                  onClick={() => {
                    onAddToCart(product.id);
                    setShowQuickView(false);
                  }}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    onAddToWishlist(product.id);
                    setShowQuickView(false);
                  }}
                >
                  Add to Wishlist
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
