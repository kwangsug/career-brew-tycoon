import type { Item } from '@/types/game';

// Decreasing ROI progression (rewards late-game progression)
// ROI = basePrice / val (lower = more efficient)
// Early game: ROI ~120 (slower start)
// Late game: ROI ~50 (rewarding progression)

export const initialItems: Item[] = [
    // ROI 120 - Early game (slow start)
    { id: 'item_0', name: 'Moka Pot', type: 'bps', basePrice: 30, val: 1, owned: 0, icon: 'ph_0', description: 'item_0_desc' },
    { id: 'item_1', name: 'Rubber Gloves', type: 'click', basePrice: 60, val: 1, owned: 0, icon: 'ph_1', description: 'item_1_desc' },
    // ROI 115
    { id: 'item_2', name: 'Home Machine', type: 'bps', basePrice: 500, val: 4, owned: 0, icon: 'ph_2', description: 'item_2_desc' },
    { id: 'item_3', name: 'Bean Hammer', type: 'click', basePrice: 1000, val: 9, owned: 0, icon: 'ph_3', description: 'item_3_desc' },
    // ROI 110
    { id: 'item_4', name: 'Commercial Machine', type: 'bps', basePrice: 3000, val: 27, owned: 0, icon: 'ph_4', description: 'item_4_desc' },
    { id: 'item_5', name: 'Hand Roaster', type: 'click', basePrice: 6000, val: 55, owned: 0, icon: 'ph_5', description: 'item_5_desc' },
    // ROI 105
    { id: 'item_6', name: 'Franchise', type: 'bps', basePrice: 20000, val: 190, owned: 0, icon: 'ph_6', description: 'item_6_desc' },
    { id: 'item_7', name: 'Barista Lv.1', type: 'click', basePrice: 40000, val: 381, owned: 0, icon: 'ph_7', description: 'item_7_desc' },
    // ROI 100
    { id: 'item_8', name: 'Smart Factory', type: 'bps', basePrice: 300000, val: 3000, owned: 0, icon: 'ph_8', description: 'item_8_desc' },
    { id: 'item_9', name: 'Electric Gloves', type: 'click', basePrice: 600000, val: 6000, owned: 0, icon: 'ph_9', description: 'item_9_desc' },
    // ROI 95
    { id: 'item_10', name: 'Bean Trading Ship', type: 'bps', basePrice: 5000000, val: 52632, owned: 0, icon: 'ph_10', description: 'item_10_desc' },
    { id: 'item_11', name: 'Cyborg Arm', type: 'click', basePrice: 10000000, val: 105263, owned: 0, icon: 'ph_11', description: 'item_11_desc' },
    // ROI 90
    { id: 'item_12', name: 'Coffee Empire HQ', type: 'bps', basePrice: 100000000, val: 1111111, owned: 0, icon: 'ph_12', description: 'item_12_desc' },
    { id: 'item_13', name: 'Mutant Hand', type: 'click', basePrice: 250000000, val: 2777778, owned: 0, icon: 'ph_13', description: 'item_13_desc' },
    // ROI 85
    { id: 'item_14', name: 'AI Legion', type: 'bps', basePrice: 3000000000, val: 35294118, owned: 0, icon: 'ph_14', description: 'item_14_desc' },
    { id: 'item_15', name: 'Brainwave Roasting', type: 'click', basePrice: 6000000000, val: 70588235, owned: 0, icon: 'ph_15', description: 'item_15_desc' },
    // ROI 80
    { id: 'item_16', name: 'Rainmaking Satellite', type: 'bps', basePrice: 80000000000, val: 1000000000, owned: 0, icon: 'ph_16', description: 'item_16_desc' },
    { id: 'item_17', name: 'Magma Touch', type: 'click', basePrice: 150000000000, val: 1875000000, owned: 0, icon: 'ph_17', description: 'item_17_desc' },
    // ROI 75
    { id: 'item_18', name: 'Moon Drying Yard', type: 'bps', basePrice: 4000000000000, val: 53333333333, owned: 0, icon: 'ph_18', description: 'item_18_desc' },
    { id: 'item_19', name: 'Meteor Strike', type: 'click', basePrice: 8000000000000, val: 106666666667, owned: 0, icon: 'ph_19', description: 'item_19_desc' },
    // ROI 70
    { id: 'item_20', name: 'Fusion Boiler', type: 'bps', basePrice: 150000000000000, val: 2142857142857, owned: 0, icon: 'ph_20', description: 'item_20_desc' },
    { id: 'item_21', name: 'Solar Flare Punch', type: 'click', basePrice: 300000000000000, val: 4285714285714, owned: 0, icon: 'ph_21', description: 'item_21_desc' },
    { id: 'item_22', name: 'Black Hole Grinder', type: 'bps', basePrice: 7000000000000000, val: 100000000000000, owned: 0, icon: 'ph_22', description: 'item_22_desc' },
    { id: 'item_23', name: 'Warp Click', type: 'click', basePrice: 15000000000000000, val: 214285714285714, owned: 0, icon: 'ph_23', description: 'item_23_desc' },
    // ROI 65
    { id: 'item_24', name: 'Big Bang Roaster', type: 'bps', basePrice: 300000000000000000, val: 4615384615384615, owned: 0, icon: 'ph_24', description: 'item_24_desc' },
    { id: 'item_25', name: 'Reality Manipulation', type: 'click', basePrice: 600000000000000000, val: 9230769230769231, owned: 0, icon: 'ph_25', description: 'item_25_desc' },
    { id: 'item_26', name: 'Time Machine Delivery', type: 'bps', basePrice: 10000000000000000000, val: 153846153846153846, owned: 0, icon: 'ph_26', description: 'item_26_desc' },
    { id: 'item_27', name: 'Time Reversal', type: 'click', basePrice: 16000000000000000000, val: 246153846153846154, owned: 0, icon: 'ph_27', description: 'item_27_desc' },
    // ROI 60
    { id: 'item_28', name: 'Multiverse Chain', type: 'bps', basePrice: 500000000000000000000, val: 8333333333333333333, owned: 0, icon: 'ph_28', description: 'item_28_desc' },
    { id: 'item_29', name: 'Doppelgänger Worker', type: 'click', basePrice: 1000000000000000000000, val: 16666666666666666667, owned: 0, icon: 'ph_29', description: 'item_29_desc' },
    { id: 'item_30', name: 'Idea Roasting', type: 'bps', basePrice: 15000000000000000000000, val: 250000000000000000000, owned: 0, icon: 'ph_30', description: 'item_30_desc' },
    { id: 'item_31', name: 'Infinite Spoon', type: 'click', basePrice: 40000000000000000000000, val: 666666666666666666667, owned: 0, icon: 'ph_31', description: 'item_31_desc' },
    // ROI 55
    { id: 'item_32', name: 'Developer Console', type: 'bps', basePrice: 100000000000000000000000, val: 1818181818181818181818, owned: 0, icon: 'ph_32', description: 'item_32_desc' },
    { id: 'item_33', name: 'God of the Game', type: 'click', basePrice: 150000000000000000000000, val: 2727272727272727272727, owned: 0, icon: 'ph_33', description: 'item_33_desc' },
    { id: 'item_34', name: 'Planet Devourer', type: 'bps', basePrice: 5000000000000000000000000, val: 90909090909090909090909, owned: 0, icon: 'ph_34', description: 'item_34_desc' },
    { id: 'item_35', name: 'Cosmic Touch', type: 'click', basePrice: 10000000000000000000000000, val: 181818181818181818181818, owned: 0, icon: 'ph_35', description: 'item_35_desc' },
    // ROI 50 - End game (most efficient)
    { id: 'item_36', name: 'Eternal Time', type: 'bps', basePrice: 200000000000000000000000000, val: 4000000000000000000000000, owned: 0, icon: 'ph_36', description: 'item_36_desc' },
    { id: 'item_37', name: 'Creator\'s Touch', type: 'click', basePrice: 500000000000000000000000000, val: 10000000000000000000000000, owned: 0, icon: 'ph_37', description: 'item_37_desc' }
];

export const levels = ['Intern', 'Junior', 'Associate', 'Manager', 'Senior Manager', 'Director', 'VP', 'CEO', 'Coffee Mogul', 'Bean Minister', 'Planet President', 'Solar System Admin', 'Galaxy Overlord', 'Master of the Universe', 'The Coffee God'];
