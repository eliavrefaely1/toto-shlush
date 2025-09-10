
import React, { useState, useEffect, useCallback } from "react";
import { Slip } from "@/entities/Slip";
import { WeeklySettings } from "@/entities/WeeklySettings";

export default function PrizePool({ week }) {
  const [participants, setParticipants] = useState([]);
  const [entryFee, setEntryFee] = useState(35); // Updated default entryFee to 35

  const loadData = useCallback(async () => {
    try {
      const slips = await Slip.filter({ week });
      const participantIds = [...new Set(slips.map(slip => slip.participant_id))];
      setParticipants(participantIds);

      const settings = await WeeklySettings.list();
      if (settings.length > 0) {
        setEntryFee(settings[0].entry_fee || 35); // Updated fallback entryFee to 35
      }
    } catch (error) {
      console.error("Error loading prize pool data:", error);
    }
  }, [week]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalPrize = participants.length * entryFee;

  return (
    <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl p-6 shadow-xl">
      <div className="text-center text-white">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="text-4xl animate-bounce">💼</div>
          <h3 className="text-2xl font-bold">הקופה השבועית</h3>
          <div className="text-4xl animate-bounce">🤑</div>
        </div>
        
        <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-5xl font-bold mb-2">
            ₪{totalPrize.toLocaleString()}
          </div>
          <p className="text-lg opacity-90">
            {participants.length} משתתפים × ₪{entryFee}
          </p>
          <div className="flex justify-center gap-2 mt-3">
            <span>💰</span>
            <span>💵</span>
            <span>💷</span>
            <span>💶</span>
          </div>
        </div>
        
        <p className="mt-4 text-sm opacity-80">
          הזוכה לוקח הכל! 🎯
        </p>
      </div>
    </div>
  );
}
