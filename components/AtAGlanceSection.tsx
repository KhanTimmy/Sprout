import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SleepData, DiaperData } from '@/services/ChildService';

interface AtAGlanceSectionProps {
  sleeps: SleepData[];
  diapers: DiaperData[];
  loading: boolean;
}

const AtAGlanceSection = ({ sleeps, diapers, loading }: AtAGlanceSectionProps) => {
  // Calculate total sleep hours for today
  const calculateTodaySleepHours = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySleeps = sleeps.filter(sleep => {
      const sleepDate = new Date(sleep.start);
      sleepDate.setHours(0, 0, 0, 0);
      return sleepDate.getTime() === today.getTime();
    });

    let totalHours = 0;
    todaySleeps.forEach(sleep => {
      const durationMs = sleep.end.getTime() - sleep.start.getTime();
      totalHours += durationMs / (1000 * 60 * 60);
    });

    return totalHours.toFixed(1);
  };

  // Count diaper changes for today
  const countTodayDiaperChanges = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return diapers.filter(diaper => {
      const diaperDate = new Date(diaper.dateTime);
      diaperDate.setHours(0, 0, 0, 0);
      return diaperDate.getTime() === today.getTime();
    }).length;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading summary data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>At a Glance</Text>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{calculateTodaySleepHours()} hrs</Text>
          <Text style={styles.summaryLabel}>Sleep Today</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{countTodayDiaperChanges()}</Text>
          <Text style={styles.summaryLabel}>Diaper Changes Today</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default AtAGlanceSection; 