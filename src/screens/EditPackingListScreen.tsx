import CommonEditHeader, { HEADER_CONFIG } from "../components/CommonEditHeader";

export default function EditPackingListScreen() {
  // ... existing state and handlers ...

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
          { paddingTop: HEADER_CONFIG.MAX_HEIGHT }
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