import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Alert, 
  ActivityIndicator, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { paymentService } from '../services/paymentService';
import { testYagoutPayConfig } from '../utils/testYagoutPayConfig';
import { debugAPI } from '../utils/debugAPI';

const DirectPayment = ({ paymentData, onSuccess, onFailure, navigation }) => {
  console.log('🎯 DirectPayment component is rendering with paymentData:', paymentData);
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [configTest, setConfigTest] = useState(null);
  const [cleanedData, setCleanedData] = useState(null);

  useEffect(() => {
    // Test configuration on component mount
    const config = testYagoutPayConfig();
    setConfigTest(config);
    
    // Use EXACT data - NO CLEANING!
    setCleanedData(paymentData);
    
    console.log('✅ Using EXACT paymentData - NO CLEANING!');
    console.log('Payment data:', JSON.stringify(paymentData, null, 2));
  }, [paymentData]);

  const processPayment = async () => {
    try {
      console.log('🔥 PROCESS PAYMENT CALLED!');
      console.log('🔥 paymentData received:', JSON.stringify(paymentData, null, 2));
      console.log('🔥 Field check:', {
        order_no: paymentData?.order_no,
        amount: paymentData?.amount,
        customer_name: paymentData?.customer_name,
        email_id: paymentData?.email_id,
        mobile_no: paymentData?.mobile_no,
        bill_address: paymentData?.bill_address,
        bill_city: paymentData?.bill_city,
        bill_state: paymentData?.bill_state,
        bill_country: paymentData?.bill_country,
        bill_zip: paymentData?.bill_zip,
        pg_id: paymentData?.pg_id,
        paymode: paymentData?.paymode,
        scheme_id: paymentData?.scheme_id,
        wallet_type: paymentData?.wallet_type
      });
      
      setLoading(true);
      setPaymentResult(null);
      
      console.log('✅ Using EXACT data from CheckoutScreen - NO CLEANING!');
      
      // Use EXACT data from CheckoutScreen - NO CLEANING NEEDED!
      const response = await paymentService.processDirectPayment(paymentData);
      
      setPaymentResult(response);
      
      if (response.status === 'Success') {
        // Navigate to success screen
        navigation.navigate('PaymentSuccess', {
          paymentData: paymentData,
          paymentResult: response,
          orderDetails: {
            orderNo: paymentData.order_no,
            amount: paymentData.amount,
            customerName: paymentData.customer_name,
            emailId: paymentData.email_id
          }
        });
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        // Navigate to failure screen
        navigation.navigate('PaymentFailure', {
          paymentData: paymentData,
          paymentResult: response,
          errorMessage: response.statusMessage || 'Payment could not be completed',
          orderDetails: {
            orderNo: paymentData.order_no,
            amount: paymentData.amount,
            customerName: paymentData.customer_name,
            emailId: paymentData.email_id
          }
        });
        
        // Call onFailure callback if provided
        if (onFailure) {
          onFailure(response);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      // Navigate to failure screen for errors
      navigation.navigate('PaymentFailure', {
        paymentData: paymentData,
        paymentResult: null,
        errorMessage: error.message || 'Payment processing failed. Please try again.',
        orderDetails: {
          orderNo: paymentData?.order_no,
          amount: paymentData?.amount,
          customerName: paymentData?.customer_name,
          emailId: paymentData?.email_id
        }
      });
      
      // Call onFailure callback if provided
      if (onFailure) {
        onFailure(error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Processing payment...</Text>
        <Text style={styles.loadingSubText}>Please wait while we process your payment</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="card" size={24} color="#007AFF" />
        <Text style={styles.headerTitle}>Direct API Payment</Text>
      </View>

      {configTest && (
        <View style={styles.configInfo}>
          <Text style={styles.sectionTitle}>Configuration Status</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Merchant ID:</Text>
            <Text style={[
              styles.infoValue,
              { color: configTest.merchantId === '202508080001' ? '#4CAF50' : '#F44336' }
            ]}>
              {configTest.merchantId}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={[
              styles.infoValue,
              { color: configTest.merchantId === '202508080001' ? '#4CAF50' : '#F44336' }
            ]}>
              {configTest.merchantId === '202508080001' ? '✅ Correct' : '❌ Incorrect'}
            </Text>
          </View>
        </View>
      )}

      {cleanedData && (
        <View style={styles.dataValidation}>
          <Text style={styles.sectionTitle}>Data Validation</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Original Amount:</Text>
            <Text style={styles.infoValue}>{paymentData.amount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cleaned Amount:</Text>
            <Text style={[styles.infoValue, { color: '#4CAF50' }]}>
              {cleanedData.amount}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data Status:</Text>
            <Text style={[styles.infoValue, { color: '#4CAF50' }]}>
              ✅ Properly Formatted
            </Text>
          </View>
        </View>
      )}

      <View style={styles.paymentInfo}>
        <Text style={styles.sectionTitle}>Payment Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Order Number:</Text>
          <Text style={styles.infoValue}>{paymentData.orderNo}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Amount:</Text>
          <Text style={styles.infoValue}>{paymentData.amount} ETB</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Customer:</Text>
          <Text style={styles.infoValue}>{paymentData.customerName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{paymentData.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mobile:</Text>
          <Text style={styles.infoValue}>{paymentData.mobile}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.payButton} 
        onPress={processPayment}
        disabled={loading}
      >
        <Ionicons name="wallet" size={20} color="white" />
        <Text style={styles.payButtonText}>Process Payment</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.payButton, { backgroundColor: '#ff6b35', marginTop: 10 }]} 
        onPress={() => {
          console.log('=== DEBUGGING API ===');
          debugAPI();
        }}
        disabled={loading}
      >
        <Ionicons name="bug" size={20} color="white" />
        <Text style={styles.payButtonText}>Debug API</Text>
      </TouchableOpacity>
      
      
      {paymentResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Payment Result</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Status:</Text>
            <Text style={[
              styles.resultValue,
              { color: paymentResult.status === 'Success' ? '#4CAF50' : '#F44336' }
            ]}>
              {paymentResult.status}
            </Text>
          </View>
          {paymentResult.statusMessage && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Message:</Text>
              <Text style={styles.resultValue}>{paymentResult.statusMessage}</Text>
            </View>
          )}
          {paymentResult.transactionId && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Transaction ID:</Text>
              <Text style={styles.resultValue}>{paymentResult.transactionId}</Text>
            </View>
          )}
          {paymentResult.orderNo && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Order No:</Text>
              <Text style={styles.resultValue}>{paymentResult.orderNo}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  loadingSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  configInfo: {
    backgroundColor: '#f0f7ff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  dataValidation: {
    backgroundColor: '#f0fff0',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  paymentInfo: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  resultValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
});

export default DirectPayment;
