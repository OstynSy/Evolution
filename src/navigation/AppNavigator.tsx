import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainMenuScreen } from '../screens/MainMenuScreen';
import { CreatureCreatorScreen } from '../screens/CreatureCreatorScreen';
import { WorldScreen } from '../screens/WorldScreen';
import { CombatScreen } from '../screens/CombatScreen';
import { ColonyScreen } from '../screens/ColonyScreen';
import { EvolutionShopScreen } from '../screens/EvolutionShopScreen';

export type RootStackParamList = {
  MainMenu: undefined;
  Creator: undefined;
  World: undefined;
  Combat: { enemyEntityId: string; enemyTemplateId: string };
  Colony: undefined;
  EvolutionShop: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainMenu"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0D0D1A' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen name="Creator" component={CreatureCreatorScreen} />
        <Stack.Screen name="World" component={WorldScreen} />
        <Stack.Screen
          name="Combat"
          component={CombatScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Colony"
          component={ColonyScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="EvolutionShop"
          component={EvolutionShopScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
