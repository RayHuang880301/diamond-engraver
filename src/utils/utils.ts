import diamondReadableABI from "@solidstate/abi/DiamondReadable.json";
import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { FacetStructOutput } from "../type";

export const getExistingFacetAddresses = async (diamondAddr: string) => {
  const diamondReadable = await ethers.getContractAt(
    diamondReadableABI,
    diamondAddr
  );
  let existingFacetAddresses;
  try {
    existingFacetAddresses = await diamondReadable.facetAddresses();
  } catch (e: any) {
    throw new Error(
      `Error getting facet addresses from diamond contract: ${e.message}`
    );
  }
  return existingFacetAddresses;
};

export const getExistingFacets = async (diamondAddr: string) => {
  const diamondReadable = await ethers.getContractAt(
    diamondReadableABI,
    diamondAddr
  );
  let existingFacets;
  try {
    existingFacets = await diamondReadable.facets();
  } catch (e: any) {
    throw new Error(`Error getting facets from diamond contract: ${e.message}`);
  }
  return existingFacets;
};

export const getFnSelectorByFacetAddr = async (
  diamondAddr: string,
  facetAddr: string
): Promise<string> => {
  const diamondReadable = await ethers.getContractAt(
    diamondReadableABI,
    diamondAddr
  );
  let fnSelector;
  try {
    fnSelector = await diamondReadable.facetFunctionSelectors(facetAddr);
  } catch (e: any) {
    throw new Error(
      `Error getting function selector from diamond contract: ${e.message}`
    );
  }
  return fnSelector;
};

export const getFacetAddrByFnSelector = async (
  diamondAddr: string,
  fnSelector: string
): Promise<string> => {
  const diamondReadable = await ethers.getContractAt(
    diamondReadableABI,
    diamondAddr
  );
  let facetAddr;
  try {
    facetAddr = await diamondReadable.facetAddress(fnSelector);
  } catch (e: any) {
    throw new Error(
      `Error getting facet address from diamond contract: ${e.message}`
    );
  }
  return facetAddr;
};

export const safeFnSelectors = (
  targetSelectors: string[],
  existingFacet: FacetStructOutput
) => {
  // check no function selectors collision
  const selectors = existingFacet.selectors;
  for (const selector of selectors) {
    if (targetSelectors.includes(selector)) {
      throw new Error(
        `Function selector collision: ${selector} is already registered`
      );
    }
  }
};

export const getFnSelectors = async (
  contractOrContractFactory: Contract | ContractFactory
) => {
  try {
    const fnSelectors = Object.keys(
      contractOrContractFactory.interface.functions
    ).map((fn) => {
      const sl = contractOrContractFactory.interface.getSighash(fn);
      return sl;
    });
    return fnSelectors;
  } catch (e: any) {
    throw new Error(`Error getting function selectors: ${e.message}`);
  }
};
