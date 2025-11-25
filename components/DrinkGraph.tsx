import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Drink, Gender } from '../types';

interface DrinkGraphProps {
  drinks: Drink[];
  firstHourBurn: number;
  subsequentHourBurn: number;
  weight: number;
  gender: Gender;
}

const DrinkGraph: React.FC<DrinkGraphProps> = ({ drinks, firstHourBurn, subsequentHourBurn, weight, gender }) => {
  const points = useMemo(() => {
    if (drinks.length === 0) return [];

    // Sort drinks by time
    const sortedDrinks = [...drinks].sort((a, b) => a.timestamp - b.timestamp);
    const startTime = sortedDrinks[0].timestamp;

    // Widmark Factor (r)
    // Approximate volume of distribution: Men ~0.68, Women ~0.55
    const r = gender === 'male' ? 0.68 : 0.55;

    // Helper: Convert Net Standard Drinks to BAC %
    const toBAC = (netSD: number) => {
      const w = weight > 0 ? weight : 1;
      return netSD / (w * r);
    };

    // Simulation config
    const stepsInMinutes = 10
    const stepMs = stepsInMinutes * 60 * 1000; // 5 min steps
    const stepBurnFirstHour = (firstHourBurn / 60) * stepsInMinutes;
    const stepBurnSubsequent = (subsequentHourBurn / 60) * stepsInMinutes;

    let currentNetSD = 0;
    let currentTime = startTime;
    let timeSinceStart = 0;

    const dataPoints: { time: number; bac: number; label: string }[] = [];

    const initialDrinks = sortedDrinks.filter(d => Math.abs(d.timestamp - startTime) < 1000);
    initialDrinks.forEach(d => currentNetSD += d.standardDrinks);

    dataPoints.push({
      time: startTime,
      bac: toBAC(currentNetSD),
      label: new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    const maxSteps = (24 * 60) / 5;
    let steps = 0;

    const lastDrinkTime = sortedDrinks[sortedDrinks.length - 1].timestamp;

    while (steps < maxSteps) {
      const nextTime = currentTime + stepMs;

      const drinksInInterval = sortedDrinks.filter(d => d.timestamp > currentTime && d.timestamp <= nextTime);
      for (const d of drinksInInterval) {
        currentNetSD += d.standardDrinks;
      }

      const burnAmount = (timeSinceStart < 60 * 60 * 1000) ? stepBurnFirstHour : stepBurnSubsequent;

      if (currentNetSD > 0) {
        currentNetSD -= burnAmount;
        if (currentNetSD < 0) currentNetSD = 0;
      }

      const currentBAC = toBAC(currentNetSD);

      dataPoints.push({
        time: nextTime,
        bac: currentBAC,
        label: new Date(nextTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      if (currentTime > lastDrinkTime && currentBAC <= 0.001) {
        break;
      }

      currentTime = nextTime;
      timeSinceStart += stepMs;
      steps++;
    }

    return dataPoints;
  }, [drinks, firstHourBurn, subsequentHourBurn, weight, gender]);

  const soberTimeInfo = useMemo(() => {
    if (points.length === 0) return null;

    let peakIndex = 0;
    for (let i = 1; i < points.length; i++) {
      if (points[i].bac > points[peakIndex].bac) peakIndex = i;
    }

    const peakBAC = points[peakIndex].bac;

    if (peakBAC < 0.05) return { status: 'under', peak: peakBAC };

    for (let i = peakIndex; i < points.length; i++) {
      if (points[i].bac <= 0.05) {
        return { status: 'over', peak: peakBAC, time: points[i].time, label: points[i].label };
      }
    }

    const lastP = points[points.length - 1];
    return { status: 'over', peak: peakBAC, time: lastP.time, label: lastP.label, projected: true };
  }, [points]);

  if (points.length < 2) return null;

  // Prepare chart data - sample every 5th point to avoid crowding
  const sampledPoints = points.length > 20 ? points.filter((_, i) => i % 5 === 0) : points;
  const chartLabels = sampledPoints.map(p => {
    const date = new Date(p.time);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  const chartData = {
    labels: [],//chartLabels.length > 0 ? chartLabels : ['Start'],
    datasets: [
      {
        data: sampledPoints.map(p => Math.min(p.bac, 0.2)), // Cap at 0.2 for better scaling
        color: () => '#2dd4bf',
        strokeWidth: 2,
      },
      {
        data: Array(sampledPoints.length).fill(0.05), // Reference line at 0.05
        color: () => '#f97316',
        strokeWidth: 1,
        strokeDasharray: [4, 4],
      },
    ],
  };

  const screenWidth = Dimensions.get('window').width;
  // Parent padding (16*2) + Container padding (16*2) = 64
  const chartWidth = screenWidth - 64;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Estimated BAC %</Text>
          {soberTimeInfo?.status === 'over' ? (
            <Text style={styles.timeLabel}>
              Below 0.05 at <Text style={styles.timeLabelBold}>{soberTimeInfo.label}</Text>
            </Text>
          ) : (
            <Text style={styles.timeLabelGreen}>Likely under 0.05 limit</Text>
          )}
        </View>
        <View style={styles.peakContainer}>
          <Text style={[
            styles.peakValue,
            { color: soberTimeInfo?.peak && soberTimeInfo.peak > 0.05 ? '#fed7aa' : '#14b8a6' }
          ]}>
            {soberTimeInfo?.peak?.toFixed(3) || '0.000'}
          </Text>
          <Text style={styles.peakLabel}>Peak BAC</Text>
        </View>
      </View>

      <LineChart
        data={chartData}
        width={chartWidth}
        height={200}
        yAxisLabel=""
        yAxisSuffix="%"
        chartConfig={{
          backgroundColor: '#1e293b',
          backgroundGradientFrom: '#1e293b',
          backgroundGradientTo: '#0f172a',
          decimalPlaces: 3,
          color: () => '#64748b',
          labelColor: () => '#94a3b8',
          strokeWidth: 2,
          propsForBackgroundLines: {
            stroke: '#334155',
            strokeWidth: 0.5,
            strokeDasharray: '4',
          },
        }}
        getDotProps={() => ({ visible: false })}
        style={styles.chart}
        withHorizontalLines
        withVerticalLines
        withInnerLines={false}
      />

      <View style={styles.footer}>
        <Text style={styles.timeMarker}>{points[0].label}</Text>
        <Text style={styles.timeMarker}>{points[points.length - 1].label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    padding: 16,
    marginBottom: 24,
    marginHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  timeLabel: {
    fontSize: 11,
    color: '#f97316',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  timeLabelBold: {
    fontWeight: '700',
    fontSize: 14,
  },
  timeLabelGreen: {
    fontSize: 11,
    color: '#14b8a6',
    marginTop: 4,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  peakContainer: {
    alignItems: 'flex-end',
  },
  peakValue: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
  },
  peakLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  chart: {
    marginVertical: 12,
    borderRadius: 8,
    paddingRight: 0,
  },
  limitIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#f97316',
  },
  limitLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f97316',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  timeMarker: {
    fontSize: 9,
    color: '#64748b',
    fontFamily: 'monospace',
  },
});

export default DrinkGraph;
