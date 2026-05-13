import { useEffect, useRef } from "react";
import { Animated, Easing, Platform } from "react-native";
import type { PropsWithChildren } from "react";
import type { StyleProp, ViewStyle } from "react-native";

interface AnimatedEntranceProps extends PropsWithChildren {
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
}

const AnimatedEntrance = ({
  children,
  delay = 0,
  distance = 18,
  style
}: AnimatedEntranceProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;
  const useNativeDriver = Platform.OS !== "web";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 420,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver
      })
    ]).start();
  }, [delay, opacity, translateY, useNativeDriver]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }]
        }
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedEntrance;
