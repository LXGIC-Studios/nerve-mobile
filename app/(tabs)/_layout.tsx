import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { colors } from '../../src/theme/colors';
import {
  LightningIcon,
  MarketsIcon,
  PortfolioIcon,
  DashboardIcon,
  MoreIcon,
} from '../../src/components/icons';

function TabIcon({ icon, focused }: { icon: React.ReactNode; focused: boolean }) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconFocused]}>
      {icon}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgSecondary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trade',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={<LightningIcon size={20} color={focused ? colors.accent : colors.tabInactive} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          title: 'Markets',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={<MarketsIcon size={20} color={focused ? colors.accent : colors.tabInactive} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={<PortfolioIcon size={20} color={focused ? colors.accent : colors.tabInactive} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={<DashboardIcon size={20} color={focused ? colors.accent : colors.tabInactive} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'More',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={<MoreIcon size={20} color={focused ? colors.accent : colors.tabInactive} />}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  iconFocused: {
    backgroundColor: colors.accentGlow,
  },
});
