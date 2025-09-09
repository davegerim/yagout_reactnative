import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PaymentFailureScreen = ({ navigation, route }) => {
  const { paymentData, errorMessage, orderDetails } = route.params || {};

  const handleRetryPayment = () => {
    // Navigate back to checkout to retry payment
    navigation.navigate('Checkout');
  };

  const handleBackToCart = () => {
    // Navigate back to cart
    navigation.navigate('CartMain');
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'For payment issues, please contact our support team at support@yagout.com or call +251-XXX-XXXX',
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Failure Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="close-circle" size={100} color="#F44336" />
        </View>

        {/* Failure Message */}
        <Text style={styles.title}>Payment Failed</Text>
        <Text style={styles.subtitle}>
          {errorMessage || 'Your payment could not be processed. Please try again.'}
        </Text>

        {/* Payment Details */}
        {paymentData && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Transaction Details</Text>
            
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
          </View>
        )}

        {/* Error Message */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={20} color="#F44336" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRetryPayment}
          >
            <Ionicons name="refresh" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Retry Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleBackToCart}
          >
            <Ionicons name="cart" size={20} color="#007AFF" style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>Back to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleContactSupport}
          >
            <Ionicons name="help-circle" size={20} color="#666" style={styles.buttonIcon} />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Info */}
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={16} color="#666" />
          <Text style={styles.infoText}>
            Common reasons for payment failure: insufficient funds, network issues, or invalid payment details
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
    marginBottom: 20,
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
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginLeft: 10,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#F44336',
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
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  supportButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
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
  supportButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default PaymentFailureScreen;
