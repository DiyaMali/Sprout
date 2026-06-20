import { ActivityOption } from './types';

// Carbon equivalencies for AI nudges and context
// Sources are approximate values from EPA and standard carbon calculators.
export const EQUIVALENCIES = [
  { co2e: 1.0, equivalent: 'using a laptop for an entire day', source: 'EPA' },
  { co2e: 2.5, equivalent: 'a gallon of gasoline burned', source: 'EPA' },
  {
    co2e: 0.1,
    equivalent: 'fully charging your smartphone 12 times',
    source: 'EPA',
  },
  {
    co2e: 5.0,
    equivalent: 'eating a quarter-pound beef burger',
    source: 'Our World in Data',
  },
  { co2e: 0.5, equivalent: 'running an AC unit for an hour', source: 'EIA' },
];

export const ACTIVITY_OPTIONS: ActivityOption[] = [
  // Transport
  {
    id: 't_walk',
    label: 'Walked or Biked',
    category: 'transport',
    emissionsValue: 0,
  },
  {
    id: 't_transit',
    label: 'Public Transit',
    category: 'transport',
    emissionsValue: 1.2,
  }, // approx per trip
  {
    id: 't_carpool',
    label: 'Carpooled',
    category: 'transport',
    emissionsValue: 2.0,
  },
  {
    id: 't_drive',
    label: 'Drove Alone',
    category: 'transport',
    emissionsValue: 4.5,
  },
  {
    id: 't_flight',
    label: 'Took a Flight',
    category: 'transport',
    emissionsValue: 50.0,
  }, // large penalty

  // Meal
  { id: 'm_vegan', label: 'Vegan Meal', category: 'meal', emissionsValue: 0.5 },
  {
    id: 'm_veg',
    label: 'Vegetarian Meal',
    category: 'meal',
    emissionsValue: 0.8,
  },
  {
    id: 'm_chicken',
    label: 'Chicken/Fish',
    category: 'meal',
    emissionsValue: 1.5,
  },
  { id: 'm_beef', label: 'Beef/Lamb', category: 'meal', emissionsValue: 5.5 },
  {
    id: 'm_foodwaste',
    label: 'Wasted Food',
    category: 'meal',
    emissionsValue: 2.0,
  },

  // Energy
  {
    id: 'e_off',
    label: 'Lights/AC Off',
    category: 'energy',
    emissionsValue: 0,
  },
  {
    id: 'e_eco',
    label: 'Eco-Mode Used',
    category: 'energy',
    emissionsValue: 0.5,
  },
  {
    id: 'e_normal',
    label: 'Average Usage',
    category: 'energy',
    emissionsValue: 2.0,
  },
  {
    id: 'e_high',
    label: 'High AC/Heater',
    category: 'energy',
    emissionsValue: 4.0,
  },
  {
    id: 'e_left_on',
    label: 'Left Everything On',
    category: 'energy',
    emissionsValue: 6.0,
  },

  // Shopping
  {
    id: 's_none',
    label: 'Bought Nothing',
    category: 'shopping',
    emissionsValue: 0,
  },
  {
    id: 's_secondhand',
    label: 'Thrifted',
    category: 'shopping',
    emissionsValue: 0.5,
  },
  {
    id: 's_local',
    label: 'Local Goods',
    category: 'shopping',
    emissionsValue: 1.5,
  },
  {
    id: 's_online',
    label: 'Online Delivery',
    category: 'shopping',
    emissionsValue: 3.0,
  },
  {
    id: 's_fastfashion',
    label: 'Fast Fashion',
    category: 'shopping',
    emissionsValue: 6.0,
  },
];
