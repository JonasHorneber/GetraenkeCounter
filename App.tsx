"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Dimensions, ScrollView } from "react-native"
import { type BeverageType, type ServingSize, BEVERAGE_TYPES, SERVING_SIZES } from "./types/beverage"

const { width } = Dimensions.get("window")

export default function App() {
  const [beverages, setBeverages] = useState<BeverageType[]>(BEVERAGE_TYPES)
  const [selectedBeverage, setSelectedBeverage] = useState<string>("water")
  const [selectedServingSize, setSelectedServingSize] = useState<string>("medium")
  const [showKeypad, setShowKeypad] = useState(false)

  const currentBeverage = beverages.find((b) => b.id === selectedBeverage)!
  const currentServingSize = SERVING_SIZES.find((s) => s.id === selectedServingSize)!
  const totalCount = beverages.reduce((sum, b) => sum + b.count, 0)
  const totalVolume = beverages.reduce((sum, b) => sum + b.totalVolume, 0)

  const updateBeverageCount = (id: string, countChange: number, volumeChange: number) => {
    setBeverages((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              count: Math.max(0, b.count + countChange),
              totalVolume: Math.max(0, b.totalVolume + volumeChange),
            }
          : b,
      ),
    )
  }

  const increment = () => {
    updateBeverageCount(selectedBeverage, 1, currentServingSize.volume)
  }

  const decrement = () => {
    if (currentBeverage.count > 0) {
      updateBeverageCount(selectedBeverage, -1, -currentServingSize.volume)
    }
  }

  const handleNumberPress = (num: number) => {
    const currentCount = currentBeverage.count
    let newCount: number

    if (currentCount === 0) {
      newCount = num
    } else {
      newCount = Number.parseInt(`${currentCount}${num}`)
      if (newCount > 999) return
    }

    const countDifference = newCount - currentCount
    const volumeDifference = countDifference * currentServingSize.volume
    updateBeverageCount(selectedBeverage, countDifference, volumeDifference)
  }

  const clearCount = () => {
    updateBeverageCount(selectedBeverage, -currentBeverage.count, -currentBeverage.totalVolume)
  }

  const clearAllCounts = () => {
    setBeverages((prev) => prev.map((b) => ({ ...b, count: 0, totalVolume: 0 })))
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}L`
    }
    return `${volume}ml`
  }

  const renderKeypadButton = (num: number) => (
    <TouchableOpacity key={num} style={styles.keypadButton} onPress={() => handleNumberPress(num)} activeOpacity={0.7}>
      <Text style={styles.keypadButtonText}>{num}</Text>
    </TouchableOpacity>
  )

  const renderBeverageCard = (beverage: BeverageType) => {
    const isSelected = beverage.id === selectedBeverage
    return (
      <TouchableOpacity
        key={beverage.id}
        style={[styles.beverageCard, isSelected && { ...styles.selectedCard, borderColor: beverage.color }]}
        onPress={() => setSelectedBeverage(beverage.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.beverageIcon}>{beverage.icon}</Text>
        <Text style={[styles.beverageName, isSelected && { color: beverage.color }]}>{beverage.name}</Text>
        <Text style={[styles.beverageCount, { color: beverage.color }]}>{beverage.count}</Text>
        <Text style={styles.beverageVolume}>{formatVolume(beverage.totalVolume)}</Text>
      </TouchableOpacity>
    )
  }

  const renderServingSizeButton = (servingSize: ServingSize) => {
    const isSelected = servingSize.id === selectedServingSize
    return (
      <TouchableOpacity
        key={servingSize.id}
        style={[
          styles.servingSizeButton,
          isSelected && { ...styles.selectedServingSize, backgroundColor: currentBeverage.color },
        ]}
        onPress={() => setSelectedServingSize(servingSize.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.servingSizeText, isSelected && styles.selectedServingSizeText]}>{servingSize.name}</Text>
        <Text style={[styles.servingVolumeText, isSelected && styles.selectedServingSizeText]}>
          {servingSize.volume}ml
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Beverage Counter</Text>
        <View style={styles.totalContainer}>
          <View style={styles.totalRow}>
            <View style={styles.totalItem}>
              <Text style={styles.totalLabel}>Total Drinks</Text>
              <Text style={styles.totalCount}>{totalCount}</Text>
            </View>
            <View style={styles.totalItem}>
              <Text style={styles.totalLabel}>Total Volume</Text>
              <Text style={styles.totalCount}>{formatVolume(totalVolume)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Beverage Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesScroll}
      >
        {beverages.map(renderBeverageCard)}
      </ScrollView>

      {/* Serving Size Selection */}
      <View style={styles.servingSizeContainer}>
        <Text style={styles.servingSizeLabel}>Serving Size</Text>
        <View style={styles.servingSizeButtons}>{SERVING_SIZES.map(renderServingSizeButton)}</View>
      </View>

      {/* Selected Beverage Display */}
      <View style={styles.selectedBeverageContainer}>
        <Text style={styles.selectedBeverageIcon}>{currentBeverage.icon}</Text>
        <Text style={[styles.selectedBeverageName, { color: currentBeverage.color }]}>{currentBeverage.name}</Text>
        <Text style={[styles.counterText, { color: currentBeverage.color }]}>{currentBeverage.count}</Text>
        <Text style={styles.volumeText}>{formatVolume(currentBeverage.totalVolume)}</Text>
        <Text style={styles.servingInfo}>
          {currentServingSize.name} ({currentServingSize.volume}ml per serving)
        </Text>
      </View>

      {/* Main Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.mainButton, { backgroundColor: "#e74c3c" }]}
          onPress={decrement}
          activeOpacity={0.8}
        >
          <Text style={styles.mainButtonText}>−</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainButton, { backgroundColor: currentBeverage.color }]}
          onPress={increment}
          activeOpacity={0.8}
        >
          <Text style={styles.mainButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowKeypad(!showKeypad)} activeOpacity={0.7}>
          <Text style={styles.actionButtonText}>{showKeypad ? "Hide Keypad" : "Show Keypad"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.clearAllButton]}
          onPress={clearAllCounts}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionButtonText, styles.clearAllButtonText]}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Numeric Keypad */}
      {showKeypad && (
        <View style={styles.keypadContainer}>
          <View style={styles.keypadGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(renderKeypadButton)}
            <TouchableOpacity
              style={[styles.keypadButton, styles.clearButton]}
              onPress={clearCount}
              activeOpacity={0.7}
            >
              <Text style={[styles.keypadButtonText, styles.clearButtonText]}>C</Text>
            </TouchableOpacity>
            {renderKeypadButton(0)}
            <View style={styles.keypadButton} />
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "300",
    color: "#333333",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  totalContainer: {
    alignItems: "center",
  },
  totalRow: {
    flexDirection: "row",
    gap: 30,
  },
  totalItem: {
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "300",
  },
  totalCount: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c3e50",
  },
  categoriesScroll: {
    maxHeight: 140,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  beverageCard: {
    width: 85,
    height: 120,
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
    paddingVertical: 8,
  },
  selectedCard: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  beverageIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  beverageName: {
    fontSize: 11,
    fontWeight: "500",
    color: "#333333",
    textAlign: "center",
    marginBottom: 2,
  },
  beverageCount: {
    fontSize: 16,
    fontWeight: "600",
  },
  beverageVolume: {
    fontSize: 10,
    color: "#7f8c8d",
    fontWeight: "400",
    marginTop: 2,
  },
  servingSizeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
  },
  servingSizeLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "500",
    marginBottom: 10,
  },
  servingSizeButtons: {
    flexDirection: "row",
    gap: 12,
  },
  servingSizeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    minWidth: 80,
  },
  selectedServingSize: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  servingSizeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333333",
  },
  servingVolumeText: {
    fontSize: 10,
    color: "#7f8c8d",
    marginTop: 1,
  },
  selectedServingSizeText: {
    color: "#ffffff",
  },
  selectedBeverageContainer: {
    alignItems: "center",
    paddingVertical: 20,
    flex: 1,
    justifyContent: "center",
  },
  selectedBeverageIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  selectedBeverageName: {
    fontSize: 18,
    fontWeight: "400",
    marginBottom: 12,
  },
  counterText: {
    fontSize: 60,
    fontWeight: "200",
    marginBottom: 4,
  },
  volumeText: {
    fontSize: 18,
    color: "#7f8c8d",
    fontWeight: "400",
    marginBottom: 8,
  },
  servingInfo: {
    fontSize: 12,
    color: "#95a5a6",
    fontWeight: "300",
    textAlign: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 20,
    gap: 40,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainButtonText: {
    fontSize: 36,
    color: "#ffffff",
    fontWeight: "300",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 20,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  actionButtonText: {
    fontSize: 14,
    color: "#3498db",
    fontWeight: "500",
  },
  clearAllButton: {
    backgroundColor: "#fee",
  },
  clearAllButtonText: {
    color: "#e74c3c",
  },
  keypadContainer: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  keypadGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  keypadButton: {
    width: (width - 80) / 3 - 8,
    height: 60,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  keypadButtonText: {
    fontSize: 24,
    color: "#2c3e50",
    fontWeight: "400",
  },
  clearButton: {
    backgroundColor: "#e74c3c",
  },
  clearButtonText: {
    color: "#ffffff",
    fontWeight: "500",
  },
})
