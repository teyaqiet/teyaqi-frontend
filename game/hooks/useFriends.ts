import { useState, useEffect, useCallback } from 'react';
import { fetcher } from "@/lib/api";

export const useFriends = () => {
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch both friends and pending requests
   const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        // Use fetcher instead of api.get
        const friendsRes = await fetcher('/api/friends');
        const requestsRes = await fetcher('/api/friends/requests/pending');
        
        setFriends(friendsRes.data || []); // Access .data because of your Laravel wrapper
        setRequests(requestsRes.data || []);
    } catch (error) {
        console.error("Error fetching social data:", error);
    } finally {
        setLoading(false);
    }
}, []);

    // Action: Send Request
    const sendFriendRequest = async (userId: number) => {
    try {
        await fetcher('/api/friends/request', {
            method: 'POST',
            body: JSON.stringify({ 
                friend_id: userId // MUST match Laravel's $request->friend_id
            })
        });
        return true;
    } catch (error) {
        console.error("Request failed:", error);
        return false;
    }
};

    // Action: Accept Request
    const acceptFriendRequest = async (senderId: number) => {
        await api.post('/api/friends/accept', { sender_id: senderId });
        fetchData(); // Refresh lists
    };

    // Action: Unfriend
    const unfriend = async (userId: number) => {
        await api.delete(`/api/friends/${userId}`);
        setFriends(prev => prev.filter(f => f.id !== userId));
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { 
        friends, 
        requests, 
        loading, 
        sendFriendRequest, 
        acceptFriendRequest, 
        unfriend,
        refresh: fetchData 
    };
};