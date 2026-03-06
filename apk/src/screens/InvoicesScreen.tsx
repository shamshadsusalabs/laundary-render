import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

const psColors: Record<string, { bg: string; text: string; icon: string }> = {
    paid: { bg: '#14532d', text: '#4ade80', icon: '✅' },
    partial: { bg: '#451a03', text: '#fbbf24', icon: '⏳' },
    unpaid: { bg: '#450a0a', text: '#fca5a5', icon: '⚠️' },
};

export default function InvoicesScreen({ navigation }: any) {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const res = await api.get('/customer-portal/invoices', { params: { limit: 50 } });
            setInvoices(res.data.data);
        } catch { }
        finally { setLoading(false); setRefreshing(false); }
    };

    useFocusEffect(useCallback(() => { fetchData(); }, []));

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
            <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 }}>
                <Text style={{ fontSize: 26, fontWeight: '800', color: '#f1f5f9' }}>My Invoices</Text>
                <Text style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>View your billing history</Text>
            </View>

            <FlatList
                data={invoices}
                keyExtractor={(i) => i._id}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); fetchData(); }}
                        tintColor="#06b6d4"
                        colors={['#06b6d4']}
                    />
                }
                contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', paddingVertical: 64 }}>
                        <Text style={{ fontSize: 40, marginBottom: 12 }}>🧾</Text>
                        <Text style={{ color: '#64748b', fontSize: 15 }}>No invoices</Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const c = psColors[item.paymentStatus] || { bg: '#1e293b', text: '#94a3b8', icon: '📋' };
                    return (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: item._id })}
                            style={{
                                backgroundColor: '#1e293b',
                                borderRadius: 20,
                                padding: 16,
                                marginBottom: 10,
                                marginHorizontal: 20,
                                borderWidth: 1,
                                borderColor: '#334155',
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <Text style={{ fontSize: 20 }}>{c.icon}</Text>
                                    <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 15 }}>{item.invoiceId}</Text>
                                </View>
                                <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: c.bg }}>
                                    <Text style={{ color: c.text, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' }}>
                                        {item.paymentStatus}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <Text style={{ color: '#64748b', fontSize: 12 }}>
                                    {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </Text>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ color: '#f1f5f9', fontWeight: '800', fontSize: 18 }}>₹{item.totalAmount}</Text>
                                    {item.balanceDue > 0 && (
                                        <Text style={{ color: '#fca5a5', fontSize: 11, marginTop: 2 }}>Due: ₹{item.balanceDue}</Text>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}
