"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { fetcher } from '@/lib/api';

interface FriendContextType {
    friends: any[];
    incomingRequests: any[];
    outgoingRequests: any[];
    loading: boolean;
    processingId: number | null;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    refresh: () => Promise<void>;
    sendRequest: (id: number) => Promise<boolean>;
    acceptRequest: (id: number) => Promise<void>;
    deleteRequest: (id: number) => Promise<void>;
    unfriend: (id: number) => Promise<void>;
}

const FriendContext = createContext<FriendContextType | undefined>(undefined);

export const FriendProvider = ({ children }: { children: React.ReactNode }) => {
    const [friends, setFriends] = useState<any[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
    const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    /**
     * SYNC LOGIC: Fetches friendship arrays manually when invoked
     */
    const refresh = useCallback(async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        
        if (!token || token === "null") {
            setLoading(false);
            return;
        }

        try {
            const [friendsRes, requestsRes] = await Promise.all([
                fetcher('/api/friends'),
                fetcher('/api/friends/requests/pending')
            ]);
            
            const friendsData = friendsRes?.data?.data || friendsRes?.data || [];
            const incomingData = requestsRes?.data?.incoming?.data || requestsRes?.data?.incoming || [];
            const outgoingData = requestsRes?.data?.outgoing?.data || requestsRes?.data?.outgoing || [];

            setFriends(friendsData);
            setIncomingRequests(incomingData);
            setOutgoingRequests(outgoingData);

        } catch (error) {
            console.error("Matrix Sync Error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const sendRequest = async (friend_id: number) => {
        setProcessingId(friend_id);
        try {
            const res = await fetcher('/api/friends/request', {
                method: 'POST',
                body: JSON.stringify({ friend_id })
            });
            if (res) {
                await refresh(); 
                return true;
            }
            return false;
        } catch (error) { 
            return false; 
        } finally {
            setProcessingId(null);
        }
    };

    const acceptRequest = async (senderId: number) => {
        setProcessingId(senderId);
        try {
            const res = await fetcher('/api/friends/accept', {
                method: 'POST',
                body: JSON.stringify({ sender_id: senderId })
            });
            if (res.success || res) {
                await refresh(); 
            }
        } catch (error) {
            console.error("Accept Request Error:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const deleteRequest = async (id: number) => {
        if (!id) return; 
        setProcessingId(id);
        try {
            const res = await fetcher(`/api/friends/requests/${id}`, { method: 'DELETE' });
            if (res) {
                await refresh();
            }
        } catch (error) {
            console.error("Delete Request Error:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const unfriend = async (id: number) => {
        setProcessingId(id);
        try {
            const res = await fetcher(`/api/friends/${id}`, { method: 'DELETE' });
            if (res) {
                await refresh();
            }
        } catch (error) { 
            console.error("Unfriend error:", error); 
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <FriendContext.Provider value={{ 
            friends, 
            incomingRequests, 
            outgoingRequests, 
            loading, 
            processingId,
            setLoading,
            refresh, 
            sendRequest, 
            acceptRequest, 
            deleteRequest, 
            unfriend 
        }}>
            {children}
        </FriendContext.Provider>
    );
};

export const useFriends = () => {
    const context = useContext(FriendContext);
    if (!context) throw new Error("useFriends must be used within a FriendProvider");
    return context;
};