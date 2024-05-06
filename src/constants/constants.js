export const PORTION_EGDE_CASES = {
    megabox: { min: 0.200, max: 0.333 },
    snackbox: { min: 0.100, max: 0.288 },
    friesBag: { min: 0.1, max: 0.192 },
    friesClamshell: { min: 0.118, max: 0.288 },
    friesScoop: {min: 0.120, max:  0.288}
}

export const FROZEN_PORTIONS_KG = {
    friesBag: 0.157,
    friesScoop: 0.22,
    snackbox: 0.157,
    megabox: 0.22,
}

export const COOKED_PORTIONS_KG = {
    friesBag: 0.118,
    friesScoop: 0.134, 
    snackbox: 0.118,
    megabox: 0.134, 
}

export const FROZEN_INVENTORY_WEIGHT_KG = {
    box: 15,
    bag: 1.5,
}

export const UNIT_TOGGLES = {
    weight: ["kg", "gr"],
    percent: ["%"],
    mult: ["ea", "10x", "100x"],
    format: ["box", "bag", "kg"],
  };

  export const PRICES = {
    friesBoxFrozen: 20.08,
    friesBag: 1.99,
    friesScoop: 2.69,
    snackbox: 2.99,
    megabox: 5.49,
  }