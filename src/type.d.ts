export type DiamondCutAction = 0 | 1 | 2;

export type FacetStructOutput = {
  target: string;
  selectors: string[];
};

export type Facet = {
  target: string;
  action: DiamondCutAction;
  selectors: string[];
};
