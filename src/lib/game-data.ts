import type { Item } from '@/types/game';

// Balanced ROI tiers:
// Tier 1 (0-3): ROI 60 - Beginner friendly
// Tier 2 (4-7): ROI 70 - Early growth
// Tier 3 (8-11): ROI 80 - Steady progress
// Tier 4 (12-15): ROI 90 - Challenge begins
// Tier 5 (16-19): ROI 100 - Balance point
// Tier 6 (20-23): ROI 100 - Consistent
// Tier 7 (24-27): ROI 110 - Late game
// Tier 8 (28-31): ROI 110 - End game
// Tier 9 (32-37): ROI 120 - Final tier

export const initialItems: Item[] = [
    // Tier 1: Beginner (ROI 60)
    { id: 'item_0', name: 'Moka Pot', type: 'bps', basePrice: 30, val: 1, owned: 0, icon: 'ph_0', description: 'item_0_desc' },
    { id: 'item_1', name: 'Rubber Gloves', type: 'click', basePrice: 60, val: 1, owned: 0, icon: 'ph_1', description: 'item_1_desc' },
    { id: 'item_2', name: 'Home Machine', type: 'bps', basePrice: 500, val: 8, owned: 0, icon: 'ph_2', description: 'item_2_desc' },
    { id: 'item_3', name: 'Bean Hammer', type: 'click', basePrice: 1000, val: 17, owned: 0, icon: 'ph_3', description: 'item_3_desc' },

    // Tier 2: Startup (ROI 70)
    { id: 'item_4', name: 'Commercial Machine', type: 'bps', basePrice: 3000, val: 43, owned: 0, icon: 'ph_4', description: 'item_4_desc' },
    { id: 'item_5', name: 'Hand Roaster', type: 'click', basePrice: 6000, val: 86, owned: 0, icon: 'ph_5', description: 'item_5_desc' },
    { id: 'item_6', name: 'Franchise', type: 'bps', basePrice: 20000, val: 286, owned: 0, icon: 'ph_6', description: 'item_6_desc' },
    { id: 'item_7', name: 'Barista Lv.1', type: 'click', basePrice: 40000, val: 571, owned: 0, icon: 'ph_7', description: 'item_7_desc' },

    // Tier 3: Corporate (ROI 80)
    { id: 'item_8', name: 'Smart Factory', type: 'bps', basePrice: 300000, val: 3750, owned: 0, icon: 'ph_8', description: 'item_8_desc' },
    { id: 'item_9', name: 'Electric Gloves', type: 'click', basePrice: 600000, val: 7500, owned: 0, icon: 'ph_9', description: 'item_9_desc' },
    { id: 'item_10', name: 'Bean Trading Ship', type: 'bps', basePrice: 5000000, val: 62500, owned: 0, icon: 'ph_10', description: 'item_10_desc' },
    { id: 'item_11', name: 'Cyborg Arm', type: 'click', basePrice: 10000000, val: 125000, owned: 0, icon: 'ph_11', description: 'item_11_desc' },

    // Tier 4: Empire (ROI 90)
    { id: 'item_12', name: 'Coffee Empire HQ', type: 'bps', basePrice: 100000000, val: 1111111, owned: 0, icon: 'ph_12', description: 'item_12_desc' },
    { id: 'item_13', name: 'Mutant Hand', type: 'click', basePrice: 250000000, val: 2777778, owned: 0, icon: 'ph_13', description: 'item_13_desc' },
    { id: 'item_14', name: 'AI Legion', type: 'bps', basePrice: 3000000000, val: 33333333, owned: 0, icon: 'ph_14', description: 'item_14_desc' },
    { id: 'item_15', name: 'Brainwave Roasting', type: 'click', basePrice: 6000000000, val: 66666667, owned: 0, icon: 'ph_15', description: 'item_15_desc' },

    // Tier 5: Tech (ROI 100)
    { id: 'item_16', name: 'Rainmaking Satellite', type: 'bps', basePrice: 80000000000, val: 800000000, owned: 0, icon: 'ph_16', description: 'item_16_desc' },
    { id: 'item_17', name: 'Magma Touch', type: 'click', basePrice: 150000000000, val: 1500000000, owned: 0, icon: 'ph_17', description: 'item_17_desc' },
    { id: 'item_18', name: 'Moon Drying Yard', type: 'bps', basePrice: 4000000000000, val: 40000000000, owned: 0, icon: 'ph_18', description: 'item_18_desc' },
    { id: 'item_19', name: 'Meteor Strike', type: 'click', basePrice: 8000000000000, val: 80000000000, owned: 0, icon: 'ph_19', description: 'item_19_desc' },

    // Tier 6: Space (ROI 100)
    { id: 'item_20', name: 'Fusion Boiler', type: 'bps', basePrice: 150000000000000, val: 1500000000000, owned: 0, icon: 'ph_20', description: 'item_20_desc' },
    { id: 'item_21', name: 'Solar Flare Punch', type: 'click', basePrice: 300000000000000, val: 3000000000000, owned: 0, icon: 'ph_21', description: 'item_21_desc' },
    { id: 'item_22', name: 'Black Hole Grinder', type: 'bps', basePrice: 7000000000000000, val: 70000000000000, owned: 0, icon: 'ph_22', description: 'item_22_desc' },
    { id: 'item_23', name: 'Warp Click', type: 'click', basePrice: 15000000000000000, val: 150000000000000, owned: 0, icon: 'ph_23', description: 'item_23_desc' },

    // Tier 7: Dimensional (ROI 110)
    { id: 'item_24', name: 'Big Bang Roaster', type: 'bps', basePrice: 300000000000000000, val: 2727272727272727, owned: 0, icon: 'ph_24', description: 'item_24_desc' },
    { id: 'item_25', name: 'Reality Manipulation', type: 'click', basePrice: 600000000000000000, val: 5454545454545455, owned: 0, icon: 'ph_25', description: 'item_25_desc' },
    { id: 'item_26', name: 'Time Machine Delivery', type: 'bps', basePrice: 10000000000000000000, val: 90909090909090909, owned: 0, icon: 'ph_26', description: 'item_26_desc' },
    { id: 'item_27', name: 'Time Reversal', type: 'click', basePrice: 16000000000000000000, val: 145454545454545455, owned: 0, icon: 'ph_27', description: 'item_27_desc' },

    // Tier 8: Mythical (ROI 110)
    { id: 'item_28', name: 'Multiverse Chain', type: 'bps', basePrice: 500000000000000000000, val: 4545454545454545455, owned: 0, icon: 'ph_28', description: 'item_28_desc' },
    { id: 'item_29', name: 'Doppelgänger Worker', type: 'click', basePrice: 1000000000000000000000, val: 9090909090909090909, owned: 0, icon: 'ph_29', description: 'item_29_desc' },
    { id: 'item_30', name: 'Idea Roasting', type: 'bps', basePrice: 15000000000000000000000, val: 136363636363636363636, owned: 0, icon: 'ph_30', description: 'item_30_desc' },
    { id: 'item_31', name: 'Infinite Spoon', type: 'click', basePrice: 40000000000000000000000, val: 363636363636363636364, owned: 0, icon: 'ph_31', description: 'item_31_desc' },

    // Tier 9: Transcendent (ROI 120)
    { id: 'item_32', name: 'Developer Console', type: 'bps', basePrice: 100000000000000000000000, val: 833333333333333333333, owned: 0, icon: 'ph_32', description: 'item_32_desc' },
    { id: 'item_33', name: 'God of the Game', type: 'click', basePrice: 150000000000000000000000, val: 1250000000000000000000, owned: 0, icon: 'ph_33', description: 'item_33_desc' },
    { id: 'item_34', name: 'Planet Devourer', type: 'bps', basePrice: 5000000000000000000000000, val: 41666666666666666666667, owned: 0, icon: 'ph_34', description: 'item_34_desc' },
    { id: 'item_35', name: 'Cosmic Touch', type: 'click', basePrice: 10000000000000000000000000, val: 83333333333333333333333, owned: 0, icon: 'ph_35', description: 'item_35_desc' },
    { id: 'item_36', name: 'Eternal Time', type: 'bps', basePrice: 200000000000000000000000000, val: 1666666666666666666666667, owned: 0, icon: 'ph_36', description: 'item_36_desc' },
    { id: 'item_37', name: 'Creator\'s Touch', type: 'click', basePrice: 500000000000000000000000000, val: 4166666666666666666666667, owned: 0, icon: 'ph_37', description: 'item_37_desc' }
];

export const levels = ['Intern', 'Junior', 'Associate', 'Manager', 'Senior Manager', 'Director', 'VP', 'CEO', 'Coffee Mogul', 'Bean Minister', 'Planet President', 'Solar System Admin', 'Galaxy Overlord', 'Master of the Universe', 'The Coffee God'];
