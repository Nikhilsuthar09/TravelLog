import { COLORS } from "@constants/theme";
import CommonEditHeader, { HEADER_CONFIG } from "../components/CommonEditHeader";
import { Animated, StatusBar, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export default function EditPackingListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const scrollY = new Animated.Value(0);

  const handleSave = () => {
    // Your existing save logic here
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      
      {/* Custom Animated Header */}
      <CommonEditHeader
        scrollY={scrollY}
        title="Packing List"
        onBackPress={() => navigation.goBack()}
        onSavePress={handleSave}
      />

      {/* Main Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { 
            useNativeDriver: false,
            listener: (event) => {
              // Optional: Add any additional scroll handling here
            }
          }
        )}
        scrollEventThrottle={1}
        contentContainerStyle={[
          styles.content,
          { paddingTop: HEADER_CONFIG.HEIGHT }
        ]}
      >
        {/* ... rest of the content ... */}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: HEADER_CONFIG.HEIGHT + 16, // Add padding to account for header height
  },
});

// ... existing styles ... 