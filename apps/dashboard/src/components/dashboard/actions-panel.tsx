"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  DatabaseZap,
  Eye,
  FlaskConical,
  MessageCircleMore,
  PenSquare,
  ScrollText,
  Zap,
} from "lucide-react";
import Link from "next/link";
import DotPattern from "../ui/dot-pattern";

const ActionCard = ({ icon: Icon, title, href, gradient }) => (
  <Link href={href} draggable="false">
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Card
        className={`h-full overflow-hidden ${gradient} transition-shadow hover:shadow-lg`}
      >
        <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
          <Icon className="mb-4 size-10 text-white" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </CardContent>
      </Card>
    </motion.div>
  </Link>
);

const ActionsPanel = () => {
  return (
    <Card className="w-full p-6 relative bg-gradient-to-br from-violet-50 to-purple-50">
      <DotPattern
        width={6}
        height={6}
        cx={1}
        cy={1}
        cr={1}
        className="opacity-20"
      />

      <CardContent className="p-0">
        <h2 className="text-xl font-semibold mb-4 text-neutral-700">
          Gyors műveletek
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ActionCard
              icon={MessageCircleMore}
              title="Beszélgetések"
              href="/beszelgetesek"
              gradient="bg-gradient-to-br from-blue-500/80 to-blue-700/80"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ActionCard
              icon={Zap}
              title="Leó tudásbázisa"
              href="/tudasbazis"
              gradient="bg-gradient-to-br from-green-500/80 to-emerald-700/80"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ActionCard
              icon={ScrollText}
              title="Bejegyzések"
              href="/bejegyzesek"
              gradient="bg-gradient-to-br from-violet-500/80 to-purple-700/80"
            />
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionsPanel;
