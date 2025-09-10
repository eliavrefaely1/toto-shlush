import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { WeeklySettings } from "@/entities/WeeklySettings";
import { Match } from "@/entities/Match";
import { Slip } from "@/entities/Slip";
import { Participant } from "@/entities/Participant";
import { Shield, Settings, Users, Trophy, Plus, Save, Eye, EyeOff } from "lucide-react";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState(null);
  const [matches, setMatches] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [slips, setSlips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadWeekData = useCallback(async (week) => {
    try {
      const [weekMatches, weekSlips] = await Promise.all([
        Match.filter({ week }, "match_number"),
        Slip.filter({ week })
      ]);

      // יצירת 16 משחקים ברירת מחדל אם אין
      if (weekMatches.length < 16) {
        const newMatches = [];
        for (let i = weekMatches.length + 1; i <= 16; i++) {
          newMatches.push({
            week,
            match_number: i,
            home_team: `קבוצת בית ${i}`,
            away_team: `קבוצת חוץ ${i}`,
            result: ""
          });
        }
        await Match.bulkCreate(newMatches);
        const updatedMatches = await Match.filter({ week }, "match_number");
        setMatches(updatedMatches);
      } else {
        setMatches(weekMatches);
      }

      setSlips(weekSlips);
    } catch (error) {
      console.error("Error loading week data:", error);
    }
  }, []);

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [settingsData, allParticipants] = await Promise.all([
        WeeklySettings.list(),
        Participant.list()
      ]);

      const currentSettings = settingsData[0] || {
        current_week: 1,
        admin_password: "1234",
        entry_fee: 35
      };

      if (settingsData.length === 0) {
        await WeeklySettings.create(currentSettings);
      }

      setSettings(currentSettings);
      setParticipants(allParticipants);

      await loadWeekData(currentSettings.current_week);
    } catch (error) {
      console.error("Error loading admin data:", error);
    }
    setIsLoading(false);
  }, [loadWeekData]);
  
  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated, loadAdminData]);

  const handleLogin = async () => {
    // טוען הגדרות אם לא נטענו עדיין
    let currentSettings = settings;
    if (!currentSettings) {
        const settingsData = await WeeklySettings.list();
        if (settingsData.length > 0) {
            currentSettings = settingsData[0];
            setSettings(currentSettings);
        }
    }
    
    if (currentSettings && password === currentSettings.admin_password) {
      setIsAuthenticated(true);
    } else {
      alert("סיסמה שגויה!");
    }
  };

  const calculateScores = useCallback(async (currentMatches) => {
    try {
      const weekSlips = await Slip.filter({ week: settings.current_week });
      for (const slip of weekSlips) {
        let score = 0;
        currentMatches.forEach((match, index) => {
          if (slip.predictions[index] === match.result && match.result) {
            score++;
          }
        });
        if (slip.score !== score) {
          await Slip.update(slip.id, { score });
        }
      }
      // רענון הנתונים
      await loadWeekData(settings.current_week);
    } catch (error) {
      console.error("Error calculating scores:", error);
    }
  }, [settings, loadWeekData]);

  const updateMatch = async (matchId, field, value) => {
    try {
      await Match.update(matchId, { [field]: value });
      const updatedMatches = matches.map(match =>
        match.id === matchId ? { ...match, [field]: value } : match
      );
      setMatches(updatedMatches);
      
      // חישוב ניקוד אוטומטי
      if (field === "result") {
        await calculateScores(updatedMatches);
      }
    } catch (error) {
      console.error("Error updating match:", error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const updated = { ...settings, ...newSettings };
      await WeeklySettings.update(settings.id, updated);
      setSettings(updated);
      if (newSettings.current_week && newSettings.current_week !== settings.current_week) {
        await loadWeekData(newSettings.current_week);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  const getLeaderboard = () => {
    const participantMap = {};
    participants.forEach(p => {
      participantMap[p.id] = p;
    });

    return slips
      .map(slip => ({
        ...slip,
        participant: participantMap[slip.participant_id]
      }))
      .sort((a, b) => b.score - a.score);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-red-800">כניסת מנהל</CardTitle>
            <p className="text-red-600">הזן את סיסמת המנהל</p>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-red-700 font-medium">
                  סיסמת מנהל
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="הזן סיסמה"
                    className="pl-10 text-right border-red-200 focus:border-red-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-red-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-red-500" />
                    )}
                  </button>
                </div>
              </div>
              
              <Button
                onClick={handleLogin}
                disabled={!password.trim()}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 py-3 text-lg font-bold"
              >
                <Shield className="w-5 h-5 ml-2" />
                כניסה
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700 text-center">
                🔒 סיסמת ברירת מחדל: 1234
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto"></div>
        <p className="mt-4 text-red-600 text-lg">טוען פאנל מנהל...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-red-800 mb-4">
          🛠️ פאנל מנהל
        </h2>
        <p className="text-xl text-red-600">
          ניהול משחקים, תוצאות ומשתתפים
        </p>
      </div>

      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="matches" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            משחקים
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            תוצאות
          </TabsTrigger>
          <TabsTrigger value="participants" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            משתתפים
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            הגדרות
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matches">
          <Card>
            <CardHeader>
              <CardTitle>משחקי שבוע {settings?.current_week}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matches.map((match) => (
                  <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">משחק {match.match_number}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm">קבוצת בית</Label>
                        <Input
                          value={match.home_team}
                          onChange={(e) => updateMatch(match.id, 'home_team', e.target.value)}
                          className="text-right"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">קבוצת חוץ</Label>
                        <Input
                          value={match.away_team}
                          onChange={(e) => updateMatch(match.id, 'away_team', e.target.value)}
                          className="text-right"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">תוצאה</Label>
                        <div className="flex gap-1">
                          {['1', 'X', '2', ''].map((result) => (
                            <Button
                              key={result}
                              variant={match.result === result ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateMatch(match.id, 'result', result)}
                              className="flex-1"
                            >
                              {result || 'ללא'}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>דירוג שבוע {settings?.current_week}</CardTitle>
            </CardHeader>
            <CardContent>
              {getLeaderboard().length === 0 ? (
                <p className="text-center text-gray-500 py-8">אין משתתפים עדיין...</p>
              ) : (
                <div className="space-y-2">
                  {getLeaderboard().map((slip, index) => (
                    <div key={slip.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-500 text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">
                            {slip.participant?.name || 'משתתף לא ידוע'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {slip.participant?.phone}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-lg px-4 py-2">
                        {slip.score} נקודות
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle>רשימת משתתפים</CardTitle>
            </CardHeader>
            <CardContent>
              {participants.length === 0 ? (
                <p className="text-center text-gray-500 py-8">אין משתתפים רשומים עדיין...</p>
              ) : (
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{participant.name}</div>
                        <div className="text-sm text-gray-500">{participant.phone}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          נרשם: {new Date(participant.created_date).toLocaleDateString('he-IL')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>הגדרות מערכת</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="current_week">שבוע נוכחי</Label>
                  <Input
                    id="current_week"
                    type="number"
                    value={settings?.current_week || 1}
                    onChange={(e) => updateSettings({ current_week: parseInt(e.target.value) || settings.current_week })}
                    className="w-32"
                  />
                </div>
                
                <div>
                  <Label htmlFor="entry_fee">דמי כניסה (₪)</Label>
                  <Input
                    id="entry_fee"
                    type="number"
                    value={settings?.entry_fee || 35}
                    onChange={(e) => updateSettings({ entry_fee: parseInt(e.target.value) || settings.entry_fee })}
                    className="w-32"
                  />
                </div>
                
                <div>
                  <Label htmlFor="admin_password">סיסמת מנהל</Label>
                  <Input
                    id="admin_password"
                    type="password"
                    value={settings?.admin_password || ""}
                    onChange={(e) => updateSettings({ admin_password: e.target.value })}
                    className="w-64"
                  />
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-bold mb-2">סטטיסטיקות:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>משתתפים: {participants.length}</div>
                    <div>טורים השבוע: {slips.length}</div>
                    <div>סה״כ קופה: ₪{(slips.length * (settings?.entry_fee || 35)).toLocaleString()}</div>
                    <div>משחקים עם תוצאות: {matches.filter(m => m.result).length}/16</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}