export type DiamondCutAction = 0 | 1 | 2;

export type FacetStructOutput = [string, string[]] & {
  target: string;
  selectors: string[];
};

export type Facets = {
  target: string;
  action: DiamondCutAction;
  selectors: string[];
};
