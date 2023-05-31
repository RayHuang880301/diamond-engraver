import {
  BaseContract,
  ContractFactory,
  Signer,
  constants,
  providers,
} from "ethers";
import {
  getExistingFacets,
  getFnSelectors,
  safeFnSelectors,
} from "../utils/utils";
import { DIAMOND_CUT_ACTION } from "../config";

export const safeAddFacet = async (
  signer: Signer,
  provider: providers.Provider,
  diamond: BaseContract,
  targetAddr: string,
  targetFactory: ContractFactory
) => {
  const bytecode = await provider.getCode(targetAddr);
  if (bytecode === "0x") {
    throw new Error("Target address is not a contract");
  }
  const targetSelectors = await getFnSelectors(targetFactory);
  if (targetSelectors.length === 0) {
    throw new Error("No selectors found for target contract");
  }
  const existingFacets = await getExistingFacets(diamond.address, provider);
  for (const existingFacet of existingFacets) {
    safeFnSelectors(targetSelectors, existingFacet);
  }
  const facets = [
    {
      target: targetAddr,
      action: DIAMOND_CUT_ACTION.ADD,
      selectors: targetSelectors,
    },
  ];
  const tx = await diamond
    .connect(signer)
    .diamondCut(facets, constants.AddressZero, "0x");

  await tx.wait();
  return targetSelectors;
};
