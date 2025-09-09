import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { addToCart } from '../store/cartSlice';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const dispatch = useDispatch();
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleAddToCart = () => {
    if (!selectedSize) {
      Alert.alert('Select Size', 'Please select a size before adding to cart.');
      return;
    }

    dispatch(addToCart({ 
      product: { 
        ...product, 
        selectedColor,
      }, 
      size: selectedSize 
    }));

    Alert.alert(
      'Added to Cart',
      `${product.name} (Size: ${selectedSize}) has been added to your cart.`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('CartTab') },
      ]
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color="#FFD700"
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Product Images */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: product.images[selectedImageIndex] }} 
          style={styles.mainImage} 
        />
        <View style={styles.imageIndicators}>
          {product.images.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.indicator,
                selectedImageIndex === index && styles.activeIndicator
              ]}
              onPress={() => setSelectedImageIndex(index)}
            />
          ))}
        </View>
      </View>

      <View style={styles.contentContainer}>
        {/* Product Info */}
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.name}>{product.name}</Text>
        
        {/* Rating */}
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {renderStars(product.rating)}
          </View>
          <Text style={styles.rating}>{product.rating}</Text>
          <Text style={styles.reviews}>({product.reviews} reviews)</Text>
        </View>

        {/* Price */}
        <Text style={styles.price}>{product.price.toFixed(2)} ETB</Text>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Colors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Colors</Text>
          <View style={styles.colorsContainer}>
            {product.colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  selectedColor === color && styles.selectedColorOption
                ]}
                onPress={() => setSelectedColor(color)}
              >
                <Text
                  style={[
                    styles.colorText,
                    selectedColor === color && styles.selectedColorText
                  ]}
                >
                  {color}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sizes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Size</Text>
          <View style={styles.sizesContainer}>
            {product.sizes.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizeOption,
                  selectedSize === size && styles.selectedSizeOption
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text
                  style={[
                    styles.sizeText,
                    selectedSize === size && styles.selectedSizeText
                  ]}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>Authentic Product</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="refresh" size={20} color="#2196F3" />
              <Text style={styles.featureText}>30-Day Returns</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="car" size={20} color="#FF9800" />
              <Text style={styles.featureText}>Free Shipping</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Add to Cart Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            !product.inStock && styles.disabledButton
          ]}
          onPress={handleAddToCart}
          disabled={!product.inStock}
        >
          <Ionicons 
            name="bag-add" 
            size={20} 
            color="white" 
            style={styles.buttonIcon} 
          />
          <Text style={styles.addToCartText}>
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: width,
    resizeMode: 'cover',
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#007AFF',
  },
  contentContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 100,
  },
  brand: {
    fontSize: 14,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 5,
  },
  reviews: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    marginBottom: 8,
  },
  selectedColorOption: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  colorText: {
    fontSize: 14,
    color: '#333',
  },
  selectedColorText: {
    color: 'white',
  },
  sizesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  selectedSizeOption: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedSizeText: {
    color: 'white',
  },
  featuresContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addToCartButton: {
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
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonIcon: {
    marginRight: 8,
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;