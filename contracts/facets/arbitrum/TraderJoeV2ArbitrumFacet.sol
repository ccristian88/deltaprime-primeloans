// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.17;

import "../TraderJoeV2Facet.sol";

contract TraderJoeV2ArbitrumFacet is TraderJoeV2Facet {
    function maxBinsPerPrimeAccount() public pure override returns (uint256) {
        return 0;
    }

    function getWhitelistedTraderJoeV2Pairs() internal pure override returns (ILBPair[] memory pools) {
        pools = new ILBPair[](12);
        // TJLB_DAI_USDCe
        pools[0] = ILBPair(0x500173F418137090dad96421811147b63b448A0f);
        // TJLB_ETH_USDT
        pools[1] = ILBPair(0xd387c40a72703B38A5181573724bcaF2Ce6038a5);
        // TJLB_ETH_USDCe
        pools[2] = ILBPair(0x94d53BE52706a155d27440C4a2434BEa772a6f7C);
        // TJLB_ARB_ETH
        pools[3] = ILBPair(0x0Be4aC7dA6cd4bAD60d96FbC6d091e1098aFA358);
        // TJLB_BTC_ETH
        pools[4] = ILBPair(0xcfA09B20c85933B197e8901226ad0D6dACa7f114);
        // TJLB_GMX_ETH
        pools[5] = ILBPair(0x60563686ca7b668e4a2d7D31448e5F10456ecaF8);
        // TJLB_WOO_ETH
        pools[6] = ILBPair(0xB87495219C432fc85161e4283DfF131692A528BD);
        // TJLB_JOE_ETH
        pools[7] = ILBPair(0x4b9bfeD1dD4E6780454b2B02213788f31FfBA74a);
        // TJLB_USDT_USDCe
        pools[8] = ILBPair(0x0242DD3b2e792CdBD399cc6195951bC202Aee97B);
        // TJLB_ETH_USDC
        pools[9] = ILBPair(0x69f1216cB2905bf0852f74624D5Fa7b5FC4dA710);
        // TJLB_GRAIL_ETH
        pools[10] = ILBPair(0x461761f2848EC6B9Fb3D3fb031e112c7d5b89563);
        // TJLB_MAGIC_ETH
        pools[11] = ILBPair(0xE847C55a3148580E864EC31E7273bc4eC25089c1);
    }
}
