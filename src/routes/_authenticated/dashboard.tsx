import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useBusiness } from "@/lib/business";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Hiraya Marketing" },
      {
        name: "description",
        content:
          "See your brand awareness score, engagement rate and follower growth at a glance in Hiraya Marketing.",
      },
      { property: "og:title", content: "Dashboard — Hiraya Marketing" },
      {
        property: "og:description",
        content: "Your marketing numbers in one calm view: awareness, engagement and growth.",
      },
    ],
  }),
  component: Dashboard;
});

function Dashboard() {
  return null;
}
