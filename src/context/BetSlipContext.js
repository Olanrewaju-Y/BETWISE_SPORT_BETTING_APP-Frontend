import React, { createContext, useState, useContext, useEffect } from 'react';

const BetSlipContext = createContext();

export const useBetSlip = () => useContext(BetSlipContext);

export const BetSlipProvider = ({ children }) => {
    const [slipItems, setSlipItems] = useState(() => {
        const savedSlip = localStorage.getItem('betWiseLocalBetSlip');
        return savedSlip ? JSON.parse(savedSlip) : [];
    });

    useEffect(() => {
        localStorage.setItem('betWiseLocalBetSlip', JSON.stringify(slipItems));
    }, [slipItems]);

    const addToSlip = (event, selections) => {
        // Selections is an object like: { '1x2': { key: 'homeTeamWinPoint', value: 1.2, label: 'Home Win' }, ... }
        // We want to store it with event details
        setSlipItems(prevItems => {
            // Remove existing selections for this event to avoid duplicates/conflicts if user re-adds
            const otherItems = prevItems.filter(item => item.eventId !== event._id);
            
            // If no new selections, effectively removes the event from slip
            if (Object.keys(selections).length === 0) { // This means the event's selections are being cleared
                return otherItems;
            }

            const newItem = {
                eventId: event._id,
                eventDescription: event.eventDescription,
                homeTeam: event.homeTeam,
                awayTeam: event.awayTeam,
                selections: Object.entries(selections).map(([category, details]) => ({
                    category,
                    oddKey: details.key,
                    oddValue: details.value,
                    label: details.label,
                    oddId: details.oddId, // Storing the oddId
                })),
            };
            const newSlipItems = [...otherItems, newItem];
            return newSlipItems;
        });
    };

    const removeFromSlip = (eventId, selectionOddKey) => {
        setSlipItems(prevItems => prevItems.map(item => {
            if (item.eventId === eventId) {
                const updatedSelections = item.selections.filter(sel => sel.oddKey !== selectionOddKey);
                return updatedSelections.length > 0 ? { ...item, selections: updatedSelections } : null;
            }
            return item;
        }).filter(item => item !== null)); // Remove events with no selections left
    };

    const clearSlip = () => {
        setSlipItems([]);
    };

    return (
        <BetSlipContext.Provider value={{ slipItems, addToSlip, removeFromSlip, clearSlip }}>
            {children}
        </BetSlipContext.Provider>
    );
};
    



     