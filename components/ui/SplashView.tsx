import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Image, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import HuCampusLogo from './HuCampusLogo';

export default function SplashView() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(textAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Image
          source={require('../../assets/images/splash-hugo.gif')}
          style={styles.gif}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View style={[styles.textContainer, {
        opacity: textAnim,
        transform: [{
          translateY: textAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
        }],
      }]}>
        <HuCampusLogo width={180} />
        <Text style={styles.tagline}>Tu colegio en una app</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  gif: {
    width: 220,
    height: 220,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500',
    color: '#253570',
    marginTop: 6,
  },
});
