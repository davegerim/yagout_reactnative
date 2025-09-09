import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  setShowWebView,
  handleWebViewNavigation,
  resetPaymentState,
  selectYagoutPayState,
} from '../store/yagoutPaySlice';

const YagoutPayWebView = ({ onPaymentComplete, onPaymentCancel }) => {
  const dispatch = useDispatch();
  const webViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');
  
  const {
    showWebView,
    hostedPaymentData,
    currentOrderNo,
    paymentStatus,
  } = useSelector(selectYagoutPayState);

  const handleClose = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel the payment?',
      [
        { text: 'Continue Payment', style: 'cancel' },
        {
          text: 'Cancel Payment',
          style: 'destructive',
          onPress: () => {
            dispatch(setShowWebView(false));
            dispatch(resetPaymentState());
            onPaymentCancel && onPaymentCancel();
          },
        },
      ]
    );
  };

  const handleNavigationStateChange = (navState) => {
    const { url, loading } = navState;
    setCurrentUrl(url);
    setIsLoading(loading);

    // Handle navigation to success/failure URLs
    dispatch(handleWebViewNavigation({ url }));

    // Check for payment completion
    if (url.includes('success') || url.includes('Response.php')) {
      setTimeout(() => {
        dispatch(setShowWebView(false));
        onPaymentComplete && onPaymentComplete({
          orderNo: currentOrderNo,
          status: 'success',
          url,
        });
      }, 1000);
    } else if (url.includes('failure') || url.includes('error')) {
      setTimeout(() => {
        dispatch(setShowWebView(false));
        onPaymentCancel && onPaymentCancel({
          orderNo: currentOrderNo,
          status: 'failed',
          url,
        });
      }, 1000);
    }
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    
    Alert.alert(
      'Payment Error',
      'There was an error loading the payment page. Please try again.',
      [
        {
          text: 'Retry',
          onPress: () => webViewRef.current?.reload(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: handleClose,
        },
      ]
    );
  };

  const generateHTMLForm = () => {
    if (!hostedPaymentData) return '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>YagoutPay Payment</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .payment-form {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
          }
          .logo {
            margin-bottom: 20px;
          }
          .submit-btn {
            background-color: #007AFF;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
          }
          .submit-btn:hover {
            background-color: #0056CC;
          }
          .loading {
            margin-top: 20px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="payment-form">
          <div class="logo">
            <h2>YagoutPay Secure Payment</h2>
          </div>
          <form name="paymentForm" method="POST" 
                enctype="application/x-www-form-urlencoded" 
                action="${hostedPaymentData.post_url}">
            <input name="me_id" value="${hostedPaymentData.me_id}" type="hidden">
            <input name="merchant_request" value="${hostedPaymentData.merchant_request}" type="hidden">
            <input name="hash" value="${hostedPaymentData.hash}" type="hidden">
            <button type="submit" class="submit-btn">Proceed to Payment</button>
          </form>
          <div class="loading">
            <p>Order #${currentOrderNo}</p>
            <p>Redirecting to secure payment gateway...</p>
          </div>
        </div>
        
        <script>
          // Auto-submit the form after a short delay
          setTimeout(function() {
            document.forms['paymentForm'].submit();
          }, 2000);
        </script>
      </body>
      </html>
    `;
  };

  const injectedJavaScript = `
    // Inject JavaScript to handle form submission and navigation
    (function() {
      // Handle form submission
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        form.addEventListener('submit', function(e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'form_submit',
            action: form.action,
            data: new FormData(form)
          }));
        });
      });
      
      // Monitor URL changes
      let lastUrl = window.location.href;
      setInterval(function() {
        if (window.location.href !== lastUrl) {
          lastUrl = window.location.href;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'url_change',
            url: lastUrl
          }));
        }
      }, 1000);
    })();
    true;
  `;

  const handleMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'form_submit') {
        console.log('Form submitted to:', message.action);
      } else if (message.type === 'url_change') {
        console.log('URL changed to:', message.url);
        setCurrentUrl(message.url);
      }
    } catch (error) {
      console.warn('Failed to parse WebView message:', error);
    }
  };

  if (!showWebView || !hostedPaymentData) {
    return null;
  }

  return (
    <Modal
      visible={showWebView}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>YagoutPay Payment</Text>
          <View style={styles.placeholder} />
        </View>
        
        {/* URL Bar */}
        <View style={styles.urlBar}>
          <Ionicons 
            name={currentUrl.includes('https') ? "lock-closed" : "globe"} 
            size={16} 
            color="#666" 
          />
          <Text style={styles.urlText} numberOfLines={1}>
            {currentUrl || 'Loading...'}
          </Text>
        </View>
        
        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading payment page...</Text>
          </View>
        )}
        
        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ html: generateHTMLForm() }}
          style={styles.webView}
          onNavigationStateChange={handleNavigationStateChange}
          onError={handleError}
          onMessage={handleMessage}
          injectedJavaScript={injectedJavaScript}
          startInLoadingState={true}
          domStorageEnabled={true}
          javaScriptEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          scalesPageToFit={true}
          bounces={false}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          )}
        />
        
        {/* Bottom Status */}
        <View style={styles.bottomStatus}>
          <Text style={styles.statusText}>
            Order #{currentOrderNo} • Secure Payment
          </Text>
          <View style={styles.securityIndicator}>
            <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
            <Text style={styles.securityText}>Secured by YagoutPay</Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  urlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  urlText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  bottomStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  securityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
});

export default YagoutPayWebView;