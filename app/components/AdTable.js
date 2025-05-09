"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

export function AdTable({ initialAds }) {
  const [ads, setAds] = useState(initialAds);
  const [saving, setSaving] = useState(false);

  const handleToggle = async (ad_name, current) => {
    setSaving(true);
    await fetch("/api/ads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad_name, active: !current }),
    });
    setAds((ads) => ads.map((ad) => ad.ad_name === ad_name ? { ...ad, active: !current } : ad));
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
    <div className="overflow-x-auto">
      <table className="min-w-full border rounded-lg bg-background">
        <thead>
          <tr className="bg-muted text-xs">
            <th className="p-2">Active</th>
            <th className="p-2">Ad Name</th>
            <th className="p-2">Budget</th>
            <th className="p-2">Spent</th>
            <th className="p-2">Revenue</th>
            <th className="p-2">ROAS</th>
            <th className="p-2">CPC</th>
            <th className="p-2">CTR</th>
          </tr>
        </thead>
        <tbody>
          {ads.map((ad) => (
            <tr key={ad.ad_name} className="border-t">
              <td className="p-2 text-center">
                <Switch checked={ad.active} onCheckedChange={() => handleToggle(ad.ad_name, ad.active)} disabled={saving} />
              </td>
              <td className="p-2">{ad.ad_name}</td>
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
              <td className="p-2">${ad.spent}</td>
              <td className="p-2">${ad.revenue}</td>
              <td className="p-2">{ad.roas}</td>
              <td className="p-2">{ad.cpc}</td>
              <td className="p-2">{ad.ctr}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 