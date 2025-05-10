"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BellIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Image from "next/image";

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

// Mock suggestions data
const mockSuggestions = [
  {
    id: 1,
    title: "Budget Optimization",
    message: "Meta Campaign “W03-25 | Statics | Ugly Ad” hitting $1.5 CPA",
    type: "optimization",
    suggestedAction: "Increase budget by 25%"
  },
  {
    id: 2,
    title: "Performance Alert",
    message: "TikTok Campaign: ROAS dropped 30% in last 3 days",
    type: "alert",
    suggestedAction: "Reduce budget by 25%"
  },
  {
    id: 3,
    title: "Opportunity",
    message: "New audience segment identified with 2.5x higher conversion rate",
    type: "opportunity",
    suggestedAction: "Create new campaign targeting this segment"
  },
];

function SuggestionCard({ suggestion, onAccept, onReject }) {
  return (
    <Card className="mb-2">
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{suggestion.title}</CardTitle>
          <span className="text-xs px-2 py-1 rounded-full bg-muted">
            {suggestion.type}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground mb-3">{suggestion.message}</p>
        <div className="flex items-center justify-between border-t pt-3">
          <div className="text-sm font-medium text-primary flex items-center gap-2">
            <span>Suggested Action:</span>
            <span className="text-foreground">{suggestion.suggestedAction}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onReject(suggestion.id)}>
              Dismiss
            </Button>
            <Button size="sm" onClick={() => onAccept(suggestion.id)}>
              Apply
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mock platform data
const platforms = [
  {
    id: "meta",
    name: "Meta",
    logo: "/platforms/meta.png"
  },
  {
    id: "google",
    name: "Google",
    logo: "/platforms/google.png"
  },
  {
    id: "tiktok",
    name: "TikTok",
    logo: "/platforms/tiktok.png"
  },
  {
    id: "pinterest",
    name: "Pinterest",
    logo: "/platforms/pinterest.png"
  }
];

export default function Dashboard() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activePlatform, setActivePlatform] = useState("meta");

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

  // n8n chat widget loader
  useEffect(() => {
    // Add the stylesheet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css';
    document.head.appendChild(link);

    // Add the script
    const script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = `
      import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
      createChat({
        webhookUrl: 'https://hackaton2ed.app.n8n.cloud/webhook/1c0d08f0-abd0-4bdc-beef-370c27aae1a0/chat'
      });
    `;
    document.body.appendChild(script);

    // Cleanup
    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
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
    try {
      setSaving(true);
      console.log('Updating budget for:', ad_name, 'to:', value);
      
      const response = await fetch("/api/ads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_budget",
          ad_name: ad_name,
          budget: Number(value)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update budget');
      }

      // Refresh the ads data
      const res = await fetch("/api/ads");
      const data = await res.json();
      setAds(data.ads || []);
      
      console.log('Budget updated successfully');
    } catch (error) {
      console.error('Error updating budget:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAcceptSuggestion = async (id) => {
    try {
      const suggestion = suggestions.find(s => s.id === id);
      if (!suggestion) return;

      let response;
      switch (id) {
        case 1:
          // Increase budget by 25% for Meta Campaign
          response = await fetch("/api/ads/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "increase_budget",
              percentage: 25,
              ad_name_pattern: "Meta Campaign \"W03-25 | Statics | Ugly Ad\" hitting $1.5 CPA"
            }),
          });
          break;
        case 2:
          // Reduce budget by 25% for TikTok Campaign
          response = await fetch("/api/ads/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "decrease_budget",
              percentage: 25,
              ad_name_pattern: "TikTok Campaign: ROAS dropped 30% in last 3 days"
            }),
          });
          break;
        case 3:
          // Increase budget for all matching ads
          response = await fetch("/api/ads/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "increase_budget",
              percentage: 25,
              ad_name_pattern: "New audience segment identified with 2.5x higher conversion rate"
            }),
          });
          break;
      }

      if (response && response.ok) {
        // Remove the suggestion after successful update
        setSuggestions(suggestions.filter(s => s.id !== id));
        // Refresh the ads data
        const res = await fetch("/api/ads");
        const data = await res.json();
        setAds(data.ads || []);
      } else {
        console.error('Failed to apply suggestion');
      }
    } catch (error) {
      console.error('Error applying suggestion:', error);
    }
  };

  const handleRejectSuggestion = (id) => {
    // Mock implementation - in real app, this would dismiss the suggestion
    console.log(`Rejected suggestion ${id}`);
    setSuggestions(suggestions.filter(s => s.id !== id));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Ads Dashboard</h1>
        <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <BellIcon className="h-5 w-5" />
              {suggestions.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {suggestions.length}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
            <DialogHeader className="pb-2 flex-shrink-0">
              <DialogTitle>Suggestions</DialogTitle>
            </DialogHeader>
            <div className="mt-2 overflow-y-auto flex-1 min-h-0">
              {suggestions.length === 0 ? (
                <p className="text-center text-muted-foreground">No suggestions available</p>
              ) : (
                <div className="space-y-2 pr-2">
                  {suggestions.map((suggestion) => (
                    <SuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onAccept={handleAcceptSuggestion}
                      onReject={handleRejectSuggestion}
                    />
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Insight Cards */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <InsightCard title="Total Spent" value={`$${totalSpent}`} />
        <InsightCard title="Total Revenue" value={`$${totalRevenue}`} />
        <InsightCard title="Avg. ROAS" value={avgROAS} />
      </div>

      {/* Platform Tabs */}
      <Tabs defaultValue="meta" className="mb-6" onValueChange={setActivePlatform}>
        <TabsList className="grid w-full grid-cols-4">
          {platforms.map((platform) => (
            <TabsTrigger
              key={platform.id}
              value={platform.id}
              className="flex items-center gap-2"
            >
              <Image
                src={platform.logo}
                alt={`${platform.name} logo`}
                width={20}
                height={20}
                className="object-contain"
              />
              {platform.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

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
