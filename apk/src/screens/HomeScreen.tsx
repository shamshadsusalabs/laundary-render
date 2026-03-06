import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Summary {
    totalOrders: number;
    activeOrders: number;
    completedOrders: number;
    totalInvoices: number;
    unpaidBalance: number;
    recentOrders: any[];
}

const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
    received: { bg: '#1e3a5f', text: '#60a5fa', icon: '📥' },
    washing: { bg: '#164e63', text: '#22d3ee', icon: '🫧' },
    packed: { bg: '#3b0764', text: '#c084fc', icon: '📦' },
    delivered: { bg: '#14532d', text: '#4ade80', icon: '✅' },
    cancelled: { bg: '#450a0a', text: '#fca5a5', icon: '❌' },
};

export default function HomeScreen({ navigation }: any) {
    const { customer } = useAuth();
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSummary = async () => {
        try {
            const res = await api.get('/customer-portal/summary');
            setSummary(res.data.data);
        } catch (err) {
            console.error('Failed to load summary:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchSummary();
        }, [])
    );

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
                <ActivityIndicator size="large" color="#06b6d4" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); fetchSummary(); }}
                        tintColor="#06b6d4"
                        colors={['#06b6d4']}
                    />
                }
            >
                {/* Header */}
                <LinearGradient
                    colors={['#0e7490', '#0284c7', '#0f172a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 }}
                >
                    <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5, marginBottom: 10 }}>
                        🧺 Peninsula Laundries
                    </Text>
                    <Text style={{ color: '#ffffff', fontSize: 14 }}>Welcome back,</Text>
                    <Text style={{ color: '#ffffff', fontSize: 26, fontWeight: '800', marginTop: 4 }}>
                        {customer?.name} 👋
                    </Text>
                    <Text style={{ color: '#ffffff', fontSize: 12, marginTop: 4 }}>
                        ID: {customer?.customerId}
                    </Text>
                </LinearGradient>

                <View style={{ paddingHorizontal: 20, marginTop: -20 }}>
                    {/* New Order Button */}
                    <TouchableOpacity
                        onPress={() => navigation.navigate('CreateOrder')}
                        activeOpacity={0.8}
                        style={{ marginBottom: 16 }}
                    >
                        <LinearGradient
                            colors={['#06b6d4', '#0284c7']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                borderRadius: 16,
                                padding: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                            }}
                        >
                            <Text style={{ fontSize: 20 }}>🧺</Text>
                            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>Place New Order</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    {/* Stats Row */}
                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                        {[
                            { label: 'Active', value: summary?.activeOrders || 0, color: '#06b6d4' },
                            { label: 'Completed', value: summary?.completedOrders || 0, color: '#22c55e' },
                            { label: 'Total', value: summary?.totalOrders || 0, color: '#f8fafc' },
                        ].map((stat, i) => (
                            <View
                                key={i}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#1e293b',
                                    borderRadius: 20,
                                    padding: 16,
                                    borderWidth: 1,
                                    borderColor: '#334155',
                                }}
                            >
                                <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>
                                    {stat.label}
                                </Text>
                                <Text style={{ color: stat.color, fontSize: 28, fontWeight: '800', marginTop: 4 }}>
                                    {stat.value}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Unpaid Balance */}
                    {(summary?.unpaidBalance || 0) > 0 && (
                        <View
                            style={{
                                backgroundColor: '#451a03',
                                borderRadius: 20,
                                padding: 18,
                                borderWidth: 1,
                                borderColor: '#78350f',
                                marginBottom: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <View>
                                <Text style={{ color: '#fbbf24', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>
                                    OUTSTANDING BALANCE
                                </Text>
                                <Text style={{ color: '#fcd34d', fontSize: 24, fontWeight: '800', marginTop: 4 }}>
                                    ₹{summary?.unpaidBalance?.toFixed(2)}
                                </Text>
                            </View>
                            <Text style={{ fontSize: 32 }}>⚠️</Text>
                        </View>
                    )}

                    {/* Recent Orders */}
                    <View style={{ marginTop: 8 }}>
                        <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '700', marginBottom: 14 }}>
                            Recent Orders
                        </Text>
                        {summary?.recentOrders?.length === 0 ? (
                            <View
                                style={{
                                    backgroundColor: '#1e293b',
                                    borderRadius: 20,
                                    padding: 40,
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: '#334155',
                                }}
                            >
                                <Text style={{ fontSize: 40, marginBottom: 12 }}>📦</Text>
                                <Text style={{ color: '#64748b', fontSize: 14 }}>No orders yet</Text>
                            </View>
                        ) : (
                            summary?.recentOrders?.map((order: any) => {
                                const colors = statusColors[order.status] || { bg: '#1e293b', text: '#94a3b8', icon: '📋' };
                                return (
                                    <View
                                        key={order._id}
                                        style={{
                                            backgroundColor: '#1e293b',
                                            borderRadius: 20,
                                            padding: 16,
                                            marginBottom: 10,
                                            borderWidth: 1,
                                            borderColor: '#334155',
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                <Text style={{ fontSize: 20 }}>{colors.icon}</Text>
                                                <View>
                                                    <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 15 }}>
                                                        {order.orderId}
                                                    </Text>
                                                    <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                                                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <View
                                                    style={{
                                                        paddingHorizontal: 10,
                                                        paddingVertical: 4,
                                                        borderRadius: 10,
                                                        backgroundColor: colors.bg,
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            color: colors.text,
                                                            fontSize: 11,
                                                            fontWeight: '700',
                                                            textTransform: 'capitalize',
                                                        }}
                                                    >
                                                        {order.status}
                                                    </Text>
                                                </View>
                                                <Text style={{ color: '#f1f5f9', fontWeight: '800', fontSize: 15, marginTop: 6 }}>
                                                    ₹{order.totalAmount}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>
                </View>

                <View style={{ height: 24 }} />
            </ScrollView>
        </View>
    );
}
