import {
  BaseContract,
  ContractFactory,
  Signer,
  constants,
  providers,
} from "ethers";
import { getExistingFacets, getFnSelectors } from "../utils/utils";
import { DIAMOND_CUT_ACTION } from "../config";

export const safeReplaceFacet = async (
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
  // check target address not registered
  for (const existingFacet of existingFacets) {
    if (existingFacet.target === targetAddr) {
      throw new Error(
        `Cannot replace facet: ${targetAddr} is already registered`
      );
    }
  }

  // check replace facet is registered
  for (const targetSelector of targetSelectors) {
    let found = false;
    for (const existingFacet of existingFacets) {
      if (existingFacet.selectors.includes(targetSelector)) {
        found = true;
        break;
      }
    }
    if (!found) {
      throw new Error(
        `Cannot replace facet: ${targetSelector} is not registered`
      );
    }
  }

  // check cannot remove immutable facets
  const diamondFnSelectors = await getFnSelectors(diamond);
  for (const selector of targetSelectors) {
    if (diamondFnSelectors.includes(selector)) {
      throw new Error(
        `Cannot remove immutable facet: ${selector} is already registered`
      );
    }
  }

  const facets = [
    {
      target: targetAddr,
      action: DIAMOND_CUT_ACTION.REPLACE,
      selectors: targetSelectors,
    },
  ];

  const tx = await diamond
    .connect(signer)
    .diamondCut(facets, constants.AddressZero, "0x");

  await tx.wait();
  return targetSelectors;
};
