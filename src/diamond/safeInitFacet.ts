import { BaseContract, ContractFactory, Signer, providers } from "ethers";
import { FunctionFragment } from "ethers/lib/utils";
import {
  getExistingFacets,
  getFnSelectors,
  safeFnSelectors,
} from "../utils/utils";
import { DIAMOND_CUT_ACTION } from "../config";
import { Facet } from "../type";

export const safeInitFacet = async (
  signer: Signer,
  provider: providers.Provider,
  diamond: BaseContract,
  targetAddr: string,
  targetFactory: ContractFactory,
  functionFragment: string | FunctionFragment,
  initData: string,
  onlyCall: boolean
) => {
  let facets: Facet[] = [];
  let targetSelectors: string[] = [];
  if (!onlyCall) {
    const bytecode = await provider.getCode(targetAddr);
    if (bytecode === "0x") {
      throw new Error("Target address is not a contract");
    }
    targetSelectors = await getFnSelectors(targetFactory);
    if (targetSelectors.length === 0) {
      throw new Error("No selectors found for target contract");
    }
    const existingFacets = await getExistingFacets(diamond.address, provider);
    for (const existingFacet of existingFacets) {
      safeFnSelectors(targetSelectors, existingFacet);
    }
    facets = [
      {
        target: targetAddr,
        action: DIAMOND_CUT_ACTION.ADD,
        selectors: targetSelectors,
      },
    ];
  }

  const functionCall = targetFactory.interface.encodeFunctionData(
    functionFragment,
    [initData]
  );

  // execute init function from init facet, only call once and not register functions
  const initTx = await diamond
    .connect(signer)
    .diamondCut(facets, targetAddr, functionCall);

  await initTx.wait();
  return targetSelectors;
};
