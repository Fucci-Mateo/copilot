"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function InsightCard({ title, value }) {
  return (
    <Card className="w-40 text-center">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchAds() {
      console.log('Fetching ads from /api/ads...');
      const res = await fetch("/api/ads");
      console.log('Response received:', res);
      const data = await res.json();
      console.log('Data received:', data);
      setAds(data.ads || []);
      setLoading(false);
    }
    fetchAds();
  }, []);

  // Fixed numbers for the cards
  const totalSpent = 1234;
  const totalRevenue = 5678;
  const avgROAS = 2.34;

  const handleToggle = async (ad_name, current) => {
    setSaving(true);
    await fetch("/api/ads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad_name, active: !current }),
    });
    setAds((ads) =>
      ads.map((ad) =>
        ad.ad_name === ad_name ? { ...ad, status: !current } : ad
      )
    );
    setSaving(false);
  };

  const handleBudgetChange = (ad_name, value) => {
    setAds((ads) => ads.map((ad) => ad.ad_name === ad_name ? { ...ad, budget: value } : ad));
  };

  const handleBudgetBlur = async (ad_name, value) => {
    setSaving(true);
    await fetch("/api/ads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad_name, budget: Number(value) }),
    });
    setSaving(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Meta Ads Dashboard</h1>
      {/* Insight Cards */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <InsightCard title="Total Spent" value={`$${totalSpent}`} />
        <InsightCard title="Total Revenue" value={`$${totalRevenue}`} />
        <InsightCard title="Avg. ROAS" value={avgROAS} />
      </div>
      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg bg-background">
          <thead>
            <tr className="bg-muted text-xs">
              <th className="p-2">Ad Name</th>
              <th className="p-2">Active</th>
              <th className="p-2">Budget</th>
              <th className="p-2">Spent</th>
              <th className="p-2">Revenue</th>
              <th className="p-2">ROAS</th>
              <th className="p-2">CPC</th>
              <th className="p-2">CTR</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center p-4">Loading...</td></tr>
            ) : (
              ads.map((ad) => (
                <tr key={ad.ad_name} className="border-t">
                  <td className="p-2">{ad.ad_name}</td>
                  <td className="p-2 text-center">
                    <Switch checked={!!ad.status} onCheckedChange={() => handleToggle(ad.ad_name, !!ad.status)} disabled={saving} />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={ad.budget}
                      min={0}
                      className="w-24"
                      onChange={e => handleBudgetChange(ad.ad_name, e.target.value)}
                      onBlur={e => handleBudgetBlur(ad.ad_name, e.target.value)}
                      disabled={saving}
                    />
                  </td>
                  {/* Mock values for the rest */}
                  <td className="p-2">${Math.floor(Math.random() * 1000) + 100}</td>
                  <td className="p-2">${Math.floor(Math.random() * 2000) + 200}</td>
                  <td className="p-2">{(Math.random() * 3).toFixed(2)}</td>
                  <td className="p-2">{(Math.random() * 2).toFixed(2)}</td>
                  <td className="p-2">{(Math.random() * 5).toFixed(2)}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
