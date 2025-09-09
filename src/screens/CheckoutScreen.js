import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { clearCart } from '../store/cartSlice';
import {
  initiateHostedPayment,
  processAPIPayment,
  setShowWebView,
  resetPaymentState,
  selectYagoutPayState,
  selectIsProcessing,
  selectPaymentStatus,
} from '../store/yagoutPaySlice';
import { PAYMENT_METHODS } from '../utils/yagoutPayConfig';
import YagoutPayWebView from '../components/YagoutPayWebView';
import { yagoutPayService } from '../services/yagoutPayService';

const CheckoutScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items, total } = useSelector(state => state.cart);
  const { isLoggedIn, user } = useSelector(state => state.auth);
  const yagoutPayState = useSelector(selectYagoutPayState);
  const isProcessingPayment = useSelector(selectIsProcessing);
  const paymentStatus = useSelector(selectPaymentStatus);
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });
  
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.YAGOUT_HOSTED);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const subtotal = total;
  const tax = total * 0.08;
  const shipping = 0; // Free shipping
  const finalTotal = subtotal + tax + shipping;

  const handleInputChange = (section, field, value) => {
    if (section === 'shipping') {
      setShippingAddress(prev => ({ ...prev, [field]: value }));
    } else if (section === 'payment') {
      setCardDetails(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = () => {
    // Validate shipping address
    const requiredShippingFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    for (let field of requiredShippingFields) {
      if (!shippingAddress[field].trim()) {
        Alert.alert('Missing Information', `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingAddress.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }

    // Validate payment details if credit card is selected
    if (paymentMethod === PAYMENT_METHODS.CREDIT_CARD) {
      const requiredCardFields = ['cardNumber', 'expiryDate', 'cvv', 'cardholderName'];
      for (let field of requiredCardFields) {
        if (!cardDetails[field].trim()) {
          Alert.alert('Missing Payment Information', `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          return false;
        }
      }

      // Basic card number validation (should be 16 digits)
      if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        Alert.alert('Invalid Card Number', 'Please enter a valid 16-digit card number');
        return false;
      }
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    // Reset any previous payment state
    dispatch(resetPaymentState());

    const orderData = {
      amount: finalTotal,
      customerName: shippingAddress.fullName,
      customerEmail: shippingAddress.email,
      customerMobile: shippingAddress.phone,
      billingDetails: {
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        country: 'Ethiopia',
        zip: shippingAddress.zipCode,
      },
      shippingDetails: {
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        country: 'Ethiopia',
        zip: shippingAddress.zipCode,
        days: '3-5',
      },
      itemDetails: {
        count: items.length.toString(),
        value: items.map(item => (item.quantity * item.price).toFixed(2)).join(','),
        category: items.map(item => 'Shoes').join(','),
      },
      successUrl: 'https://yourdomain.com/payment/success',
      failureUrl: 'https://yourdomain.com/payment/failure',
    };

    try {
      if (paymentMethod === PAYMENT_METHODS.YAGOUT_HOSTED) {
        // Initiate hosted payment
        const result = await dispatch(initiateHostedPayment(orderData));
        
        if (initiateHostedPayment.fulfilled.match(result)) {
          // Show WebView for hosted payment
          dispatch(setShowWebView(true));
        } else {
          Alert.alert('Payment Error', result.payload?.message || 'Failed to initiate payment');
        }
        
      } else if (paymentMethod === PAYMENT_METHODS.YAGOUT_API) {
        // Process API payment
        const result = await dispatch(processAPIPayment({
          ...orderData,
          paymentMethod: 'WA', // Wallet payment
        }));
        
        if (processAPIPayment.fulfilled.match(result)) {
          handlePaymentSuccess(result.payload);
        } else {
          Alert.alert('Payment Error', result.payload?.message || 'Payment processing failed');
        }
        
      } else if (paymentMethod === PAYMENT_METHODS.CREDIT_CARD) {
        // Traditional credit card processing
        handleTraditionalPayment();
        
      } else if (paymentMethod === PAYMENT_METHODS.PAYPAL) {
        // PayPal processing
        handlePayPalPayment();
      }
      
    } catch (error) {
      console.error('Payment processing error:', error);
      Alert.alert('Payment Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleTraditionalPayment = () => {
    Alert.alert(
      'Order Confirmation',
      `Place order for $${finalTotal.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Order',
          onPress: () => {
            // Simulate order processing
            dispatch(clearCart());
            Alert.alert(
              'Order Placed!',
              'Your order has been successfully placed. You will receive a confirmation email shortly.',
              [
                {
                  text: 'Continue Shopping',
                  onPress: () => navigation.navigate('HomeTab'),
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handlePayPalPayment = () => {
    Alert.alert('PayPal', 'PayPal integration coming soon!');
  };

  const handlePaymentSuccess = (paymentResult) => {
    dispatch(clearCart());
    Alert.alert(
      'Payment Successful!',
      `Your payment has been processed successfully.\nOrder #${paymentResult.orderNo}`,
      [
        {
          text: 'Continue Shopping',
          onPress: () => {
            dispatch(resetPaymentState());
            navigation.navigate('HomeTab');
          },
        },
      ]
    );
  };

  const handlePaymentCancel = () => {
    dispatch(resetPaymentState());
    Alert.alert('Payment Cancelled', 'Your payment was cancelled. You can try again.');
  };

  const renderOrderSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Summary</Text>
      {items.map((item) => (
        <View key={`${item.id}-${item.size}`} style={styles.orderItem}>
          <Text style={styles.orderItemName}>
            {item.name} (Size: {item.size})
          </Text>
          <Text style={styles.orderItemPrice}>
            {item.quantity} x ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
          </Text>
        </View>
      ))}
      
      <View style={styles.orderTotal}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax:</Text>
          <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Shipping:</Text>
          <Text style={styles.totalValue}>Free</Text>
        </View>
        <View style={[styles.totalRow, styles.finalTotalRow]}>
          <Text style={styles.finalTotalLabel}>Total:</Text>
          <Text style={styles.finalTotalValue}>${finalTotal.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        {renderOrderSummary()}

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={shippingAddress.fullName}
            onChangeText={(value) => handleInputChange('shipping', 'fullName', value)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={shippingAddress.email}
            onChangeText={(value) => handleInputChange('shipping', 'email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={shippingAddress.phone}
            onChangeText={(value) => handleInputChange('shipping', 'phone', value)}
            keyboardType="phone-pad"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Street Address"
            value={shippingAddress.address}
            onChangeText={(value) => handleInputChange('shipping', 'address', value)}
          />
          
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="City"
              value={shippingAddress.city}
              onChangeText={(value) => handleInputChange('shipping', 'city', value)}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="State"
              value={shippingAddress.state}
              onChangeText={(value) => handleInputChange('shipping', 'state', value)}
            />
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="ZIP Code"
            value={shippingAddress.zipCode}
            onChangeText={(value) => handleInputChange('shipping', 'zipCode', value)}
            keyboardType="numeric"
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === PAYMENT_METHODS.YAGOUT_HOSTED && styles.selectedPaymentMethod
              ]}
              onPress={() => setPaymentMethod(PAYMENT_METHODS.YAGOUT_HOSTED)}
            >
              <Ionicons name="card" size={20} color="#333" />
              <Text style={styles.paymentMethodText}>YagoutPay (Hosted)</Text>
              <Text style={styles.paymentMethodSubtext}>Secure payment gateway</Text>
              {paymentMethod === PAYMENT_METHODS.YAGOUT_HOSTED && (
                <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === PAYMENT_METHODS.YAGOUT_API && styles.selectedPaymentMethod
              ]}
              onPress={() => setPaymentMethod(PAYMENT_METHODS.YAGOUT_API)}
            >
              <Ionicons name="wallet" size={20} color="#333" />
              <Text style={styles.paymentMethodText}>YagoutPay (TeleBirr)</Text>
              <Text style={styles.paymentMethodSubtext}>Pay with TeleBirr wallet</Text>
              {paymentMethod === PAYMENT_METHODS.YAGOUT_API && (
                <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === PAYMENT_METHODS.CREDIT_CARD && styles.selectedPaymentMethod
              ]}
              onPress={() => setPaymentMethod(PAYMENT_METHODS.CREDIT_CARD)}
            >
              <Ionicons name="card" size={20} color="#333" />
              <Text style={styles.paymentMethodText}>Credit Card</Text>
              <Text style={styles.paymentMethodSubtext}>Visa, Mastercard, Amex</Text>
              {paymentMethod === PAYMENT_METHODS.CREDIT_CARD && (
                <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === PAYMENT_METHODS.PAYPAL && styles.selectedPaymentMethod
              ]}
              onPress={() => setPaymentMethod(PAYMENT_METHODS.PAYPAL)}
            >
              <Ionicons name="logo-paypal" size={20} color="#333" />
              <Text style={styles.paymentMethodText}>PayPal</Text>
              <Text style={styles.paymentMethodSubtext}>Pay with PayPal account</Text>
              {paymentMethod === PAYMENT_METHODS.PAYPAL && (
                <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          </View>

          {paymentMethod === PAYMENT_METHODS.CREDIT_CARD && (
            <View style={styles.cardForm}>
              <TextInput
                style={styles.input}
                placeholder="Card Number (1234 5678 9012 3456)"
                value={cardDetails.cardNumber}
                onChangeText={(value) => {
                  // Format card number with spaces
                  const formatted = value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                  handleInputChange('payment', 'cardNumber', formatted);
                }}
                keyboardType="numeric"
                maxLength={19}
              />
              
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="MM/YY"
                  value={cardDetails.expiryDate}
                  onChangeText={(value) => {
                    // Format expiry date
                    let formatted = value.replace(/\D/g, '');
                    if (formatted.length >= 2) {
                      formatted = formatted.substring(0, 2) + '/' + formatted.substring(2, 4);
                    }
                    handleInputChange('payment', 'expiryDate', formatted);
                  }}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="CVV"
                  value={cardDetails.cvv}
                  onChangeText={(value) => handleInputChange('payment', 'cvv', value)}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
              
              <TextInput
                style={styles.input}
                placeholder="Cardholder Name"
                value={cardDetails.cardholderName}
                onChangeText={(value) => handleInputChange('payment', 'cardholderName', value)}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            (isProcessingPayment || paymentStatus === 'processing') && styles.disabledButton
          ]}
          onPress={handlePlaceOrder}
          disabled={isProcessingPayment || paymentStatus === 'processing'}
        >
          {isProcessingPayment || paymentStatus === 'processing' ? (
            <>
              <Text style={styles.placeOrderText}>Processing...</Text>
              <View style={styles.loadingSpinner}>
                <Text style={styles.loadingDots}>⋯</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.placeOrderText}>
                Place Order - ${finalTotal.toFixed(2)}
              </Text>
              <Ionicons name="checkmark-circle" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
        
        {/* Payment Method Info */}
        <View style={styles.paymentInfo}>
          <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
          <Text style={styles.paymentInfoText}>
            {paymentMethod === PAYMENT_METHODS.YAGOUT_HOSTED && 'Secured by YagoutPay Hosted Gateway'}
            {paymentMethod === PAYMENT_METHODS.YAGOUT_API && 'Secured by YagoutPay TeleBirr'}
            {paymentMethod === PAYMENT_METHODS.CREDIT_CARD && 'Secured by SSL Encryption'}
            {paymentMethod === PAYMENT_METHODS.PAYPAL && 'Secured by PayPal'}
          </Text>
        </View>
      </View>
      
      {/* YagoutPay WebView Modal */}
      <YagoutPayWebView
        onPaymentComplete={handlePaymentSuccess}
        onPaymentCancel={handlePaymentCancel}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    padding: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderItemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  orderItemPrice: {
    fontSize: 14,
    color: '#666',
  },
  orderTotal: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  finalTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 10,
  },
  finalTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  paymentMethods: {
    marginBottom: 20,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  selectedPaymentMethod: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff',
  },
  paymentMethodText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  paymentMethodSubtext: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
    marginTop: 2,
  },
  cardForm: {
    marginTop: 10,
  },
  bottomContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  placeOrderButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  placeOrderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  loadingSpinner: {
    marginLeft: 5,
  },
  loadingDots: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  paymentInfoText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
});

export default CheckoutScreen;