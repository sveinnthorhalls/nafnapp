import React from 'react';
import { StyleSheet, Text, View, Dimensions, Platform } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Reanimated, { 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  runOnJS 
} from 'react-native-reanimated';
import { NameData } from '../utils/firebaseNamesManager';
import { FirebaseNameData } from '../utils/firebaseNamesManager';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;

type NameCardProps = {
  name: NameData | FirebaseNameData;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

const NameCard: React.FC<NameCardProps> = ({ name, onSwipeLeft, onSwipeRight }) => {
  const translateX = useSharedValue(0);
  const cardRotation = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  const panGestureEvent = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onActive: (event) => {
      translateX.value = event.translationX;
      // Calculate rotation based on swipe distance (max ±15 degrees)
      cardRotation.value = (event.translationX / width) * 15;
    },
    onEnd: (event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swiped right (like)
        translateX.value = withSpring(width * 1.5);
        cardOpacity.value = withSpring(0);
        runOnJS(onSwipeRight)();
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swiped left (dislike)
        translateX.value = withSpring(-width * 1.5);
        cardOpacity.value = withSpring(0);
        runOnJS(onSwipeLeft)();
      } else {
        // Return to center
        translateX.value = withSpring(0);
        cardRotation.value = withSpring(0);
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { rotateZ: `${cardRotation.value}deg` }
      ],
      opacity: cardOpacity.value,
    };
  });

  if (Platform.OS === 'web') {
    return (
      <div
        onMouseDown={(e) => {
          const startX = e.clientX;
          const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            translateX.value = deltaX;
            cardRotation.value = (deltaX / width) * 15;
          };
          const handleMouseUp = (upEvent: MouseEvent) => {
            const deltaX = upEvent.clientX - startX;
            if (deltaX > SWIPE_THRESHOLD) {
              translateX.value = withSpring(width * 1.5);
              cardOpacity.value = withSpring(0);
              onSwipeRight();
            } else if (deltaX < -SWIPE_THRESHOLD) {
              translateX.value = withSpring(-width * 1.5);
              cardOpacity.value = withSpring(0);
              onSwipeLeft();
            } else {
              translateX.value = withSpring(0);
              cardRotation.value = withSpring(0);
            }
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
        style={styles.card}
      >
        <Text style={styles.nameText}>{name.name}</Text>
      </div>
    );
  }

  return (
    <PanGestureHandler onGestureEvent={panGestureEvent}>
      <Reanimated.View style={[styles.card, cardStyle]}>
        <Text style={styles.nameText}>{name.name}</Text>
        <View style={styles.actionHints}>
          <Text style={styles.hintText}>← Swipe left to skip</Text>
          <Text style={styles.hintText}>Swipe right to like →</Text>
        </View>
      </Reanimated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 20,
  },
  nameText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  actionHints: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  hintText: {
    fontSize: 14,
    color: '#999',
  },
});

export default NameCard;