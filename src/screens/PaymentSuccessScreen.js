import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PaymentSuccessScreen = ({ navigation, route }) => {
  const { paymentData, orderDetails } = route.params || {};

  const handleContinueShopping = () => {
    // Navigate back to home and clear cart
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeTab' }],
    });
  };

  const handleViewOrder = () => {
    // Navigate to order details or profile
    navigation.navigate('ProfileTab');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.subtitle}>
          Your payment has been processed successfully
        </Text>

        {/* Payment Details */}
        {paymentData && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Payment Details</Text>
            
            {paymentData.orderNo && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Order Number:</Text>
                <Text style={styles.detailValue}>{paymentData.orderNo}</Text>
              </View>
            )}
            
            {paymentData.amount && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={styles.detailValue}>ETB {paymentData.amount}</Text>
              </View>
            )}
            
            {paymentData.customerName && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Customer:</Text>
                <Text style={styles.detailValue}>{paymentData.customerName}</Text>
              </View>
            )}
            
            {paymentData.emailId && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{paymentData.emailId}</Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContinueShopping}
          >
            <Ionicons name="home" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewOrder}
          >
            <Ionicons name="receipt" size={20} color="#007AFF" style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>View Orders</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Info */}
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={16} color="#666" />
          <Text style={styles.infoText}>
            You will receive a confirmation email shortly
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
    textAlign: 'center',
  },
});

export default PaymentSuccessScreen;
