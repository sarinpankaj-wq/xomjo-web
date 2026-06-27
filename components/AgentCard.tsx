"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock } from "lucide-react";

interface AgentCardProps {
  id: string;
  name: string;
  tagline: string;
  category: string;
  status: "live" | "coming_soon";
  href: string;
  index?: number;
}

export default function AgentCard({ name, tagline, category, status, href, index = 0 }: AgentCardProps) {
  const isLive = status === "live";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      whileHover={isLive ? { y: -3, transition: { duration: 0.2 } } : {}}
    >
      <Card className={`h-full flex flex-col transition-shadow
        ${isLive ? "hover:shadow-lg hover:border-[#2E86C1]" : "opacity-60"}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            {isLive ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs font-semibold border-0">● LIVE</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs gap-1">
                <Clock className="w-3 h-3" /> Coming Soon
              </Badge>
            )}
            <span className="text-xs text-muted-foreground capitalize">{category.replace("_", " ")}</span>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <h3 className="font-bold text-[#1B4F72] text-base leading-tight mb-2">{name}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{tagline}</p>
        </CardContent>
        <CardFooter>
          {isLive ? (
            <Link href={href}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#2E86C1] hover:bg-[#1B4F72] text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm">
              Try Live Demo <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="w-full inline-flex items-center justify-center bg-gray-100 text-gray-400 font-medium px-4 py-2 rounded-lg text-sm">
              Coming Soon
            </span>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
